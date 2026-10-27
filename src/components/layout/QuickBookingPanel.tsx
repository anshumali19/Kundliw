"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Mail } from "lucide-react";
import { KENDRA_EMAIL } from "@/lib/content/contact";

interface CatalogPlan { id: string; slug: string; titleEn: string; titleHi: string; pricePaise: number }
interface CatalogService { slug: string; titleEn: string; titleHi: string; plans: CatalogPlan[] }
interface OfferChoice { code: string; titleEn: string; titleHi: string; discountFormatted: string }

const OTHER = "__other";
const label = "block text-xs font-semibold text-on-surface-variant mb-1";
const field =
  "w-full min-h-[44px] rounded-lg border border-outline-variant bg-surface px-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-brand";

/**
 * The Booking drop-down: one compact form that follows the booking path
 * Service > Plan > Offer > Payment > Submitted > Confirmed. "Submit Booking" carries the choices
 * to the booking page, where birth details are filled in, and then on to payment.
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
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [pay, setPay] = useState<"GATEWAY" | "UPI" | "BANK">("GATEWAY");

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
  const code = (offer === OTHER ? typedOffer : offer).trim().toUpperCase();
  const mobileDigits = mobile.replace(/\D/g, "");
  const mobileBad = mobile.trim() !== "" && mobileDigits.length < 10;

  // Which steps of the path are done so far, shown as the pill strip
  const stepDone = [Boolean(service), Boolean(plan), Boolean(plan), false, false, false];
  const steps = [
    hi ? "सेवा" : "Service",
    hi ? "प्लान" : "Plan",
    hi ? "ऑफर" : "Offer",
    hi ? "भुगतान" : "Payment",
    hi ? "जमा" : "Submitted",
    hi ? "पुष्टि" : "Confirmed",
  ];
  const current = !service ? 0 : !plan ? 1 : 3;

  const go = () => {
    if (!service || !plan || mobileBad) return;
    const q = new URLSearchParams({ service: service.slug, plan: plan.slug, pay });
    if (code) q.set("offer", code);
    if (referral.trim()) q.set("ref", referral.trim().toUpperCase());
    if (name.trim()) q.set("name", name.trim());
    if (mobileDigits.length >= 10) q.set("phone", mobileDigits.slice(-10));
    onDone?.();
    router.push(`/booking?${q.toString()}` as never);
  };

  return (
    <div className="space-y-3 text-left">
      <ol className="flex flex-wrap gap-1.5" aria-label={hi ? "बुकिंग के चरण" : "Booking steps"}>
        {steps.map((s, i) => (
          <li
            key={s}
            aria-current={i === current ? "step" : undefined}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
              i === current
                ? "bg-maroon text-on-maroon"
                : stepDone[i]
                  ? "bg-gold/40 text-on-surface"
                  : "bg-surface-container-high text-on-surface-variant"
            }`}
          >
            {s}
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className={label} htmlFor="qb-service">{hi ? "सेवा" : "Service"}</label>
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
        <label className={label} htmlFor="qb-plan">{hi ? "प्लान" : "Plan"}</label>
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
            <option key={p.slug} value={p.slug}>{pick(p.titleEn, p.titleHi)} {rupees(p.pricePaise)}</option>
          ))}
        </select>
      </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className={label} htmlFor="qb-offer">{hi ? "ऑफर कोड" : "Offer code"}</label>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={label} htmlFor="qb-name">{hi ? "नाम" : "Name"}</label>
          <input id="qb-name" className={field} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" />
        </div>
        <div>
          <label className={label} htmlFor="qb-mobile">{hi ? "मोबाइल" : "Mobile"}</label>
          <input
            id="qb-mobile"
            className={`${field} ${mobileBad ? "border-error" : ""}`}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            inputMode="tel"
            maxLength={15}
            autoComplete="tel"
            aria-invalid={mobileBad}
          />
          {mobileBad && <p className="mt-1 text-[11px] text-on-error-container">{hi ? "10 अंकों का नंबर लिखें" : "Enter a 10-digit number"}</p>}
        </div>
      </div>

      <div>
        <label className={label} htmlFor="qb-ref">{hi ? "रेफरल कोड (वैकल्पिक)" : "Referral code (optional)"}</label>
        <input id="qb-ref" className={`${field} uppercase`} value={referral} onChange={(e) => setReferral(e.target.value)} maxLength={40} />
      </div>
      </div>

      <div>
        <label className={label} htmlFor="qb-pay">{hi ? "भुगतान" : "Payment"}</label>
        <select id="qb-pay" className={field} value={pay} onChange={(e) => setPay(e.target.value as "GATEWAY" | "UPI" | "BANK")}>
          <option value="GATEWAY">{hi ? "Razorpay (ऑनलाइन)" : "Razorpay (Online)"}</option>
          <option value="UPI">{hi ? "UPI / QR" : "UPI / QR"}</option>
          <option value="BANK">{hi ? "बैंक ट्रांसफर" : "Bank transfer"}</option>
        </select>
      </div>

      <div className="sticky bottom-0 -mx-1 px-1 pt-2 pb-1 bg-surface">
        <button
          type="button"
          onClick={go}
          disabled={!plan || mobileBad}
          className="inline-flex items-center justify-center min-h-[46px] px-6 rounded-full bg-saffron hover:brightness-110 text-white text-sm font-bold disabled:opacity-50"
        >
          {hi ? "बुकिंग जमा करें" : "Submit Booking"}
        </button>
        {!plan && (
          <p className="mt-1 text-[11px] text-on-surface-variant">{hi ? "पहले सेवा और प्लान चुनें।" : "Choose a service and a plan first."}</p>
        )}
      </div>

      <a href={`mailto:${KENDRA_EMAIL}`} className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary">
        <Mail className="w-4 h-4 text-primary shrink-0" />
        <span className="break-all">{hi ? "सहायता के लिए ईमेल करें:" : "Need help? Email"} {KENDRA_EMAIL}</span>
      </a>
      {services !== null && services.length === 0 && (
        <p className="text-xs text-on-surface-variant">{hi ? "अभी कोई सेवा उपलब्ध नहीं है।" : "No services are available right now."}</p>
      )}
    </div>
  );
}
