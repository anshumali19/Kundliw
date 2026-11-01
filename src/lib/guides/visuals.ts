import { prisma } from "@/lib/prisma";
import { normalizeDemos, type DemoItem } from "@/lib/content/demos";
import type { GuideSlug } from "@/lib/guides/defaults";

/** SiteConfig key holding the pictures and videos the admin attached to a guide. */
export const guideVisualsKey = (slug: GuideSlug) => `guide-visuals-${slug}`;

/** Pictures and videos for one guide, in the order the admin set. */
export async function loadGuideVisuals(slug: GuideSlug): Promise<DemoItem[]> {
  const row = await prisma.siteConfig.findUnique({ where: { key: guideVisualsKey(slug) } }).catch(() => null);
  return normalizeDemos(row?.value).filter((d) => d.kind === "image" || d.kind === "video");
}
