"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { ImageUrlField } from "@/components/admin/MediaFields";
import { InfoTip } from "@/components/admin/InfoTip";
import { Link } from "@/i18n/routing";

interface Props {
  upiVpa: string;
  qrCodeUrl: string;
  bankReady: boolean;
  razorpayReady: boolean;
  isHindi: boolean;
}

/** How customers pay: UPI ID and QR code are set here; bank details and Razorpay keys have their own pages. */
export function PaymentSetup({ upiVpa, qrCodeUrl, bankReady, razorpayReady, isHindi }: Props) {
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const [upi, setUpi] = useState(upiVpa);
  const [qr, setQr] = useState(qrCodeUrl);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upiVpa: upi.trim() || null, qrCodeUrl: qr.trim() || null }),
    }).catch(() => null);
    setBusy(false);
    setMsg(res?.ok ? t("Saved. Customers now see this at checkout.", "सहेजा गया। ग्राहकों को अब चेकआउट पर यही दिखेगा।") : t("Could not save.", "सहेजा नहीं जा सका।"));
  }

  const Status = ({ on, label }: { on: boolean; label: string }) => (
    <li className="flex items-center gap-2">
      {on ? <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Circle className="h-4 w-4 text-outline" aria-hidden="true" />}
      <span className={on ? "font-semibold text-secondary" : "text-on-surface-variant"}>{label}</span>
    </li>
  );

  return (
    <section className="space-y-4 rounded-lg border border-gold/60 bg-gold/10 p-5" aria-labelledby="pay-setup-title">
      <div>
        <h2 id="pay-setup-title" className="font-serif text-lg font-bold text-secondary">
          {t("How customers pay", "ग्राहक भुगतान कैसे करें")}{" "}
          <InfoTip text="At checkout the customer sees the options you have set up here. UPI ID and QR code let you take payments and bookings right away. Razorpay can be added later in API keys and will then appear by itself." />
        </h2>
        <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
          <Status on={!!upi.trim()} label={t("UPI ID", "UPI आईडी")} />
          <Status on={!!qr.trim()} label={t("QR code", "QR कोड")} />
          <Status on={bankReady} label={t("Bank transfer details", "बैंक विवरण")} />
          <Status on={razorpayReady} label={t("Razorpay online payment", "Razorpay ऑनलाइन भुगतान")} />
        </ul>
      </div>
      <form onSubmit={save} className="space-y-3">
        <label className="block text-xs font-bold uppercase text-secondary">
          {t("UPI ID", "UPI आईडी")}
          <input type="text" value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="name@bank" className="mt-1 min-h-[44px] w-full rounded border border-outline-variant bg-surface px-3 py-2 font-mono text-sm normal-case" />
        </label>
        <ImageUrlField label={t("QR code picture (upload or link)", "QR कोड का चित्र (अपलोड या लिंक)")} value={qr} onChange={setQr} folder="payments" />
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className="min-h-[44px] rounded bg-brand px-5 text-sm font-bold text-on-brand hover:bg-brand-hover disabled:opacity-50">
            {busy ? t("Saving…", "सहेज रहे हैं…") : t("Save", "सहेजें")}
          </button>
          {msg && <span role="status" className="text-xs text-on-surface-variant">{msg}</span>}
        </div>
      </form>
      <p className="text-xs text-on-surface-variant">
        {t("Bank account details: ", "बैंक खाता विवरण: ")}
        <Link href="/admin/settings" className="font-bold text-primary hover:underline">{t("Business settings", "व्यवसाय सेटिंग")}</Link>
        {" · "}
        {t("Razorpay keys (add later): ", "Razorpay कुंजियाँ (बाद में): ")}
        <Link href="/admin/settings/keys" className="font-bold text-primary hover:underline">{t("API keys & Analytics", "API कीज़ व एनालिटिक्स")}</Link>
      </p>
    </section>
  );
}
