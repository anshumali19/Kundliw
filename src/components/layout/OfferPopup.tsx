"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";
import { safeHref } from "@/lib/content/richText";
import { Check, Copy, Percent, X } from "lucide-react";

interface PopupOffer {
  code: string;
  titleEn: string;
  titleHi: string;
  discountEn: string;
  discountHi: string;
  minOrder: string;
  validUntil: string;
  auto: boolean;
  appliesToEn: string;
  appliesToHi: string;
}

interface PopupConfig {
  delaySeconds: number;
  repeatHours: number;
  homeOnly: boolean;
  showList: boolean;
  titleEn: string;
  titleHi: string;
  introEn: string;
  introHi: string;
  ctaLabelEn: string;
  ctaLabelHi: string;
  ctaLink: string;
  showWhenNoOffers: boolean;
}

const SEEN_KEY = "kjk_offer_popup";

function readSeen(): { at: number; sig: string } | null {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * The offers pop-up visitors see when the site opens. Everything (wording, delay, how often,
 * which offers) is controlled from Admin → Website settings → Offers pop-up and Admin → Offers.
 * The visitor can close it with the cross, the Close button, the Escape key or a click outside.
 */
export function OfferPopup() {
  const hi = useLocale() === "hi";
  const pathname = usePathname() || "";
  const [data, setData] = useState<{ offers: PopupOffer[]; config: PopupConfig } | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const shownRef = useRef(false);

  // Pop-up is for visitors: never over the admin console, the sign-in screens or a payment page
  const skip = /\/(admin|auth|demo-gate)(\/|$)/.test(pathname) || /\/booking\/checkout/.test(pathname);
  const isHome = /^\/(en|hi)?\/?$/.test(pathname);

  useEffect(() => {
    if (skip || shownRef.current) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    fetch("/api/offers/popup")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !d?.enabled) return;
        const cfg: PopupConfig = d.config;
        const offers: PopupOffer[] = d.offers ?? [];
        if (cfg.homeOnly && !isHome) return;
        if (offers.length === 0 && !cfg.showWhenNoOffers) return;
        const sig = offers.map((o) => o.code).join("|");
        const seen = readSeen();
        const fresh = !seen || seen.sig !== sig || (cfg.repeatHours > 0 ? Date.now() - seen.at > cfg.repeatHours * 3600_000 : true);
        if (!fresh) return;
        setData({ offers, config: cfg });
        timer = setTimeout(() => {
          if (cancelled) return;
          shownRef.current = true;
          setOpen(true);
        }, cfg.delaySeconds * 1000);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [skip, isHome]);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify({ at: Date.now(), sig: (data?.offers ?? []).map((o) => o.code).join("|") }));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || !data || skip) return null;
  const { offers, config } = data;
  const pick = (en: string, hin: string) => (hi ? hin || en : en || hin);
  const title = pick(config.titleEn, config.titleHi) || (hi ? "अभी चल रहे ऑफर" : "Offers running now");
  const intro = pick(config.introEn, config.introHi);
  const ctaLabel = pick(config.ctaLabelEn, config.ctaLabelHi) || (hi ? "अभी बुक करें" : "Book now");
  const cta = safeHref(config.ctaLink);

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 bg-black/55" aria-label={hi ? "बंद करें" : "Close"} onClick={close} />
      <div className="relative w-full max-w-md max-h-[88dvh] overflow-y-auto rounded-2xl bg-surface border-t-4 border-brand shadow-2xl text-left">
        <button
          type="button"
          onClick={close}
          aria-label={hi ? "बंद करें" : "Close"}
          className="absolute right-2 top-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full hover:bg-surface-container"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 pr-12">
          <h2 className="font-serif text-xl font-bold text-secondary flex items-center gap-2">
            <Percent className="w-5 h-5 text-primary shrink-0" />
            {title}
          </h2>
          {intro && <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">{intro}</p>}
        </div>

        {config.showList && offers.length > 0 && (
          <ul className="px-5 pb-2 space-y-2.5">
            {offers.map((o) => (
              <li key={o.code} className="rounded-lg border border-outline-variant/70 bg-surface-container-lowest p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-secondary text-sm">{pick(o.titleEn, o.titleHi)}</div>
                    <div className="text-primary font-bold text-sm mt-0.5">{hi ? o.discountHi : o.discountEn}</div>
                  </div>
                  {o.auto ? (
                    <span className="shrink-0 rounded-full bg-tertiary-container text-on-tertiary-container px-2 py-1 text-[10px] font-bold uppercase">
                      {hi ? "अपने आप लागू" : "Applied automatically"}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => copy(o.code)}
                      className="shrink-0 inline-flex items-center gap-1 rounded border border-dashed border-primary px-2 py-1 font-mono text-xs font-bold text-primary hover:bg-primary/10"
                      aria-label={hi ? `कोड ${o.code} कॉपी करें` : `Copy code ${o.code}`}
                    >
                      {o.code}
                      {copied === o.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                <div className="mt-1.5 text-[11px] text-on-surface-variant space-y-0.5">
                  {(hi ? o.appliesToHi : o.appliesToEn) && <div>{hi ? "इन पर:" : "On:"} {hi ? o.appliesToHi : o.appliesToEn}</div>}
                  {o.minOrder && <div>{hi ? "न्यूनतम ऑर्डर:" : "Minimum order:"} {o.minOrder}</div>}
                  {o.validUntil && <div>{hi ? "मान्य:" : "Valid until"} {o.validUntil}</div>}
                  {!o.auto && <div>{hi ? "बुकिंग में यह कोड डालें।" : "Enter this code while booking."}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="p-5 pt-3 flex flex-wrap items-center gap-2">
          {cta &&
            (cta.external ? (
              <a href={cta.href} target="_blank" rel="noopener noreferrer" onClick={close} className="inline-flex items-center justify-center min-h-[44px] px-5 rounded bg-brand hover:bg-brand-hover text-on-brand text-xs font-bold uppercase tracking-wider">
                {ctaLabel}
              </a>
            ) : (
              <Link href={cta.href as never} onClick={close} className="inline-flex items-center justify-center min-h-[44px] px-5 rounded bg-brand hover:bg-brand-hover text-on-brand text-xs font-bold uppercase tracking-wider">
                {ctaLabel}
              </Link>
            ))}
          <button type="button" onClick={close} className="min-h-[44px] px-4 rounded border border-outline-variant text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container">
            {hi ? "बंद करें" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
