"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: "hi" | "en") => {
    if (newLocale !== locale) {
      router.replace(pathname, { locale: newLocale });
    }
  };

  return (
    <div
      className="inline-flex items-center border border-secondary rounded overflow-hidden"
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => switchLanguage("hi")}
        className={`px-2.5 py-1 text-xs font-semibold tracking-wider transition-colors min-h-[36px] sm:min-h-[28px] ${
          locale === "hi"
            ? "bg-brand text-on-brand font-bold"
            : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
        }`}
        aria-pressed={locale === "hi"}
      >
        हिं
      </button>
      <button
        type="button"
        onClick={() => switchLanguage("en")}
        className={`px-2.5 py-1 text-xs font-semibold tracking-wider transition-colors min-h-[36px] sm:min-h-[28px] ${
          locale === "en"
            ? "bg-brand text-on-brand font-bold"
            : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
        }`}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
