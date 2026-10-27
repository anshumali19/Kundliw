"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";

interface CatalogPlan { id: string; slug: string; titleEn: string; titleHi: string; pricePaise: number }
interface CatalogService { slug: string; titleEn: string; titleHi: string; plans: CatalogPlan[] }
interface OfferChoice { code: string; titleEn: string; titleHi: string; discountFormatted: string }

const OTHER = "__other";
const field =
  "w-full min-h-[44px] rounded border border-outline-variant bg-surface px-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-brand";

/**
 * The Booking icon's drop-down list: Service, Plan, Offer, Referral code, then on to Payment
 * (Razorpay or UPI), where the order is submitted, confirmed and completed.
 */
export function QuickBookingPanel({ onDone }: { onDone?: () => void }) {
  const hi = useLocale() === "hi";
  const router = useRouter();
  const [services, setServices] = useState<CatalogService[] | null>(null);
  const [serviceSlug, setServiceSlug] = useState("");
  const [planSlug, setPlanSlug] = useState("");
  const [offers, setOffers] = useState<OfferChoice[]>([]);
  const [offer, setOffer] = useState("");
  const [typedOffer, setTypedOffer] = useState("");
  const [referral, setReferral] = useState("");

  useEffect(() => {
    let live = true;
    fetch("/api/booking/catalog")
      .then((r) => r.json())
      .then((d) => live && setServices(d.services ?? []))
      .catch(() => live && setServices([]));
    return () => {
      live = false;
    };
  }, []);

  const service = services?.find((s) => s.slug === serviceSlug);
  const plan = service?.plans.find((p) => p.slug === planSlug);
  const planId = plan?.id;

  useEffect(() => {
    if (!planId) return;
    let live = true;
    fetch(`/api/offers/available?planId=${encodeURIComponent(planId)}`)
      .then((r) => r.json())
      .then((d) => live && setOffers(d.offers ?? []))
      .catch(() => live && setOffers([]));
    return () => {
      live = false;
    };
  }, [planId]);

  const pick = (en: string, hin: string) => (hi ? hin || en : en || hin);
  const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

  const go = () => {
    if (!service || !plan) return;
    const code = (offer === OTHER ? typedOffer : offer).trim().toUpperCase();
    const q = new URLSearchParams({ service: service.slug, plan: plan.slug });
    if (code) q.set("offer", code);
    if (referral.trim()) q.set("ref", referral.trim().toUpperCase());
    onDone?.();
    router.push(`/booking?${q.toString()}` as never);
  };

  const label = "block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1";

  return (
    <div className="space-y-3 text-left">
      <p className="text-xs text-on-surface-variant">
        {hi
          ? "सेवा → प्लान → ऑफर → रेफरल कोड → भुगतान (Razorpay / UPI)"
          : "Service → Plan → Offer → Referral code → Payment (Razorpay / UPI)"}
      </p>

      <div>
        <label className={label} htmlFor="qb-service">1. {hi ? "सेवा" : "Service"}</label>
        <select
          id="qb-service"
          className={field}
          value={serviceSlug}
          disabled={services === null}
          onChange={(e) => {
            setServiceSlug(e.target.value);
            setPlanSlug("");
            setOffer("");
            setOffers([]);
          }}
        >
          <option value="">{services === null ? (hi ? "लोड हो रहा है…" : "Loading…") : hi ? "सेवा चुनें" : "Choose a service"}</option>
          {(services ?? []).map((s) => (
            <option key={s.slug} value={s.slug}>{pick(s.titleEn, s.titleHi)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={label} htmlFor="qb-plan">2. {hi ? "प्लान" : "Plan"}</label>
        <select
          id="qb-plan"
          className={field}
          value={planSlug}
          disabled={!service}
          onChange={(e) => {
            setPlanSlug(e.target.value);
            setOffer("");
            setOffers([]);
          }}
        >
          <option value="">{hi ? "प्लान चुनें" : "Choose a plan"}</option>
          {(service?.plans ?? []).map((p) => (
            <option key={p.slug} value={p.slug}>{pick(p.titleEn, p.titleHi)} · {rupees(p.pricePaise)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={label} htmlFor="qb-offer">3. {hi ? "ऑफर" : "Offer"}</label>
        <select id="qb-offer" className={field} value={offer} disabled={!plan} onChange={(e) => setOffer(e.target.value)}>
          <option value="">{hi ? "कोई ऑफर नहीं" : "No offer"}</option>
          {offers.map((o) => (
            <option key={o.code} value={o.code}>{o.code} · {pick(o.titleEn, o.titleHi)} (−{o.discountFormatted})</option>
          ))}
          <option value={OTHER}>{hi ? "मेरे पास दूसरा ऑफर कोड है" : "I have another offer code"}</option>
        </select>
        {offer === OTHER && (
          <input
            className={`${field} mt-2 uppercase`}
            value={typedOffer}
            onChange={(e) => setTypedOffer(e.target.value)}
            placeholder={hi ? "ऑफर कोड लिखें" : "Type the offer code"}
            maxLength={40}
            aria-label={hi ? "ऑफर कोड" : "Offer code"}
          />
        )}
      </div>

      <div>
        <label className={label} htmlFor="qb-ref">4. {hi ? "रेफरल कोड (वैकल्पिक)" : "Referral code (optional)"}</label>
        <input
          id="qb-ref"
          className={`${field} uppercase`}
          value={referral}
          disabled={!plan}
          onChange={(e) => setReferral(e.target.value)}
          placeholder={hi ? "रेफरल कोड" : "Referral code"}
          maxLength={40}
        />
      </div>

      <button
        type="button"
        onClick={go}
        disabled={!plan}
        className="w-full inline-flex items-center justify-center gap-2 min-h-[46px] rounded bg-brand hover:bg-brand-hover text-on-brand text-xs font-bold uppercase tracking-wider disabled:opacity-50"
      >
        {hi ? "आगे बढ़ें: भुगतान" : "Continue to payment"}
        <ArrowRight className="w-4 h-4" />
      </button>
      {services !== null && services.length === 0 && (
        <p className="text-xs text-on-surface-variant">{hi ? "अभी कोई सेवा उपलब्ध नहीं है।" : "No services are available right now."}</p>
      )}
    </div>
  );
}
