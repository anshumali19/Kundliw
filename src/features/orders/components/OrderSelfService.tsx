"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPaiseToInr } from "@/lib/billing/gst";

export interface UpgradeChoice {
  id: string;
  title: string;
  pricePaise: number;
}

const btn =
  "min-h-[44px] px-3.5 py-2 bg-surface hover:bg-surface-container border border-outline-variant text-on-surface font-semibold rounded flex items-center gap-1.5 transition-colors disabled:opacity-50";

/**
 * Lets a customer cancel an order or upgrade it to a higher plan without writing to the Kendra.
 * The server checks every rule again; this only shows what is allowed.
 */
export function OrderSelfService({
  orderId,
  isHindi,
  canCancel,
  cancelBlocked,
  upgradeChoices,
  upgradeBlocked,
  paidPaise,
  hasPaid,
}: {
  orderId: string;
  isHindi: boolean;
  canCancel: boolean;
  /** Why cancelling is not possible (already translated), shown with a ticket link */
  cancelBlocked?: string | null;
  upgradeChoices: UpgradeChoice[];
  upgradeBlocked?: string | null;
  paidPaise: number;
  hasPaid: boolean;
}) {
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const router = useRouter();
  const [panel, setPanel] = useState<null | "cancel" | "upgrade">(null);
  const [reason, setReason] = useState("");
  const [planId, setPlanId] = useState(upgradeChoices[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(path: string, body: unknown) {
    setBusy(true);
    setError(null);
    const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const data = res ? ((await res.json().catch(() => ({}))) as Record<string, unknown>) : {};
    setBusy(false);
    if (!res?.ok) {
      setError(String(data.error || t("Something went wrong. Please try again.", "कुछ गड़बड़ हुई। कृपया दोबारा प्रयास करें।")));
      return null;
    }
    return data;
  }

  async function cancel() {
    if (!window.confirm(t("Cancel this order? This cannot be undone.", "यह ऑर्डर रद्द करें? यह वापस नहीं हो सकता।"))) return;
    const data = await call(`/api/orders/${orderId}/cancel`, { reason });
    if (data) router.refresh();
  }

  async function upgrade() {
    const data = await call(`/api/orders/${orderId}/upgrade`, { planId });
    if (data?.orderId) router.push(`/booking/checkout/${String(data.orderId)}`);
  }

  const chosen = upgradeChoices.find((p) => p.id === planId);

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap gap-2">
        {upgradeChoices.length > 0 && (
          <button type="button" className={btn} onClick={() => setPanel(panel === "upgrade" ? null : "upgrade")} aria-expanded={panel === "upgrade"}>
            {t("Upgrade plan", "प्लान अपग्रेड करें")}
          </button>
        )}
        {canCancel && (
          <button type="button" className={`${btn} !border-error !text-on-error-container`} onClick={() => setPanel(panel === "cancel" ? null : "cancel")} aria-expanded={panel === "cancel"}>
            {t("Cancel order", "ऑर्डर रद्द करें")}
          </button>
        )}
      </div>

      {!canCancel && cancelBlocked && <p className="text-[11px] text-on-surface-variant">{cancelBlocked}</p>}
      {upgradeChoices.length === 0 && upgradeBlocked && <p className="text-[11px] text-on-surface-variant">{upgradeBlocked}</p>}

      {panel === "upgrade" && chosen && (
        <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4 space-y-3 max-w-xl">
          <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
            {t("Upgrade to", "इस प्लान में अपग्रेड करें")}
            <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="mt-1 w-full min-h-[44px] rounded border border-outline-variant bg-surface px-3 text-sm normal-case font-normal">
              {upgradeChoices.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {formatPaiseToInr(p.pricePaise)}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-on-surface-variant">
            {t(
              `You have already paid ${formatPaiseToInr(paidPaise)}. That amount is taken off, and you pay only the difference (with GST) on the next screen. Your current order is closed once the new payment is confirmed.`,
              `आप ${formatPaiseToInr(paidPaise)} पहले ही दे चुके हैं। वह राशि घटा दी जाती है और अगली स्क्रीन पर आप केवल अंतर (GST सहित) देंगे। नया भुगतान पक्का होते ही आपका वर्तमान ऑर्डर बंद हो जाएगा।`,
            )}
          </p>
          <button type="button" disabled={busy} onClick={upgrade} className="min-h-[44px] px-4 rounded bg-brand text-on-brand text-xs font-bold uppercase tracking-wider disabled:opacity-50">
            {busy ? t("Please wait…", "कृपया रुकें…") : t("Continue to pay the difference", "अंतर का भुगतान करें")}
          </button>
        </div>
      )}

      {panel === "cancel" && (
        <div className="rounded-lg border border-error/50 bg-surface-container-low p-4 space-y-3 max-w-xl">
          <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
            {t("Why are you cancelling?", "आप क्यों रद्द कर रहे हैं?")}
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={500} className="mt-1 w-full rounded border border-outline-variant bg-surface px-3 py-2 text-sm normal-case font-normal" />
          </label>
          <p className="text-xs text-on-surface-variant">
            {hasPaid
              ? t(
                  `Your ${formatPaiseToInr(paidPaise)} will be refunded to the way you paid, within 7 working days after the Kendra processes it. You can see the refund status here.`,
                  `आपके ${formatPaiseToInr(paidPaise)} केंद्र द्वारा प्रक्रिया पूरी करने के बाद 7 कार्यदिवस में उसी माध्यम में वापस होंगे। धनवापसी की स्थिति यहीं दिखेगी।`,
                )
              : t("Nothing has been paid for this order, so there is nothing to refund.", "इस ऑर्डर का भुगतान नहीं हुआ है, इसलिए वापस करने को कुछ नहीं है।")}
          </p>
          <button type="button" disabled={busy || reason.trim().length < 3} onClick={cancel} className="min-h-[44px] px-4 rounded bg-error text-on-error text-xs font-bold uppercase tracking-wider disabled:opacity-50">
            {busy ? t("Please wait…", "कृपया रुकें…") : t("Yes, cancel this order", "हाँ, ऑर्डर रद्द करें")}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs text-on-error-container font-semibold">
          {error}
        </p>
      )}
    </div>
  );
}
