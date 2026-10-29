"use client";

import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

const KEY = "install-tip-dismissed";
const HIDE_DAYS = 14;

/**
 * A small dismissible tip that helps a visitor put the site on their phone's home screen.
 * Android gets a real Install button; iPhone gets the Share > Add to Home Screen steps.
 */
export function InstallPrompt({ title, text, installLabel, iosText, closeLabel }: { title: string; text: string; installLabel: string; iosText: string; closeLabel: string }) {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const at = Number(localStorage.getItem(KEY) || 0);
      if (at && Date.now() - at < HIDE_DAYS * 86400000) return;
    } catch {
      /* storage blocked: still show once per visit */
    }
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isIos) {
      timer = setTimeout(() => {
        setIos(true);
        setShow(true);
      }, 6000);
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
      timer = setTimeout(() => setShow(true), 6000);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  if (!show || (!event && !ios)) return null;

  return (
    <div role="dialog" aria-label={title} className="fixed left-3 right-3 bottom-20 lg:bottom-6 lg:left-6 lg:right-auto lg:max-w-sm z-40 rounded-xl border border-gold/60 bg-maroon text-white shadow-2xl p-4">
      <button type="button" onClick={dismiss} aria-label={closeLabel} className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full hover:bg-white/10">
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="flex gap-3 pr-8">
        <Smartphone className="h-6 w-6 shrink-0 text-gold mt-0.5" aria-hidden="true" />
        <div className="space-y-2 min-w-0">
          <div className="font-serif font-bold">{title}</div>
          <p className="text-xs text-white/80 leading-relaxed">{event ? text : iosText}</p>
          {event && (
            <button
              type="button"
              onClick={async () => {
                await event.prompt();
                await event.userChoice.catch(() => null);
                dismiss();
              }}
              className="min-h-[44px] px-5 rounded-lg bg-gold text-on-gold text-xs font-bold"
            >
              {installLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
