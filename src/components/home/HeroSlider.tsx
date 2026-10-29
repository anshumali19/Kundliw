"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Play } from "lucide-react";
import { Link } from "@/i18n/routing";

export interface HeroSlideView {
  id: string;
  image: string;
  title: string;
  desc: string;
  youtubeUrl: string;
  /** Page of the linked service, when one is chosen */
  serviceHref: string;
}

interface Props {
  slides: HeroSlideView[];
  isHindi: boolean;
  overlay: number;
  intervalMs?: number;
}

/** Home page hero: pictures that change on their own, with arrows, dots, swipe and a YouTube button. */
export function HeroSlider({ slides, isHindi, overlay, intervalMs = 6500 }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback((n: number) => setIndex(((n % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(t);
  }, [count, paused, intervalMs]);

  const dim = Math.min(0.9, Math.max(0, overlay / 100));
  const cur = slides[index];

  return (
    <section
      id="home"
      aria-roledescription="carousel"
      aria-label={isHindi ? "मुख्य स्लाइड" : "Featured slides"}
      className="relative min-h-[620px] sm:min-h-[600px] lg:min-h-[600px] bg-maroon-deep overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
      }}
    >
      {slides.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={s.id}
          src={s.image}
          alt=""
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{ background: `linear-gradient(90deg, rgba(30,12,7,${Math.min(0.9, dim + 0.15).toFixed(2)}), rgba(30,12,7,${(dim * 0.35).toFixed(2)}) 60%, rgba(30,12,7,0.05))` }}
      />

      <div className="relative mx-auto flex min-h-[620px] sm:min-h-[600px] lg:min-h-[600px] w-full max-w-[1240px] flex-col justify-center px-5 sm:px-8 pt-12 pb-28">
        <div key={cur.id} className="max-w-3xl hero-rise" aria-live="polite">
          <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl leading-[1.1] mb-5 text-gold drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">{cur.title}</h1>
          {cur.desc && (
            <p className="max-w-2xl rounded-xl bg-white/85 px-4 py-3 text-[15px] sm:text-base leading-relaxed text-on-surface shadow-lg mb-6">{cur.desc}</p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {cur.serviceHref && (
              <Link href={cur.serviceHref} className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-lg bg-gold text-on-gold text-sm font-bold hover:brightness-110">
                {isHindi ? "सेवा देखें" : "View service"}
              </Link>
            )}
            <Link href="/contact#enquiry" className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-lg bg-brand text-on-brand text-sm font-bold hover:bg-brand-hover">
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              {isHindi ? "पूछताछ भेजें" : "Send enquiry"}
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-0 right-0 flex flex-col items-center gap-3 px-4">
        {cur.youtubeUrl && (
          <a
            href={cur.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-lg bg-white/90 text-on-surface text-sm font-bold shadow hover:bg-white"
          >
            <Play className="w-4 h-4 text-primary" aria-hidden="true" />
            {isHindi ? "YouTube पर देखें" : "Watch on YouTube"}
          </a>
        )}
        {count > 1 && (
          <div className="flex items-center gap-1.5 rounded-xl bg-white/75 p-1.5 shadow">
            <button type="button" onClick={() => go(index - 1)} aria-label={isHindi ? "पिछली स्लाइड" : "Previous slide"} className="min-h-[44px] min-w-[44px] grid place-items-center rounded-lg hover:bg-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`${isHindi ? "स्लाइड" : "Slide"} ${i + 1}`}
                aria-current={i === index}
                className="min-h-[44px] min-w-[36px] grid place-items-center rounded-lg hover:bg-white"
              >
                <span className={`block rounded-full ${i === index ? "h-3.5 w-3.5 bg-brand" : "h-2.5 w-2.5 bg-secondary/70"}`} />
              </button>
            ))}
            <button type="button" onClick={() => go(index + 1)} aria-label={isHindi ? "अगली स्लाइड" : "Next slide"} className="min-h-[44px] min-w-[44px] grid place-items-center rounded-lg hover:bg-white">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
