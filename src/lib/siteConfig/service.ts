import { prisma } from "@/lib/prisma";
import {
  SECTIONS,
  completeSocial,
  defaultsFor,
  type SectionValues,
  type SocialLink,
} from "./definitions";

type Row = { key: string; value: unknown };

async function loadRows(): Promise<Row[]> {
  try {
    return await prisma.siteConfig.findMany();
  } catch {
    // Before the database update has run, fall back to the standard wording.
    return [];
  }
}

/** Every section with saved values laid over the defaults. */
export async function getSiteConfig(): Promise<{ sections: Record<string, SectionValues>; social: SocialLink[] }> {
  const rows = await loadRows();
  const byKey = new Map(rows.map((r) => [r.key, r.value as Record<string, unknown>]));
  const sections: Record<string, SectionValues> = {};
  for (const s of SECTIONS) {
    const saved = byKey.get(s.id) ?? {};
    sections[s.id] = { ...defaultsFor(s), ...(saved as SectionValues) };
  }

  let items = (byKey.get("social") as { items?: SocialLink[] } | undefined)?.items;
  if (!items) {
    // Nothing saved yet: start from the links entered earlier in Settings.
    const legacy = await prisma.adminSettings
      .findUnique({
        where: { id: "default" },
        select: {
          socialFacebook: true,
          socialInstagram: true,
          socialYoutube: true,
          socialTwitter: true,
          socialWhatsapp: true,
          socialTelegram: true,
        },
      })
      .catch(() => null);
    const pick: Record<string, string | null | undefined> = {
      facebook: legacy?.socialFacebook,
      instagram: legacy?.socialInstagram,
      youtube: legacy?.socialYoutube,
      twitter: legacy?.socialTwitter,
      whatsapp: legacy?.socialWhatsapp,
      telegram: legacy?.socialTelegram,
    };
    items = completeSocial(null).map((p) => {
      const url = pick[p.id];
      return url && /^https?:\/\//i.test(url) ? { ...p, url, active: true } : p;
    });
  }
  return { sections, social: completeSocial(items) };
}

/** Links that are switched on and have an address – what visitors see. */
export async function getActiveSocialLinks(): Promise<SocialLink[]> {
  const { social } = await getSiteConfig();
  return social.filter((s) => s.active && s.url);
}

export async function getSection(id: string): Promise<SectionValues> {
  const { sections } = await getSiteConfig();
  return sections[id] ?? {};
}
