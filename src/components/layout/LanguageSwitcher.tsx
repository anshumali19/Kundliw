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
  // Hindi is saffron and English is a soft red; the chosen language is bold with a light inner line.
  // A colour set in Admin > Website settings > Theme (language switch) still overrides both.
  // Deep saffron for Hindi and deep red for English, both with pure white text (white on this saffron is 4.7:1, readable).
  // The old light saffron (246 166 35) gave only 2:1, so the Hindi label was hard to read.
  const hiColour = "bg-[rgb(var(--btn-lang-hi-rgb,190_85_0))] !text-white";
  const enColour = "bg-[rgb(var(--btn-lang-en-rgb,158_43_37))] text-[rgb(var(--on-btn-lang-en-rgb,255_255_255))]";
  const chosen = "font-bold ring-2 ring-inset ring-white/80";
  // The button that is not selected is not faded: fading made the white text hard to read. Selected = bold + inner ring.
  const notChosen = "hover:brightness-110";
  const base = "px-3 py-1 text-xs font-semibold tracking-wider transition-colors min-h-[40px] min-w-[40px] !min-w-0";
  const on = "";
  const off = "";

  return (
    <div className={`inline-flex items-center border ${frame} rounded overflow-hidden`} role="group" aria-label="Language selection">
      <button type="button" onClick={() => switchLanguage("hi")} className={`${base} ${hiColour} ${locale === "hi" ? chosen : notChosen}${on}${off}`} aria-pressed={locale === "hi"}>
        हिन्दी
      </button>
      <button type="button" onClick={() => switchLanguage("en")} className={`${base} ${enColour} ${locale === "en" ? chosen : notChosen}${on}${off}`} aria-pressed={locale === "en"}>
        EN
      </button>
    </div>
  );
}
