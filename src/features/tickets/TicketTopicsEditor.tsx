"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { InfoTip } from "@/components/admin/InfoTip";

interface Row {
  en: string;
  hi: string;
}

const field = "w-full min-h-[40px] rounded border border-outline-variant bg-surface px-3 py-2 text-xs";

/** Add, change, reorder or remove the ready-made questions customers can pick when raising a ticket. */
export function TicketTopicsEditor({ initial, isHindi }: { initial: Row[]; isHindi: boolean }) {
  const router = useRouter();
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const [rows, setRows] = useState<Row[]>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const set = (i: number, patch: Partial<Row>) => setRows(rows.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  const move = (i: number, by: number) => {
    const j = i + by;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
  };

  async function call(method: "PUT" | "DELETE", body?: unknown) {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/ticket-topics", { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (res?.ok) {
      setMsg(t("Saved.", "सहेजा गया।"));
      router.refresh();
      return true;
    }
    setMsg(data.error || t("Could not save.", "सहेजा नहीं जा सका।"));
    return false;
  }

  return (
    <details className="rounded border border-outline-variant/60 bg-surface">
      <summary className="flex min-h-[48px] cursor-pointer items-center gap-2 px-4 text-sm font-semibold text-secondary">
        {t("Ready-made questions customers can pick", "ग्राहक जो तैयार प्रश्न चुन सकते हैं")} ({rows.length})
        <InfoTip text="These appear as tap buttons on the ticket form. Customers can still type their own question. Add as many as you like, up to 30, and remove or reorder any." />
      </summary>
      <div className="space-y-3 border-t border-outline-variant/40 p-4">
        {rows.length === 0 && <p className="text-xs text-on-surface-variant">{t("No ready-made questions. Customers will type their own.", "कोई तैयार प्रश्न नहीं। ग्राहक अपना प्रश्न स्वयं लिखेंगे।")}</p>}
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input type="text" value={r.en} onChange={(e) => set(i, { en: e.target.value })} placeholder="Question (English)" aria-label={`Question ${i + 1} (English)`} className={field} />
            <input type="text" value={r.hi} onChange={(e) => set(i, { hi: e.target.value })} placeholder="प्रश्न (हिन्दी)" aria-label={`Question ${i + 1} (Hindi)`} className={field} />
            <span className="flex gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="inline-flex h-10 w-10 items-center justify-center rounded hover:bg-surface-container disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Move down" className="inline-flex h-10 w-10 items-center justify-center rounded hover:bg-surface-container disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
              <button type="button" onClick={() => setRows(rows.filter((_, k) => k !== i))} aria-label="Remove question" className="inline-flex h-10 w-10 items-center justify-center rounded text-on-error-container hover:bg-error-container/30"><Trash2 className="h-4 w-4" /></button>
            </span>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button type="button" onClick={() => setRows([...rows, { en: "", hi: "" }])} disabled={rows.length >= 30} className="inline-flex min-h-[44px] items-center gap-1 rounded border border-outline-variant px-3 text-xs font-bold text-secondary hover:bg-surface-container">
            <Plus className="h-4 w-4" aria-hidden="true" /> {t("Add a question", "प्रश्न जोड़ें")}
          </button>
          <button type="button" disabled={busy} onClick={() => call("PUT", { topics: rows.filter((r) => r.en.trim()) })} className="min-h-[44px] rounded bg-brand px-5 text-xs font-bold uppercase tracking-wider text-on-brand hover:bg-brand-hover disabled:opacity-50">
            {busy ? t("Saving…", "सहेज रहे हैं…") : t("Save", "सहेजें")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              if (window.confirm(t("Go back to the standard questions? Your list will be replaced.", "मानक प्रश्नों पर लौटें? आपकी सूची बदल जाएगी।")) && (await call("DELETE"))) router.refresh();
            }}
            className="min-h-[44px] rounded border border-outline-variant px-4 text-xs font-semibold text-secondary"
          >
            {t("Restore standard questions", "मानक प्रश्न वापस लाएँ")}
          </button>
          {msg && <span role="status" className="text-xs text-on-surface-variant">{msg}</span>}
        </div>
      </div>
    </details>
  );
}
