import type { Metadata } from "next";

export const SITE_NAME = "Maharshi Kanad Jyotish Kendra";
export const SITE_NAME_HI = "महर्षि कणाद ज्योतिष केंद्र";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "https://kanadjyotishkendra.vercel.app"
).replace(/\/$/, "");

export const LOCALES = ["hi", "en"] as const;
export type SiteLocale = (typeof LOCALES)[number];

/** Hindi is the default locale and has no URL prefix (localePrefix: "as-needed"). */
export function localizedPath(locale: string, path = ""): string {
  const clean = path === "/" ? "" : path;
  if (locale === "en") return `/en${clean}` || "/en";
  return clean || "/";
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

/** Canonical + hreflang alternates for a route that exists in both languages. */
export function pageAlternates(locale: string, path = ""): NonNullable<Metadata["alternates"]> {
  return {
    canonical: absoluteUrl(localizedPath(locale, path)),
    languages: {
      hi: absoluteUrl(localizedPath("hi", path)),
      en: absoluteUrl(localizedPath("en", path)),
      "x-default": absoluteUrl(localizedPath("hi", path)),
    },
  };
}

/** Serialises structured data so it cannot break out of the script element. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
