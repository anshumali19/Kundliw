"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

/**
 * Back and Next strip for pages people reach in the middle of a journey (booking, payment, tickets).
 * Back returns to the page the visitor came from; when there is none (a bookmark or a new tab) it goes to `fallbackHref`.
 */
export function BackBar({
  fallbackHref,
  backLabel,
  nextHref,
  nextLabel,
}: {
  fallbackHref: string;
  backLabel: string;
  nextHref?: string;
  nextLabel?: string;
}) {
  const router = useRouter();
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-left">
      <button
        type="button"
        onClick={goBack}
        className="inline-flex min-h-[44px] items-center gap-2 rounded border border-outline-variant bg-surface px-4 text-xs font-bold uppercase tracking-wider text-secondary hover:bg-surface-container-high"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {backLabel}
      </button>
      {nextHref && nextLabel && (
        <Link
          href={nextHref as never}
          className="inline-flex min-h-[44px] items-center gap-2 rounded border border-outline-variant bg-surface px-4 text-xs font-bold uppercase tracking-wider text-secondary hover:bg-surface-container-high"
        >
          {nextLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
