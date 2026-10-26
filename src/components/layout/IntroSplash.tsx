"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const KEY = "kjk_intro_seen";

/**
 * Opening screen: a dark panel with a turning ring and the Om mark, then it lifts away to reveal the site.
 * Shown once per visit, on the home page only. An inline script in the page head hides it straight away for
 * returning visits and other pages, so there is no flash.
 */
export function IntroSplash({ isHindi }: { isHindi: boolean }) {
  const pathname = usePathname() || "/";
  const onHome = /^\/(hi|en)?\/?$/.test(pathname);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!onHome) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      /* private mode: just show it */
    }
    if (seen) {
      setGone(true);
      return;
    }
    document.body.style.overflow = "hidden";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => finish(), reduce ? 700 : 2900);
    function finish() {
      setDone(true);
      document.body.style.overflow = "";
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
      setTimeout(() => setGone(true), 950);
    }
    (window as unknown as { __introFinish?: () => void }).__introFinish = finish;
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [onHome]);

  if (!onHome || gone) return null;

  return (
    <div className={`intro-screen${done ? " is-done" : ""}`} role="dialog" aria-label="Maharshi Kanad Jyotish Kendra" aria-hidden={done}>
      <div className="intro-glow" />
      <div className="intro-ring" />
      <div className="intro-ring-inner" />
      <div className="intro-symbol" aria-hidden="true">ॐ</div>
      <div className="intro-copy">
        <div className="intro-title">Maharshi Kanad Jyotish Kendra</div>
        <div className="intro-hindi">{isHindi ? "महर्षि कणाद ज्योतिष केंद्र" : "ज्योतिष • ज्ञान • मार्गदर्शन"}</div>
        <div className="intro-sub">VEDIC ASTROLOGY &amp; GUIDANCE</div>
        <div className="intro-loader" />
      </div>
      <button type="button" className="intro-skip" onClick={() => (window as unknown as { __introFinish?: () => void }).__introFinish?.()}>
        {isHindi ? "वेबसाइट खोलें" : "ENTER WEBSITE"}&nbsp; ↗
      </button>
    </div>
  );
}
