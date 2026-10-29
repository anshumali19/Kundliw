import { z } from "zod";
import { isSafeImageSrc, isWebUrl } from "@/lib/content/media";

/** Home page hero: up to 10 slides, each with a picture, text, a YouTube link and an optional linked service. */
export const HERO_SLIDES_KEY = "heroSlides";
export const MAX_HERO_SLIDES = 10;

export interface HeroSlide {
  id: string;
  imageUrl: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  youtubeUrl: string;
  /** Slug of the service this slide promotes. Its picture is used when the slide has none. */
  serviceSlug: string;
  isActive: boolean;
  /** Heading colour (#rrggbb); empty keeps the theme gold */
  titleColor: string;
  /** Description text colour (#rrggbb); empty keeps the theme text colour */
  descColor: string;
  /** How the heading and description appear when the slide shows */
  animation: HeroAnimation;
  /** Animation speed */
  animSpeed: "slow" | "normal" | "fast";
}

export const HERO_ANIMATIONS = ["none", "rise", "fade", "slide", "zoom", "words", "letters", "wave", "typewriter"] as const;
export type HeroAnimation = (typeof HERO_ANIMATIONS)[number];

const text = (max: number) => z.string().trim().max(max).default("");

const slideSchema = z.object({
  id: z.string().trim().min(1).max(60),
  imageUrl: z
    .string()
    .trim()
    .max(600)
    .default("")
    .refine((v) => v === "" || isSafeImageSrc(v), "Image must be an uploaded file or a web address"),
  titleEn: text(160),
  titleHi: text(160),
  descEn: text(600),
  descHi: text(600),
  youtubeUrl: z
    .string()
    .trim()
    .max(500)
    .default("")
    .refine((v) => v === "" || isWebUrl(v), "YouTube link must start with https://"),
  serviceSlug: text(120),
  isActive: z.boolean().default(true),
  titleColor: z.string().trim().default("").refine((v) => v === "" || /^#[0-9a-fA-F]{6}$/.test(v), "Colour must look like #FFC105"),
  descColor: z.string().trim().default("").refine((v) => v === "" || /^#[0-9a-fA-F]{6}$/.test(v), "Colour must look like #261B17"),
  animation: z.enum(HERO_ANIMATIONS).default("rise"),
  animSpeed: z.enum(["slow", "normal", "fast"]).default("normal"),
});

export const heroSlidesSchema = z.object({ items: z.array(slideSchema).max(MAX_HERO_SLIDES, `At most ${MAX_HERO_SLIDES} slides`) });

/** Reads what is saved in the database into clean slides (bad rows are dropped). */
export function normalizeHeroSlides(raw: unknown): HeroSlide[] {
  const items = (raw as { items?: unknown })?.items;
  if (!Array.isArray(items)) return [];
  const out: HeroSlide[] = [];
  for (const row of items.slice(0, MAX_HERO_SLIDES)) {
    const r = slideSchema.safeParse(row);
    if (r.success) out.push(r.data);
  }
  return out;
}

/** A slide can be shown when it is switched on and has a picture (its own or its service's) and a title. */
export function slideIsShowable(s: HeroSlide, serviceImage?: string | null): boolean {
  if (!s.isActive) return false;
  if (!(s.titleEn.trim() || s.titleHi.trim())) return false;
  return !!(s.imageUrl || serviceImage);
}
