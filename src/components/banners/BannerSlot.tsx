"use client";

import { useState, useEffect, useCallback, useId } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ChevronLeft, ChevronRight, Play, Pause, ExternalLink } from "lucide-react";

export interface BannerData {
  id: string;
  titleEn: string;
  titleHi: string;
  subtitleEn?: string | null;
  subtitleHi?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  position: "TOP" | "BOTTOM" | "LEFT" | "RIGHT";
  type: "STATIC" | "CAROUSEL";
  isActive: boolean;
  orderIndex: number;
}

interface BannerSlotProps {
  position: "TOP" | "BOTTOM" | "LEFT" | "RIGHT";
  initialBanners?: BannerData[];
  className?: string;
}

export function BannerSlot({ position, initialBanners, className = "" }: BannerSlotProps) {
  const [banners, setBanners] = useState<BannerData[]>(initialBanners || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loaded, setLoaded] = useState(!!initialBanners);

  // Fetch banners on client if not provided initially
  useEffect(() => {
    if (initialBanners && initialBanners.length > 0) {
      setBanners(initialBanners);
      setLoaded(true);
      return;
    }

    let isMounted = true;
    async function loadBanners() {
      try {
        const res = await fetch(`/api/banners?position=${position}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.banners) {
            setBanners(data.banners);
          }
        }
      } catch (err) {
        // Silently fail on network error, slot renders null
      } finally {
        if (isMounted) setLoaded(true);
      }
    }

    loadBanners();
    return () => {
      isMounted = false;
    };
  }, [position, initialBanners]);

  const total = banners.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto rotation timer (works continuously without needing hover)
  useEffect(() => {
    if (!isPlaying || total <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [isPlaying, total, nextSlide]);

  if (!loaded || total === 0) {
    return null;
  }

  const current = banners[currentIndex];
  const isCarousel = total > 1 || current.type === "CAROUSEL";

  // Top banner rendering (full width ribbon)
  if (position === "TOP") {
    return (
      <section
        aria-label="Promotional Announcement"
        className={`w-full bg-gradient-to-r from-surface-container-high via-surface-container-low to-surface-container-high border-b border-secondary/30 py-2.5 px-4 sm:px-8 lg:px-12 relative ${className}`}
      >
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-xs min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden text-left w-full sm:w-auto min-w-0 flex-1">
            <span className="px-2 py-0.5 bg-brand text-on-brand rounded text-[10px] font-bold uppercase tracking-wider shrink-0">
              विशेष
            </span>
            <div className="truncate min-w-0 flex-1">
              <span className="font-serif font-bold text-secondary mr-2">
                {current.titleHi} • {current.titleEn}
              </span>
              {(current.subtitleHi || current.subtitleEn) && (
                <span className="text-on-surface-variant hidden md:inline">
                  ({current.subtitleHi || current.subtitleEn})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-outline-variant/30">
            {current.linkUrl && (
              <Link
                href={current.linkUrl}
                className="inline-flex items-center gap-1 px-3 py-1 bg-brand text-on-brand font-bold rounded text-[11px] uppercase tracking-wider hover:opacity-90 transition-opacity min-h-[44px]"
              >
                <span>विवरण देखें</span>
                <span className="font-serif text-sm">→</span>
              </Link>
            )}

            {isCarousel && (
              <div className="flex items-center gap-1 pl-2 sm:border-l sm:border-outline-variant/40">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous Banner"
                  className="w-11 h-11 flex items-center justify-center text-on-surface hover:text-primary rounded"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? "Pause rotation" : "Play rotation"}
                  className="w-11 h-11 flex items-center justify-center text-on-surface hover:text-primary rounded text-[10px]"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next Banner"
                  className="w-11 h-11 flex items-center justify-center text-on-surface hover:text-primary rounded"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Bottom banner rendering (pre-footer callout card)
  if (position === "BOTTOM") {
    return (
      <section
        aria-label="Kendra Notice"
        className={`w-full px-4 sm:px-8 lg:px-12 my-8 ${className}`}
      >
        <div className="p-5 sm:p-6 bg-surface-container-low border-2 border-secondary/30 rounded flex flex-col md:flex-row items-center justify-between gap-4 text-left">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-brand/20 text-primary text-[10px] font-bold uppercase rounded">
                Kendra Update
              </span>
              <span className="text-xs text-outline">
                {currentIndex + 1} / {total}
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-secondary">
              {current.titleHi} • {current.titleEn}
            </h3>
            {(current.subtitleHi || current.subtitleEn) && (
              <p className="text-xs text-on-surface-variant">
                {current.subtitleHi || current.subtitleEn}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {current.linkUrl && (
              <Link
                href={current.linkUrl}
                className="px-5 py-2.5 bg-brand text-on-brand text-xs uppercase tracking-wider font-bold rounded hover:bg-brand-hover transition-colors min-h-[44px] flex items-center justify-center"
              >
                विस्तृत जानकारी
              </Link>
            )}

            {isCarousel && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous Slide"
                  className="w-11 h-11 flex items-center justify-center border border-outline-variant/60 rounded text-secondary hover:bg-surface-container"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next Slide"
                  className="w-11 h-11 flex items-center justify-center border border-outline-variant/60 rounded text-secondary hover:bg-surface-container"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Left & Right sidebar/column banner cards
  return (
    <aside
      aria-label={`${position} Promotional Banner`}
      className={`h-full w-full bg-surface-container-lowest border-2 border-secondary/40 rounded p-5 flex flex-col justify-between text-left relative overflow-hidden shadow-sm hover:border-secondary transition-colors ${className}`}
    >
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-[10px] text-outline uppercase font-bold">
          <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed rounded font-semibold">
            विशेष सूचना • Notice
          </span>
          {isCarousel && (
            <span className="font-mono text-outline">
              {currentIndex + 1} / {total}
            </span>
          )}
        </div>
        <h4 className="font-serif text-lg font-bold text-secondary leading-snug">
          {current.titleHi}
        </h4>
        <div className="text-xs font-semibold text-primary">
          {current.titleEn}
        </div>
        {(current.subtitleHi || current.subtitleEn) && (
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {current.subtitleHi || current.subtitleEn}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between gap-3">
        {current.linkUrl ? (
          <Link
            href={current.linkUrl}
            className="text-xs font-bold text-primary hover:underline uppercase tracking-wider inline-flex items-center gap-1.5 min-h-[44px]"
          >
            <span>विवरण देखें • Explore</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <div />
        )}

        {isCarousel && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous"
              className="w-11 h-11 flex items-center justify-center rounded border border-outline-variant/50 text-secondary hover:bg-surface-container text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next"
              className="w-11 h-11 flex items-center justify-center rounded border border-outline-variant/50 text-secondary hover:bg-surface-container text-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
