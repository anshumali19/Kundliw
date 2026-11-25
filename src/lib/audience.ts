import { prisma } from "@/lib/prisma";

/**
 * Where each item is shown: on the website, in the app, or in both (the default).
 * The admin chooses under Admin > Show where. Only the items that are NOT "both" are stored, in one
 * SiteConfig row, so nothing in the database needs to change.
 */
export const AUDIENCE_KEY = "audience";

export const AUDIENCE_KINDS = ["service", "otherService", "offer", "testimonial", "blog", "faq", "gallery", "marquee", "banner", "slide", "page"] as const;
export type AudienceKind = (typeof AUDIENCE_KINDS)[number];

/** "WEB" = the website only, "APP" = the app only. Anything else (or no entry) = both. */
export type Only = "WEB" | "APP";
export type AudienceMap = Partial<Record<AudienceKind, Record<string, Only>>>;
export type Viewer = "web" | "app";

/** A saved value read into a clean map: unknown kinds, ids and values are dropped. */
export function normalizeAudience(raw: unknown): AudienceMap {
  const out: AudienceMap = {};
  if (!raw || typeof raw !== "object") return out;
  for (const kind of AUDIENCE_KINDS) {
    const entries = (raw as Record<string, unknown>)[kind];
    if (!entries || typeof entries !== "object") continue;
    const clean: Record<string, Only> = {};
    for (const [id, v] of Object.entries(entries as Record<string, unknown>)) {
      if ((v === "WEB" || v === "APP") && id && id.length < 80) clean[id] = v;
    }
    if (Object.keys(clean).length > 0) out[kind] = clean;
  }
  return out;
}

/** True when the item may be shown to this viewer: it is for both, or only for this viewer. */
export function shownTo(map: AudienceMap, kind: AudienceKind, id: string, viewer: Viewer): boolean {
  const only = map[kind]?.[id];
  return !only || only === (viewer === "web" ? "WEB" : "APP");
}

/** The items this viewer may see. */
export function visibleItems<T extends { id: string }>(map: AudienceMap, kind: AudienceKind, viewer: Viewer, items: T[]): T[] {
  const entries = map[kind];
  return entries ? items.filter((i) => shownTo(map, kind, i.id, viewer)) : items;
}

export async function loadAudience(): Promise<AudienceMap> {
  // A failed read must never take a page down: everything is then shown, as if nothing was limited
  try {
    const row = await prisma.siteConfig.findUnique({ where: { key: AUDIENCE_KEY } });
    return normalizeAudience(row?.value);
  } catch {
    return {};
  }
}

/** Drop the items that are not meant for this viewer. One small read; never fails the page it is used in. */
export async function forViewer<T extends { id: string }>(kind: AudienceKind, viewer: Viewer, items: T[]): Promise<T[]> {
  if (items.length === 0) return items;
  return visibleItems(await loadAudience(), kind, viewer, items);
}

/** The ids of this kind that must not be shown to this viewer, for a `where: { id: { notIn } }` filter (works together with `take`). */
export function hiddenIds(map: AudienceMap, kind: AudienceKind, viewer: Viewer): string[] {
  const keep = viewer === "web" ? "WEB" : "APP";
  return Object.entries(map[kind] ?? {})
    .filter(([, only]) => only !== keep)
    .map(([id]) => id);
}

export async function hiddenFor(kind: AudienceKind, viewer: Viewer): Promise<string[]> {
  return hiddenIds(await loadAudience(), kind, viewer);
}
