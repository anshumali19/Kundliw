"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

/** Hindi / English toggle. "dark" is for the maroon top bar, "light" for the cream main bar. */
export function LanguageSwitcher({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: "hi" | "en") => {
    if (newLocale !== locale) {
      router.replace(pathname, { locale: newLocale });
    }
  };

  const frame = tone === "dark" ? "border-gold/70" : "border-secondary/50";
  const on = tone === "dark" ? "bg-gold text-on-gold font-bold" : "bg-brand text-on-brand font-bold";
  const off = tone === "dark" ? "bg-transparent text-on-maroon hover:bg-white/10" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high";
  const base = "px-2.5 py-1 text-xs font-semibold tracking-wider transition-colors min-h-[32px] !min-w-0";

  return (
    <div className={`inline-flex items-center border ${frame} rounded overflow-hidden`} role="group" aria-label="Language selection">
      <button type="button" onClick={() => switchLanguage("hi")} className={`${base} ${locale === "hi" ? on : off}`} aria-pressed={locale === "hi"}>
        हिं
      </button>
      <button type="button" onClick={() => switchLanguage("en")} className={`${base} ${locale === "en" ? on : off}`} aria-pressed={locale === "en"}>
        EN
      </button>
    </div>
  );
}
