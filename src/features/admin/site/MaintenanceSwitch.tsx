"use client";

import { useState } from "react";
import { Construction } from "lucide-react";
import { InfoTip } from "@/components/admin/InfoTip";

/** Turns maintenance mode on or off and sets the message visitors read. */
export function MaintenanceSwitch({ on, messageEn, messageHi, isHindi }: { on: boolean; messageEn: string; messageHi: string; isHindi: boolean }) {
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const [enabled, setEnabled] = useState(on);
  const [en, setEn] = useState(messageEn);
  const [hi, setHi] = useState(messageHi);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(next: boolean) {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maintenanceMode: next, maintenanceMessageEn: en.trim() || null, maintenanceMessageHi: hi.trim() || null }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      setEnabled(next);
      setMsg(next ? t("Maintenance mode is ON.", "रखरखाव मोड चालू है।") : t("Maintenance mode is OFF. The site is open.", "रखरखाव मोड बंद है। साइट खुली है।"));
    } else {
      setMsg(t("Could not save.", "सहेजा नहीं जा सका।"));
    }
  }

  return (
    <details className={`rounded border ${enabled ? "border-error bg-error-container/20" : "border-outline-variant/60 bg-surface"}`}>
      <summary className="flex min-h-[48px] cursor-pointer items-center gap-2 px-4 text-sm font-semibold text-secondary">
        <Construction className="h-4 w-4 text-primary" aria-hidden="true" />
        {t("Site status", "साइट की स्थिति")}: {enabled ? t("Maintenance mode ON", "रखरखाव मोड चालू") : t("Open to visitors", "आगंतुकों के लिए खुली")}
      </summary>
      <div className="space-y-3 border-t border-outline-variant/40 p-4 text-sm">
        <p className="text-xs text-on-surface-variant">
          {t("Use this while you make big changes. Visitors see a 'back soon' page; you and the sign-in pages keep working.", "बड़े बदलाव करते समय इसका उपयोग करें। आगंतुकों को 'जल्द वापसी' पेज दिखता है; आप और साइन-इन पेज चलते रहते हैं।")}{" "}
          <InfoTip text="Turn it on, make your changes, then turn it off. Leave the message empty to use the standard words." />
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input type="text" value={en} onChange={(e) => setEn(e.target.value)} placeholder={t("Message (English), optional", "संदेश (अंग्रेज़ी), वैकल्पिक")} className="min-h-[44px] rounded border border-outline-variant bg-surface px-3 py-2 text-xs" />
          <input type="text" value={hi} onChange={(e) => setHi(e.target.value)} placeholder={t("Message (Hindi), optional", "संदेश (हिन्दी), वैकल्पिक")} className="min-h-[44px] rounded border border-outline-variant bg-surface px-3 py-2 text-xs" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={busy} onClick={() => save(!enabled)} className="min-h-[44px] rounded bg-brand px-5 text-xs font-bold uppercase tracking-wider text-on-brand hover:bg-brand-hover disabled:opacity-50">
            {enabled ? t("Turn OFF maintenance mode", "रखरखाव मोड बंद करें") : t("Turn ON maintenance mode", "रखरखाव मोड चालू करें")}
          </button>
          {enabled && (
            <button type="button" disabled={busy} onClick={() => save(true)} className="min-h-[44px] rounded border border-outline-variant px-4 text-xs font-bold text-secondary">
              {t("Save message", "संदेश सहेजें")}
            </button>
          )}
          {msg && <span role="status" className="text-xs text-on-surface-variant">{msg}</span>}
        </div>
      </div>
    </details>
  );
}
