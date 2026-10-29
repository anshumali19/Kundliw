import { prisma } from "@/lib/prisma";

export interface PlanTitles {
  titleEn: string;
  titleHi: string;
}

/** Titles of the extra plans booked together with an order's first plan, keyed by plan id. */
export async function loadPlanTitleMap(ids: string[] | null | undefined): Promise<Map<string, PlanTitles>> {
  const unique = Array.from(new Set((ids ?? []).filter(Boolean)));
  if (unique.length === 0) return new Map();
  const rows = await prisma.plan.findMany({ where: { id: { in: unique } }, select: { id: true, titleEn: true, titleHi: true } }).catch(() => []);
  return new Map(rows.map((r) => [r.id, { titleEn: r.titleEn, titleHi: r.titleHi }]));
}

/** "Audio Basic + Video Premium": the first plan followed by any plans booked with it. */
export function bundleTitle(
  order: { plan?: PlanTitles | null; extraPlanIds?: string[] | null },
  map: Map<string, PlanTitles>,
  hindi: boolean,
  fallback = ""
): string {
  const pick = (t?: PlanTitles | null) => (t ? (hindi ? t.titleHi : t.titleEn) : "");
  const names = [pick(order.plan), ...(order.extraPlanIds ?? []).map((id) => pick(map.get(id)))].filter(Boolean);
  return names.length ? names.join(" + ") : fallback;
}
