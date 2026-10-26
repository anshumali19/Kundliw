"use client";

import { LinkTextarea } from "@/components/admin/LinkTextarea";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const input =
  "w-full bg-surface-container-lowest px-3 py-2.5 rounded border border-outline-variant focus:border-secondary focus:outline-none text-sm min-h-[44px]";
const btn =
  "min-h-[44px] px-4 rounded text-xs font-bold uppercase tracking-wider border border-maroon bg-brand hover:bg-brand-hover text-on-brand disabled:opacity-50";

async function api(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Request failed.");
  return json;
}

/** Rules for the whole associate programme. */
export function AssociateSettingsPanel({ isHindi }: { isHindi: boolean }) {
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const [form, setForm] = useState({
    enabled: true,
    autoApprove: false,
    minPayoutRupees: 500,
    referralDays: 30,
    termsEn: "",
    termsHi: "",
  });
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/api/admin/associate-settings")
      .then((d) =>
        setForm({
          enabled: d.settings.enabled,
          autoApprove: d.settings.autoApprove,
          minPayoutRupees: d.settings.minPayoutRupees,
          referralDays: d.settings.referralDays,
          termsEn: d.settings.termsEn || "",
          termsHi: d.settings.termsHi || "",
        })
      )
      .catch((e) => setMsg({ type: "error", text: e.message }));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api("/api/admin/associate-settings", {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          minPayoutRupees: Number(form.minPayoutRupees),
          referralDays: Number(form.referralDays),
          termsEn: form.termsEn || null,
          termsHi: form.termsHi || null,
        }),
      });
      setMsg({ type: "ok", text: t("Associate settings saved.", "एसोसिएट सेटिंग्स सहेजी गईं।") });
    } catch (err) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="bg-surface border border-outline-variant/60 rounded-lg p-5 space-y-5">
      <div className="space-y-3">
        <label className="flex items-start gap-3 text-sm cursor-pointer">
          <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} className="w-5 h-5 mt-0.5" />
          <span>
            <strong>{t("Associate programme is on", "एसोसिएट कार्यक्रम चालू है")}</strong>
            <span className="block text-xs text-on-surface-variant">
              {t(
                "When off, new associates cannot register and referral links stop crediting bookings.",
                "बंद होने पर नए एसोसिएट रजिस्टर नहीं कर सकते और रेफ़रल लिंक से बुकिंग दर्ज नहीं होती।"
              )}
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm cursor-pointer">
          <input type="checkbox" checked={form.autoApprove} onChange={(e) => setForm({ ...form, autoApprove: e.target.checked })} className="w-5 h-5 mt-0.5" />
          <span>
            <strong>{t("Approve new associates automatically", "नए एसोसिएट अपने आप स्वीकृत करें")}</strong>
            <span className="block text-xs text-on-surface-variant">
              {t("Leave off to approve each one by hand.", "हर एसोसिएट को स्वयं स्वीकृत करना हो तो बंद रखें।")}
            </span>
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="text-xs font-bold uppercase text-on-surface-variant">
          {t("Minimum payout request (Rs.)", "न्यूनतम भुगतान अनुरोध (Rs.)")}
          <input type="number" min={0} value={form.minPayoutRupees} onChange={(e) => setForm({ ...form, minPayoutRupees: Number(e.target.value) })} className={`${input} mt-1`} />
        </label>
        <label className="text-xs font-bold uppercase text-on-surface-variant">
          {t("Referral link stays valid for (days)", "रेफ़रल लिंक कितने दिन मान्य (दिन)")}
          <input type="number" min={1} max={365} value={form.referralDays} onChange={(e) => setForm({ ...form, referralDays: Number(e.target.value) })} className={`${input} mt-1`} />
        </label>
        <label className="text-xs font-bold uppercase text-on-surface-variant">
          {t("Terms for associates (English)", "एसोसिएट के लिए शर्तें (अंग्रेज़ी)")}
          <LinkTextarea rows={6} value={form.termsEn} onChange={(v) => setForm({ ...form, termsEn: v })} className={`${input} mt-1 normal-case font-normal`} />
        </label>
        <label className="text-xs font-bold uppercase text-on-surface-variant">
          {t("Terms for associates (Hindi)", "एसोसिएट के लिए शर्तें (हिन्दी)")}
          <LinkTextarea rows={6} value={form.termsHi} onChange={(v) => setForm({ ...form, termsHi: v })} className={`${input} mt-1 normal-case font-normal`} />
        </label>
      </div>

      {msg && (
        <div role="status" className={`p-3 rounded border text-sm flex items-center gap-2 ${msg.type === "ok" ? "border-primary/40 text-primary" : "border-error/40 text-on-error-container"}`}>
          {msg.type === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}
      <button type="submit" disabled={busy} className={btn}>
        {busy ? t("Saving...", "सहेज रहे हैं...") : t("Save settings", "सेटिंग्स सहेजें")}
      </button>
    </form>
  );
}

