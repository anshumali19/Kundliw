"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { useLocale } from "next-intl";

/** Admin signs out by itself after this long with no activity, like a bank app. */
const IDLE_MS = 5 * 60 * 1000;
/** The warning counts down for this long before signing out. */
const WARN_SECONDS = 60;
const KEY = "kjk_admin_last_active";
const EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click", "wheel"] as const;

function stamp(t: number) {
  try {
    localStorage.setItem(KEY, String(t));
  } catch {
    /* ignore */
  }
}

/** Newest activity seen in any open admin tab. */
function lastSeen(fallback: number) {
  try {
    const v = Number(localStorage.getItem(KEY));
    return Number.isFinite(v) && v > 0 ? Math.max(v, fallback) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Admin only. After 5 minutes of no activity a warning appears with a 1 minute countdown.
 * "OK" keeps the admin signed in; "Cancel" or letting the countdown finish signs out.
 * Uses clock time, so a sleeping or background tab still signs out on time.
 */
export function AdminIdleLogout() {
  const locale = useLocale();
  const hi = locale === "hi";
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const lastActive = useRef(Date.now());
  const warning = useRef(false);
  const done = useRef(false);

  const logout = useCallback(() => {
    if (done.current) return;
    done.current = true;
    void signOut({ callbackUrl: `/${locale}/auth/signin?callbackUrl=${encodeURIComponent("/admin")}` });
  }, [locale]);

  const stay = useCallback(() => {
    const now = Date.now();
    lastActive.current = now;
    stamp(now);
    warning.current = false;
    setSecondsLeft(null);
  }, []);

  useEffect(() => {
    stamp(Date.now());
    const onActivity = () => {
      // While the warning is up, only the OK button counts as "still here"
      if (warning.current) return;
      const now = Date.now();
      lastActive.current = now;
      stamp(now);
    };
    EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    const tick = setInterval(() => {
      if (done.current) return;
      const last = lastSeen(lastActive.current);
      const idleFor = Date.now() - last;
      if (idleFor < IDLE_MS) {
        if (warning.current) {
          // Another admin tab was used: this one stays signed in too
          warning.current = false;
          setSecondsLeft(null);
        }
        return;
      }
      warning.current = true;
      const left = Math.ceil((IDLE_MS + WARN_SECONDS * 1000 - idleFor) / 1000);
      if (left <= 0) {
        logout();
        return;
      }
      setSecondsLeft(left);
    }, 1000);

    return () => {
      clearInterval(tick);
      EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [logout]);

  if (secondsLeft === null) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" role="alertdialog" aria-modal="true" aria-labelledby="idle-title" aria-describedby="idle-desc">
      <div className="w-full max-w-sm rounded-xl bg-surface border-t-4 border-brand shadow-2xl p-6 text-left">
        <h2 id="idle-title" className="font-serif text-lg font-bold text-secondary">
          {hi ? "सत्र समाप्त होने वाला है" : "Are you still there?"}
        </h2>
        <p id="idle-desc" className="mt-2 text-sm text-on-surface-variant leading-relaxed">
          {hi
            ? "कुछ देर से कोई गतिविधि नहीं हुई। सुरक्षा के लिए आप"
            : "There has been no activity for a while. For your security you will be logged out after"}{" "}
          <strong className="text-primary tabular-nums">{secondsLeft} {hi ? "सेकंड" : secondsLeft === 1 ? "second" : "seconds"}</strong>
          {hi ? " में लॉग आउट हो जाएँगे।" : "."}
        </p>
        <p className="mt-2 text-sm text-on-surface">
          {hi ? "लॉग इन रहने के लिए OK दबाएँ।" : "Click OK to stay logged in."}
        </p>
        <div className="mt-5 flex items-center gap-2">
          <button type="button" autoFocus onClick={stay} className="min-h-[44px] px-6 rounded bg-brand hover:bg-brand-hover text-on-brand text-xs font-bold uppercase tracking-wider">
            OK
          </button>
          <button type="button" onClick={logout} className="min-h-[44px] px-5 rounded border border-outline-variant text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container">
            {hi ? "रद्द करें / लॉग आउट" : "Cancel (log out)"}
          </button>
        </div>
      </div>
    </div>
  );
}
