"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";

/**
 * A round back arrow fixed in the top-left corner of every page except the home page,
 * so a visitor can always return to where they came from, even on sign-in and register pages.
 * It follows the browser history; with no history (a new tab) it goes to the home page.
 */
export function BackCornerButton() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const isHindi = locale === "hi";

  const bare = (pathname || "").replace(/^\/(hi|en)(?=\/|$)/, "") || "/";
  if (bare === "/") return null;

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(`/${locale}`);
      }}
      aria-label={isHindi ? "पीछे जाएँ" : "Go back"}
      title={isHindi ? "पीछे जाएँ" : "Go back"}
      className="print:hidden fixed left-2 top-[128px] z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-maroon bg-surface text-secondary shadow-md transition-colors hover:bg-gold sm:left-4 sm:top-[140px]"
    >
      <ArrowLeft className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
