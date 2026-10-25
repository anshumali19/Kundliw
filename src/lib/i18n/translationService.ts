import { prisma } from "@/lib/prisma";

// In-memory cache for merged messages per locale
interface CacheEntry {
  messages: Record<string, any>;
  timestamp: number;
}

const translationCache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 30 * 1000; // 30 seconds TTL

/**
 * Set a nested value on an object given a namespace and a key (supports dot-notation).
 * Example: setDeepValue(messages, "nav", "about.founder", "Founder Details")
 */
export function setDeepValue(obj: Record<string, any>, namespace: string, key: string, value: string): void {
  if (!obj[namespace]) {
    obj[namespace] = {};
  }

  const parts = key.split(".");
  let current = obj[namespace];

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== "object") {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}

/**
 * Invalidate the translation cache for a specific locale, or all locales.
 */
export function invalidateTranslationCache(locale?: string): void {
  if (locale) {
    delete translationCache[locale];
  } else {
    for (const key of Object.keys(translationCache)) {
      delete translationCache[key];
    }
  }
}

/**
 * Retrieves the base JSON dictionary for a locale.
 */
export async function getBaseDictionary(locale: string): Promise<Record<string, any>> {
  try {
    const base = (await import(`../../../messages/${locale}.json`)).default;
    // Deep clone to prevent mutating static import cache
    return JSON.parse(JSON.stringify(base));
  } catch (error) {
    console.error(`[TranslationService] Failed to load base dictionary for ${locale}:`, error);
    return {};
  }
}

/**
 * Merges database overrides on top of the base JSON dictionary for a locale.
 * Always fails open by returning base dictionary if DB query encounters errors.
 */
export async function getMergedMessages(locale: string): Promise<Record<string, any>> {
  const normalizedLocale = locale === "hi" ? "hi" : "en";
  const now = Date.now();

  const cached = translationCache[normalizedLocale];
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.messages;
  }

  const baseMessages = await getBaseDictionary(normalizedLocale);

  try {
    const overrides = await prisma.translationOverride.findMany({
      where: { locale: normalizedLocale },
    });

    for (const override of overrides) {
      setDeepValue(baseMessages, override.namespace, override.key, override.value);
    }

    translationCache[normalizedLocale] = {
      messages: baseMessages,
      timestamp: now,
    };

    return baseMessages;
  } catch (error) {
    console.warn(`[TranslationService] Could not read overrides from database for ${normalizedLocale}. Using base dictionary.`, error);
    return baseMessages;
  }
}

/**
 * Flattens a nested dictionary into a list of { namespace, key, defaultValue } entries.
 */
function flattenObject(obj: Record<string, any>, prefix = ""): Array<{ key: string; value: string }> {
  const result: Array<{ key: string; value: string }> = [];

  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      result.push(...flattenObject(v, fullKey));
    } else if (typeof v === "string") {
      result.push({ key: fullKey, value: v });
    }
  }

  return result;
}

export interface TranslationItem {
  id?: string;
  locale: string;
  namespace: string;
  key: string;
  fullKey: string;
  defaultValue: string;
  currentValue: string;
  isOverridden: boolean;
  updatedAt?: string;
}

/**
 * Returns all available translation strings for an admin manager view,
 * combining base dictionary keys with active database overrides.
 */
export async function getAllTranslationsWithOverrides(locale: string): Promise<TranslationItem[]> {
  const normalizedLocale = locale === "hi" ? "hi" : "en";
  const baseDictionary = await getBaseDictionary(normalizedLocale);

  let overrides: Array<{
    id: string;
    locale: string;
    namespace: string;
    key: string;
    value: string;
    updatedAt: Date;
  }> = [];

  try {
    overrides = await prisma.translationOverride.findMany({
      where: { locale: normalizedLocale },
    });
  } catch (error) {
    console.warn(`[TranslationService] Could not fetch overrides for admin listing:`, error);
  }

  const overrideMap = new Map<string, { id: string; value: string; updatedAt: Date }>();
  for (const o of overrides) {
    overrideMap.set(`${o.namespace}:${o.key}`, { id: o.id, value: o.value, updatedAt: o.updatedAt });
  }

  const items: TranslationItem[] = [];

  for (const [namespace, content] of Object.entries(baseDictionary)) {
    if (typeof content === "object" && content !== null) {
      const flattened = flattenObject(content);
      for (const entry of flattened) {
        const mapKey = `${namespace}:${entry.key}`;
        const override = overrideMap.get(mapKey);

        items.push({
          id: override?.id,
          locale: normalizedLocale,
          namespace,
          key: entry.key,
          fullKey: `${namespace}.${entry.key}`,
          defaultValue: entry.value,
          currentValue: override ? override.value : entry.value,
          isOverridden: !!override,
          updatedAt: override?.updatedAt.toISOString(),
        });
      }
    }
  }

  return items;
}

/**
 * Upserts a translation override and invalidates cache.
 */
export async function saveTranslationOverride(data: {
  locale: string;
  namespace: string;
  key: string;
  value: string;
}) {
  const normalizedLocale = data.locale === "hi" ? "hi" : "en";
  const trimmedValue = data.value.trim();

  const result = await prisma.translationOverride.upsert({
    where: {
      locale_namespace_key: {
        locale: normalizedLocale,
        namespace: data.namespace,
        key: data.key,
      },
    },
    update: {
      value: trimmedValue,
    },
    create: {
      locale: normalizedLocale,
      namespace: data.namespace,
      key: data.key,
      value: trimmedValue,
    },
  });

  invalidateTranslationCache(normalizedLocale);
  return result;
}

/**
 * Bulk upserts translation overrides.
 */
export async function bulkSaveTranslationOverrides(
  overrides: Array<{ locale: string; namespace: string; key: string; value: string }>
) {
  const operations = overrides.map((item) => {
    const normalizedLocale = item.locale === "hi" ? "hi" : "en";
    const trimmedValue = item.value.trim();
    return prisma.translationOverride.upsert({
      where: {
        locale_namespace_key: {
          locale: normalizedLocale,
          namespace: item.namespace,
          key: item.key,
        },
      },
      update: { value: trimmedValue },
      create: {
        locale: normalizedLocale,
        namespace: item.namespace,
        key: item.key,
        value: trimmedValue,
      },
    });
  });

  const results = await prisma.$transaction(operations);
  invalidateTranslationCache();
  return results;
}

/**
 * Deletes an override, effectively resetting the key back to the base dictionary value.
 */
export async function deleteTranslationOverride(data: {
  locale: string;
  namespace: string;
  key: string;
}) {
  const normalizedLocale = data.locale === "hi" ? "hi" : "en";

  try {
    await prisma.translationOverride.delete({
      where: {
        locale_namespace_key: {
          locale: normalizedLocale,
          namespace: data.namespace,
          key: data.key,
        },
      },
    });
  } catch (error) {
    // If it didn't exist in DB, treat as success
    console.warn("[TranslationService] Override not found for deletion, skipping:", error);
  }

  invalidateTranslationCache(normalizedLocale);
  return { success: true };
}
