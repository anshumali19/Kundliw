"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Back and Next controls shown on every inner page (requirement 45).
 * They follow the browser or app history, so they work inside the Android app too.
 */
export function PageNavButtons() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const isHindi = locale === "hi";

  // Hidden on the home page, which has nothing to go back to
  const isHome = pathname === "/" || pathname === `/${locale}` || pathname === `/${locale}/`;
  // These pages already show their own breadcrumb bar with Back and Next
  const bare = (pathname || "").replace(/^\/(hi|en)(?=\/|$)/, "") || "/";
  const hasOwnNav = ["/services", "/other-services", "/kundli/astrosage"].some(
    (p) => bare === p || bare.startsWith(p + "/")
  );
  if (isHome || hasOwnNav) return null;

  const btn =
    "inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded border border-maroon bg-surface hover:bg-brand text-secondary text-sm font-bold transition-colors";

  return (
    <nav
      aria-label={isHindi ? "पेज नेविगेशन" : "Page navigation"}
      className="print:hidden w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 flex items-center justify-between"
    >
      <button type="button" onClick={() => router.back()} className={btn} aria-label={isHindi ? "पीछे" : "Back"}>
        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        <span>{isHindi ? "पीछे" : "Back"}</span>
      </button>
      <button type="button" onClick={() => router.forward()} className={btn} aria-label={isHindi ? "आगे" : "Next"}>
        <span>{isHindi ? "आगे" : "Next"}</span>
        <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </button>
    </nav>
  );
}
