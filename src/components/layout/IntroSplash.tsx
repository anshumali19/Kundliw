"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const KEY = "kjk_intro_seen";

/**
 * Opening screen: a dark panel with a turning ring and the Om mark, then it lifts away to reveal the site.
 * Shown once per visit, on the home page only. An inline script in the page head hides it straight away for
 * returning visits and other pages, so there is no flash.
 */
export function IntroSplash({
  isHindi,
  enabled = true,
  seconds = 7,
  title = "",
  titleHi = "",
  tagline = "",
  sub = "",
  symbol = "",
  logo = "",
  welcome = "",
}: {
  isHindi: boolean;
  enabled?: boolean;
  seconds?: number;
  title?: string;
  titleHi?: string;
  tagline?: string;
  sub?: string;
  symbol?: string;
  /** Logo image shown in place of the symbol (admin can change or clear it) */
  logo?: string;
  /** Welcome line at the bottom of the screen */
  welcome?: string;
}) {
  const pathname = usePathname() || "/";
  const onHome = /^\/(hi|en)?\/?$/.test(pathname);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!onHome || !enabled) return;
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
    const timer = setTimeout(() => finish(), reduce ? 700 : Math.min(12, Math.max(1, seconds)) * 1000 - 100);
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
  }, [onHome, enabled, seconds]);

  if (!onHome || !enabled || gone) return null;

  return (
    <div className={`intro-screen${done ? " is-done" : ""}`} role="dialog" aria-label="Maharshi Kanad Jyotish Kendra" aria-hidden={done}>
      <div className="intro-glow" />
      <div className="intro-ring" />
      <div className="intro-ring-inner" />
      <div className="intro-stack">
        <div className="intro-symbol" aria-hidden="true">{symbol || "ॐ"}</div>
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="intro-logo" src={logo} alt="Maharshi Kanad" />
        )}
        <div className="intro-copy">
          <div className="intro-title">
            {welcome || (isHindi ? "महर्षि कणाद ज्योतिष केंद्र में आपका स्वागत है" : "Welcome to Maharshi Kanad Jyotish Kendra")}
          </div>
          <div className="intro-hindi">{tagline || (isHindi ? "महर्षि कणाद ज्योतिष केंद्र" : "ज्योतिष • ज्ञान • मार्गदर्शन")}</div>
          <div className="intro-sub">{sub || "VEDIC ASTROLOGY & GUIDANCE"}</div>
          <div className="intro-loader" />
        </div>
      </div>
      <button type="button" className="intro-skip" onClick={() => (window as unknown as { __introFinish?: () => void }).__introFinish?.()}>
        {isHindi ? "वेबसाइट खोलें" : "ENTER WEBSITE"}&nbsp; ↗
      </button>
    </div>
  );
}
