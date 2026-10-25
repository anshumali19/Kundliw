"use client";

import React from "react";
import { Link, useRouter } from "@/i18n/routing";
import { ArrowLeft, ArrowRight, ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface SubPageNavProps {
  breadcrumbs: BreadcrumbItem[];
  backHref?: string;
  backLabel?: string;
  nextHref?: string;
  nextLabel?: string;
  locale: string;
}

export function SubPageNav({
  breadcrumbs,
  backHref,
  backLabel,
  nextHref,
  nextLabel,
  locale,
}: SubPageNavProps) {
  const router = useRouter();
  const isHindi = locale === "hi";

  const defaultBackLabel = isHindi ? "वापस" : "Back";
  const defaultNextLabel = isHindi ? "अगला" : "Next";

  const handleBack = () => {
    if (backHref) {
      router.push(backHref as any);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <nav
      aria-label="Breadcrumb & Navigation"
      className="w-full bg-surface-container-low/70 border-b border-outline-variant/30 py-2.5 px-4 sm:px-6 lg:px-12"
    >
      <div className="w-full flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Breadcrumb Trail */}
        <ol className="flex items-center gap-1.5 flex-wrap text-on-surface-variant font-medium">
          <li>
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-primary transition-colors"
              title={isHindi ? "मुख्य पृष्ठ" : "Home"}
            >
              <Home className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">{isHindi ? "गृह" : "Home"}</span>
            </Link>
          </li>

          {breadcrumbs.map((item, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <li key={idx} className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-outline-variant shrink-0" />
                {item.href && !isLast ? (
                  <Link
                    href={item.href as any}
                    className="hover:text-primary transition-colors max-w-[140px] sm:max-w-xs truncate"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={`max-w-[160px] sm:max-w-sm truncate ${
                      isLast ? "font-bold text-secondary" : ""
                    }`}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        {/* Back and Next Action Buttons */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-outline-variant bg-surface text-on-surface hover:bg-surface-container hover:text-primary transition-colors text-xs font-semibold shadow-xs"
            aria-label={backLabel || defaultBackLabel}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{backLabel || defaultBackLabel}</span>
          </button>

          {nextHref && (
            <Link
              href={nextHref as any}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors text-xs font-semibold shadow-xs"
              aria-label={nextLabel || defaultNextLabel}
            >
              <span>{nextLabel || defaultNextLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