export interface AssociateDetail {
  id: string;
  referralCode: string;
  notes: string | null;
  customCommissionType: "PERCENTAGE" | "FLAT" | null;
  customCommissionValue: number | null;
  payoutUpi: string | null;
  payoutAccountHolder: string | null;
  payoutAccountNumber: string | null;
  payoutIfsc: string | null;
  user: { name: string | null; email: string | null; phone: string | null };
}

/** Details for one associate: private notes, their own commission, and their payout details. */
export function AssociateDetailsModal({
  associate,
  isHindi,
  onClose,
  onSaved,
}: {
  associate: AssociateDetail;
  isHindi: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const [notes, setNotes] = useState(associate.notes || "");
  const [useCustom, setUseCustom] = useState(!!associate.customCommissionType);
  const [type, setType] = useState<"PERCENTAGE" | "FLAT">(associate.customCommissionType || "PERCENTAGE");
  const [value, setValue] = useState(associate.customCommissionValue != null ? associate.customCommissionValue / 100 : 10);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(`/api/admin/associates/${associate.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          notes: notes || null,
          customCommission: useCustom ? { type, value: Math.round(Number(value) * 100) } : null,
        }),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const row = (label: string, v: string | null) => (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-semibold text-secondary text-right break-all">{v || "-"}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-black/60" role="dialog" aria-modal="true">
      <form onSubmit={save} className="w-full max-w-lg max-h-[calc(100dvh-1rem)] overflow-y-auto bg-surface rounded-2xl shadow-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold text-lg text-secondary">{associate.user.name || associate.referralCode}</h2>
            <p className="text-xs text-on-surface-variant">
              {associate.user.phone} {associate.user.email}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label={t("Close", "बंद करें")} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full hover:bg-surface-container">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-lg bg-surface-container-low space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary">{t("Payout details given by the associate", "एसोसिएट द्वारा दिए भुगतान विवरण")}</h3>
          {row("UPI", associate.payoutUpi)}
          {row(t("Account holder", "खाताधारक"), associate.payoutAccountHolder)}
          {row(t("Account number", "खाता संख्या"), associate.payoutAccountNumber)}
          {row("IFSC", associate.payoutIfsc)}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input type="checkbox" checked={useCustom} onChange={(e) => setUseCustom(e.target.checked)} className="w-5 h-5" />
            {t("Give this associate their own commission", "इस एसोसिएट को अपना अलग कमीशन दें")}
          </label>
          <p className="text-xs text-on-surface-variant">
            {t("It replaces the service and plan rules for this associate only.", "यह केवल इसी एसोसिएट के लिए सेवा और प्लान के नियमों की जगह लेता है।")}
          </p>
          {useCustom && (
            <div className="grid grid-cols-2 gap-3">
              <select value={type} onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FLAT")} className={input}>
                <option value="PERCENTAGE">{t("Percentage", "प्रतिशत")}</option>
                <option value="FLAT">{t("Fixed amount (Rs.)", "निश्चित राशि (Rs.)")}</option>
              </select>
              <input type="number" min={0} step="0.01" value={value} onChange={(e) => setValue(Number(e.target.value))} className={input} aria-label={t("Value", "मान")} />
            </div>
          )}
        </div>

        <label className="block text-xs font-bold uppercase text-on-surface-variant">
          {t("Private notes (only administrators see these)", "निजी टिप्पणियाँ (केवल एडमिन देख सकते हैं)")}
          <LinkTextarea rows={4} value={notes} onChange={(v) => setNotes(v)} className={`${input} mt-1 normal-case font-normal`} />
        </label>

        {error && <p className="text-sm text-on-error-container">{error}</p>}
        <div className="sticky bottom-0 bg-surface pt-2 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="min-h-[44px] px-4 rounded border border-outline-variant text-xs font-bold uppercase">
            {t("Cancel", "रद्द करें")}
          </button>
          <button type="submit" disabled={busy} className={btn}>
            {busy ? t("Saving...", "सहेज रहे हैं...") : t("Save", "सहेजें")}
          </button>
        </div>
      </form>
    </div>
  );
}
