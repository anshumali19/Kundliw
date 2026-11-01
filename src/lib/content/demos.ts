import { z } from "zod";
import { isWebUrl } from "@/lib/content/media";

/** One demo the admin attaches to a service: a link, a picture, a short video or a social media account. */
export const DEMO_KINDS = ["link", "image", "video", "social"] as const;
export type DemoKind = (typeof DEMO_KINDS)[number];

export interface DemoItem {
  kind: DemoKind;
  labelEn: string;
  labelHi: string;
  url: string;
}

export const demoInputSchema = z.object({
  kind: z.enum(DEMO_KINDS),
  labelEn: z.string().trim().max(120).default(""),
  labelHi: z.string().trim().max(120).default(""),
  url: z.string().trim().max(1000).refine(isWebUrl, "Each demo needs a web address starting with https://"),
});

export const demosInputSchema = z.array(demoInputSchema).max(40);

/** Reads a saved JSON list into clean demos; anything that is not a web address is dropped. */
export function normalizeDemos(raw: unknown): DemoItem[] {
  if (!Array.isArray(raw)) return [];
  const out: DemoItem[] = [];
  for (const d of raw) {
    const r = (d ?? {}) as Record<string, unknown>;
    const kind = DEMO_KINDS.find((k) => k === r.kind);
    if (!kind || !isWebUrl(r.url)) continue;
    out.push({ kind, labelEn: String(r.labelEn ?? ""), labelHi: String(r.labelHi ?? r.labelEn ?? ""), url: String(r.url).trim() });
  }
  return out;
}
