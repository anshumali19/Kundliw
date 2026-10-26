"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Megaphone, ArrowRight, X } from "lucide-react";

interface MarqueeStripProps {
  items?: Array<{
    id: string;
    textEn: string;
    textHi: string;
    speedSec?: number;
    fontSize?: number;
    bgColor?: string;
    textColor?: string;
    pauseOnHover?: boolean;
    allowClose?: boolean;
  }>;
  position?: "TOP" | "BOTTOM";
}

// Admin-entered colours are applied as inline styles, so only well-formed values are accepted.
const SAFE_COLOR = /^(#[0-9a-fA-F]{3,8}|var\(--[a-z0-9-]+\)|rgba?\([\d\s.,%]+\)|[a-zA-Z]+)$/;
const safeColor = (value: string | undefined, fallback: string) =>
  value && SAFE_COLOR.test(value.trim()) ? value.trim() : fallback;

export function MarqueeStrip({ items, position = "BOTTOM" }: MarqueeStripProps) {
  const tMarquee = useTranslations("marquee");
  const locale = useLocale();

  // Visitors can close the strip; it stays closed for the rest of the visit.
  const storageKey = `kjk_marquee_closed_${position}`;
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem(storageKey) === "1") setClosed(true);
    } catch {
      // storage unavailable: keep the strip visible
    }
  }, [storageKey]);

  // Shown only until the admin adds an announcement under Admin > Marquee
  const defaultItems = [
    {
      id: "default",
      textEn: "Welcome to Maharshi Kanad Jyotish Kendra. Book Kundli, matching and consultations online.",
      textHi: "महर्षि कणाद ज्योतिष केंद्र में आपका स्वागत है। कुंडली, मिलान और परामर्श ऑनलाइन बुक करें।",
    },
  ];

  const displayList = items && items.length > 0 ? items : defaultItems;
  const style = items && items.length > 0 ? items[0] : undefined;

  // Maroon is reserved for the footer Quick Links, so legacy maroon marquee settings use the brand style.
  const LEGACY_MAROON = new Set(["var(--secondary)", "var(--primary)", "var(--maroon)", "#800000", "#6b1d1d"]);
  const configuredBg = style?.bgColor?.trim().toLowerCase();
  const useBrand = !configuredBg || LEGACY_MAROON.has(configuredBg);
  const background = useBrand ? "var(--brand)" : safeColor(style?.bgColor, "var(--brand)");
  const color = useBrand ? "var(--on-brand)" : safeColor(style?.textColor, "var(--on-brand)");
  const fontSize = Math.min(Math.max(style?.fontSize ?? 14, 12), 28);
  const speed = Math.min(Math.max(style?.speedSec ?? 30, 8), 120);
  const pauseOnHover = style?.pauseOnHover ?? true;
  const allowClose = style?.allowClose ?? true;

  if (closed) return null;

  // BOTTOM: fixed to the screen footer, above the mobile navigation bar.
  // TOP: a normal strip at the start of the page.
  const placement =
    position === "BOTTOM"
      ? "fixed inset-x-0 z-40 bottom-[calc(4rem+2px+env(safe-area-inset-bottom,0px))] xl:bottom-0 border-t-2 border-maroon"
      : "relative w-full border-b-2 border-maroon";

  return (
    <div
      className={`${placement} group py-2 overflow-hidden`}
      style={{ background, color }}
      role="region"
      aria-label="Announcements"
    >
      <div className="w-full px-3 sm:px-8 lg:px-12 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 shrink-0 bg-gold border border-maroon px-2.5 py-1 rounded text-on-gold text-xs font-bold uppercase tracking-wider">
          <Megaphone className="w-3.5 h-3.5" />
          <span>{tMarquee("badge")}</span>
        </div>

        <div className="relative overflow-hidden w-full flex items-center min-w-0 flex-1">
          <div
            className={`whitespace-nowrap animate-marquee flex items-center gap-8 tracking-wide font-semibold ${pauseOnHover ? "group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]" : ""}`}
            style={{ fontSize: `${fontSize}px`, animationDuration: `${speed}s` }}
          >
            {[0, 1].map((copy) =>
              displayList.map((item, index) => {
                const text = locale === "hi" ? item.textHi : item.textEn;
                return (
                  <span
                    key={`${item.id}-${copy}-${index}`}
                    className="flex items-center gap-8"
                    aria-hidden={copy === 1 ? "true" : undefined}
                  >
                    <span>{text}</span>
                    <span className="font-bold">•</span>
                  </span>
                );
              })
            )}
          </div>
        </div>

        <Link
          href="/services"
          className="shrink-0 hidden md:inline-flex items-center gap-1 text-xs uppercase tracking-wider hover:underline font-bold"
        >
          <span>{tMarquee("cta")}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {allowClose && (
          <button
            type="button"
            onClick={() => {
              setClosed(true);
              try {
                sessionStorage.setItem(storageKey, "1");
              } catch {
                // ignore
              }
            }}
            aria-label={tMarquee("close")}
            className="shrink-0 inline-flex items-center justify-center min-h-[36px] min-w-[36px] rounded-full hover:bg-black/15"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
