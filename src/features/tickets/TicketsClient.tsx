"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface TicketView {
  id: string;
  ticketNumber: string;
  subject: string;
  orderNumber: string | null;
  status: string;
  createdAt: string;
  /** Who raised it (shown to the admin) */
  who?: string;
  messages: Array<{ id: string; fromAdmin: boolean; body: string; createdAt: string }>;
}

const STATUS: Record<string, { en: string; hi: string; cls: string }> = {
  OPEN: { en: "Open", hi: "खुला", cls: "bg-brand/20 text-primary" },
  IN_PROGRESS: { en: "Being looked at", hi: "जाँच जारी", cls: "bg-tertiary-fixed text-on-tertiary-fixed" },
  RESOLVED: { en: "Resolved", hi: "हल हुआ", cls: "bg-emerald-100 text-emerald-800" },
};

const input = "w-full min-h-[44px] rounded border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-secondary focus:outline-none";

/** Tickets list with a thread and reply box. The customer also gets a form to raise a ticket; the admin gets a status select. */
export function TicketsClient({ tickets, orderNumbers = [], mode, isHindi }: { tickets: TicketView[]; orderNumbers?: string[]; mode: "user" | "admin"; isHindi: boolean }) {
  const router = useRouter();
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const [openId, setOpenId] = useState<string | null>(tickets[0]?.id ?? null);
  const [filter, setFilter] = useState("ALL");
  const [reply, setReply] = useState("");
  const [form, setForm] = useState({ subject: "", message: "", orderNumber: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function send(path: string, method: "POST" | "PUT", body: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
    setBusy(true);
    setError(null);
    const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const data = res ? ((await res.json().catch(() => ({}))) as Record<string, unknown>) : {};
    setBusy(false);
    if (!res?.ok) setError(String(data.error || t("Something went wrong. Please try again.", "कुछ गड़बड़ हुई। कृपया दोबारा प्रयास करें।")));
    return { ok: !!res?.ok, data };
  }

  async function raise(e: React.FormEvent) {
    e.preventDefault();
    const r = await send("/api/tickets", "POST", { subject: form.subject, message: form.message, orderNumber: form.orderNumber || null });
    if (r.ok) {
      const num = (r.data.ticket as { ticketNumber?: string } | undefined)?.ticketNumber;
      setDone(num ? t(`Ticket ${num} raised. We will reply here.`, `टिकट ${num} बन गया। उत्तर यहीं मिलेगा।`) : t("Ticket raised.", "टिकट बन गया।"));
      setForm({ subject: "", message: "", orderNumber: "" });
      router.refresh();
    }
  }

  async function answer(id: string) {
    if (!reply.trim()) return;
    const r = await send(`/api/tickets/${id}`, "POST", { message: reply });
    if (r.ok) {
      setReply("");
      router.refresh();
    }
  }

  const shown = tickets.filter((x) => filter === "ALL" || x.status === filter);
  const open = tickets.find((x) => x.id === openId) ?? null;
  const label = (s: string) => (isHindi ? STATUS[s]?.hi : STATUS[s]?.en) ?? s;

  return (
    <div className="space-y-6">
      {mode === "user" && (
        <form onSubmit={raise} className="space-y-3 rounded-lg border border-outline-variant/60 bg-surface p-5">
          <h2 className="font-serif text-lg font-bold text-secondary">{t("Raise a new ticket", "नया टिकट बनाएँ")}</h2>
          <label className="block text-xs font-bold uppercase text-secondary">
            {t("Subject", "विषय")} *
            <input type="text" required minLength={3} maxLength={150} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={`${input} mt-1 normal-case font-normal`} />
          </label>
          {orderNumbers.length > 0 && (
            <label className="block text-xs font-bold uppercase text-secondary">
              {t("About which order? (optional)", "किस ऑर्डर के बारे में? (वैकल्पिक)")}
              <select value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} className={`${input} mt-1 normal-case font-normal`}>
                <option value="">{t("Not about an order", "किसी ऑर्डर के बारे में नहीं")}</option>
                {orderNumbers.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          )}
          <label className="block text-xs font-bold uppercase text-secondary">
            {t("Your problem", "आपकी समस्या")} *
            <textarea required minLength={5} maxLength={3000} rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${input} mt-1 normal-case font-normal`} />
          </label>
          {error && !open && <p role="alert" className="text-xs text-on-error-container">{error}</p>}
          {done && <p role="status" className="text-xs font-semibold text-emerald-800">{done}</p>}
          <button type="submit" disabled={busy} className="min-h-[44px] rounded bg-brand px-5 text-sm font-bold text-on-brand hover:bg-brand-hover disabled:opacity-50">
            {busy ? t("Sending…", "भेज रहे हैं…") : t("Raise ticket", "टिकट बनाएँ")}
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-1.5">
        {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)} className={`min-h-[40px] rounded px-3 text-xs font-bold uppercase tracking-wider ${filter === s ? "bg-brand text-on-brand" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>
            {s === "ALL" ? t("All", "सभी") : label(s)} ({s === "ALL" ? tickets.length : tickets.filter((x) => x.status === s).length})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="rounded border border-outline-variant/50 bg-surface-container-low p-6 text-center text-sm text-on-surface-variant">{t("No tickets yet.", "अभी कोई टिकट नहीं है।")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <ul className="max-h-[70vh] divide-y divide-outline-variant/40 overflow-y-auto rounded border border-outline-variant/60 bg-surface lg:col-span-5">
            {shown.map((x) => (
              <li key={x.id}>
                <button type="button" onClick={() => setOpenId(x.id)} className={`block min-h-[64px] w-full px-3 py-2 text-left ${x.id === openId ? "bg-brand/15" : "hover:bg-surface-container-low"}`}>
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-secondary">{x.ticketNumber}</span>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS[x.status]?.cls ?? ""}`}>{label(x.status)}</span>
                  </span>
                  <span className="block truncate text-sm font-semibold text-on-surface">{x.subject}</span>
                  <span className="block text-[11px] text-on-surface-variant">{x.who ? `${x.who} · ` : ""}{new Date(x.createdAt).toLocaleDateString("en-IN")}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-col rounded border border-outline-variant/60 bg-surface lg:col-span-7">
            {open ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/50 px-4 py-3">
                  <div>
                    <div className="font-serif font-bold text-secondary">{open.subject}</div>
                    <div className="text-[11px] text-on-surface-variant">{open.ticketNumber}{open.orderNumber ? ` · ${t("Order", "ऑर्डर")} ${open.orderNumber}` : ""}{open.who ? ` · ${open.who}` : ""}</div>
                  </div>
                  {mode === "admin" && (
                    <select
                      aria-label={t("Status", "स्थिति")}
                      value={open.status}
                      disabled={busy}
                      onChange={async (e) => {
                        if ((await send(`/api/tickets/${open.id}`, "PUT", { status: e.target.value })).ok) router.refresh();
                      }}
                      className="min-h-[40px] rounded border border-outline-variant bg-surface px-2 text-xs font-semibold"
                    >
                      {Object.keys(STATUS).map((s) => (
                        <option key={s} value={s}>{label(s)}</option>
                      ))}
                    </select>
                  )}
                </div>
                <ul className="max-h-[45vh] flex-1 space-y-2 overflow-y-auto p-4">
                  {open.messages.map((m) => (
                    <li key={m.id} className={`max-w-[88%] rounded-lg px-3 py-2 text-sm ${m.fromAdmin ? "ml-auto bg-brand/20" : "bg-surface-container"}`}>
                      <span className="mb-0.5 block text-[10px] font-bold uppercase text-primary">{m.fromAdmin ? t("Kendra", "केंद्र") : mode === "admin" ? open.who || t("Customer", "ग्राहक") : t("You", "आप")}</span>
                      <span className="whitespace-pre-line">{m.body}</span>
                      <span className="mt-1 block text-[10px] text-on-surface-variant">{new Date(m.createdAt).toLocaleString("en-IN")}</span>
                    </li>
                  ))}
                </ul>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    answer(open.id);
                  }}
                  className="space-y-2 border-t border-outline-variant/50 p-3"
                >
                  {error && open && <p role="alert" className="text-xs text-on-error-container">{error}</p>}
                  <div className="flex gap-2">
                    <textarea rows={2} value={reply} onChange={(e) => setReply(e.target.value)} placeholder={t("Write a reply", "उत्तर लिखें")} className="min-h-[44px] flex-1 rounded border border-outline-variant bg-surface px-3 py-2 text-sm" />
                    <button type="submit" disabled={busy || !reply.trim()} className="min-h-[44px] rounded bg-brand px-4 text-sm font-bold text-on-brand hover:bg-brand-hover disabled:opacity-50">
                      {t("Send", "भेजें")}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <p className="p-6 text-sm text-on-surface-variant">{t("Choose a ticket to read it.", "पढ़ने के लिए कोई टिकट चुनें।")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
