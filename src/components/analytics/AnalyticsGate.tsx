"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";

const KEY = "kjk_analytics_consent";
type Choice = "granted" | "denied" | null;

/**
 * Google Analytics runs only after the visitor says yes. The choice is kept in this browser,
 * and the banner offers Accept and Decline with the same weight.
 */
export function AnalyticsGate({ gaId }: { gaId: string }) {
  const isHindi = useLocale() === "hi";
  const [choice, setChoice] = useState<Choice>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "granted" || saved === "denied") setChoice(saved);
    } catch {
      /* private mode: ask each visit */
    }
    setReady(true);
  }, []);

  const decide = (c: "granted" | "denied") => {
    setChoice(c);
    try {
      localStorage.setItem(KEY, c);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {choice === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}
      {ready && choice === null && (
        <div
          role="dialog"
          aria-label={isHindi ? "कुकी और विश्लेषण की अनुमति" : "Cookie and analytics consent"}
          className="fixed left-3 right-3 bottom-[76px] md:bottom-4 md:left-4 md:right-auto md:max-w-md z-[60] rounded-xl border border-outline-variant bg-surface shadow-2xl p-4 text-left"
        >
          <p className="text-xs text-on-surface leading-relaxed">
            {isHindi
              ? "हम साइट को बेहतर बनाने के लिए गुमनाम विज़िट आँकड़े (Google Analytics) तभी इकट्ठा करते हैं जब आप अनुमति दें।"
              : "We collect anonymous visit statistics (Google Analytics) to improve the site, only if you allow it."}{" "}
            <Link href="/legal/privacy" className="inline-block py-2 font-bold text-primary underline">
              {isHindi ? "गोपनीयता नीति" : "Privacy Policy"}
            </Link>
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => decide("denied")} className="flex-1 min-h-[44px] rounded border-2 border-maroon text-maroon font-bold text-xs hover:bg-surface-container-high">
              {isHindi ? "मना करें" : "Decline"}
            </button>
            <button type="button" onClick={() => decide("granted")} className="flex-1 min-h-[44px] rounded bg-brand text-on-brand font-bold text-xs hover:bg-brand-hover">
              {isHindi ? "स्वीकार करें" : "Accept"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
