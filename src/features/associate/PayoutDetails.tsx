"use client";

import { stripRich } from "@/lib/content/richText";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

const input =
  "w-full bg-surface-container-lowest px-3 py-2.5 rounded border border-outline-variant focus:border-secondary focus:outline-none text-sm min-h-[44px]";

/** Where the associate wants to be paid, plus the programme terms the Kendra has published. */
export function PayoutDetails({ isHindi }: { isHindi: boolean }) {
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const [form, setForm] = useState({ payoutUpi: "", payoutAccountHolder: "", payoutAccountNumber: "", payoutIfsc: "" });
  const [terms, setTerms] = useState<string | null>(null);
  const [minPayout, setMinPayout] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/associate/profile")
      .then((r) => r.json())
      .then((d) => {
        if (!d.payout) return;
        setForm({
          payoutUpi: d.payout.payoutUpi || "",
          payoutAccountHolder: d.payout.payoutAccountHolder || "",
          payoutAccountNumber: d.payout.payoutAccountNumber || "",
          payoutIfsc: d.payout.payoutIfsc || "",
        });
        setTerms((isHindi ? d.rules.termsHi || d.rules.termsEn : d.rules.termsEn || d.rules.termsHi) || null);
        setMinPayout(d.rules.minPayoutPaise);
      })
      .catch(() => undefined);
  }, [isHindi]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/associate/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setMsg({ type: "ok", text: t("Payout details saved.", "भुगतान विवरण सहेजे गए।") });
    } catch (err) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to save" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={save} className="bg-surface border border-outline-variant/60 rounded-lg p-4 space-y-3">
        <div>
          <h2 className="font-bold text-secondary">{t("Where should we pay you?", "भुगतान कहाँ भेजें?")}</h2>
          <p className="text-xs text-on-surface-variant">
            {t("Give a UPI ID or bank details. Only you and the Kendra administrators can see them.", "UPI ID या बैंक विवरण दें। इन्हें केवल आप और केंद्र के एडमिन देख सकते हैं।")}
            {minPayout != null && (
              <>
                {" "}
                {t("Minimum payout request:", "न्यूनतम भुगतान अनुरोध:")} Rs. {(minPayout / 100).toLocaleString("en-IN")}.
              </>
            )}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs font-bold uppercase text-on-surface-variant">
            UPI ID
            <input className={`${input} mt-1`} value={form.payoutUpi} onChange={(e) => setForm({ ...form, payoutUpi: e.target.value })} placeholder="name@bank" />
          </label>
          <label className="text-xs font-bold uppercase text-on-surface-variant">
            {t("Account holder", "खाताधारक")}
            <input className={`${input} mt-1`} value={form.payoutAccountHolder} onChange={(e) => setForm({ ...form, payoutAccountHolder: e.target.value })} />
          </label>
          <label className="text-xs font-bold uppercase text-on-surface-variant">
            {t("Account number", "खाता संख्या")}
            <input className={`${input} mt-1`} inputMode="numeric" value={form.payoutAccountNumber} onChange={(e) => setForm({ ...form, payoutAccountNumber: e.target.value })} />
          </label>
          <label className="text-xs font-bold uppercase text-on-surface-variant">
            IFSC
            <input className={`${input} mt-1`} value={form.payoutIfsc} onChange={(e) => setForm({ ...form, payoutIfsc: e.target.value.toUpperCase() })} />
          </label>
        </div>
        {msg && (
          <div role="status" className={`p-3 rounded border text-sm flex items-center gap-2 ${msg.type === "ok" ? "border-primary/40 text-primary" : "border-error/40 text-on-error-container"}`}>
            {msg.type === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {msg.text}
          </div>
        )}
        <button type="submit" disabled={busy} className="min-h-[44px] px-5 rounded border border-maroon bg-brand hover:bg-brand-hover text-on-brand text-xs font-bold uppercase disabled:opacity-50">
          {busy ? t("Saving...", "सहेज रहे हैं...") : t("Save payout details", "भुगतान विवरण सहेजें")}
        </button>
      </form>

      {terms && (
        <details className="bg-surface border border-outline-variant/60 rounded-lg p-4">
          <summary className="cursor-pointer font-bold text-secondary min-h-[44px] flex items-center">{t("Associate terms", "एसोसिएट की शर्तें")}</summary>
          <p className="whitespace-pre-line text-sm text-on-surface-variant mt-2">{stripRich(terms)}</p>
        </details>
      )}
    </div>
  );
}
