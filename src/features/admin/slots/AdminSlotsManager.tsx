"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Loader2, Plus, Trash2 } from "lucide-react";

interface SlotRow {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isActive: boolean;
}

const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_HI = ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"];

const field = "w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-sm";
const btn =
  "min-h-[44px] px-4 rounded text-xs font-bold uppercase tracking-wider border border-maroon bg-brand hover:bg-brand-hover text-on-brand disabled:opacity-50 inline-flex items-center justify-center gap-2";

const todayStr = () => new Date().toISOString().slice(0, 10);
const plusDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

export function AdminSlotsManager({ isHindi }: { isHindi: boolean }) {
  const tr = (en: string, hi: string) => (isHindi ? hi : en);
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [fromDate, setFromDate] = useState(todayStr());
  const [toDate, setToDate] = useState(plusDays(14));
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [startTime, setStartTime] = useState("11:00");
  const [endTime, setEndTime] = useState("13:00");
  const [duration, setDuration] = useState(30);
  const [capacity, setCapacity] = useState(1);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/slots");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSlots(data.slots);
    } catch (e) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Failed to load." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromDate, toDate, weekdays, startTime, endTime, durationMinutes: duration, capacity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create slots.");
      setMsg({
        type: "ok",
        text: tr(
          `${data.created} slot(s) added${data.skipped ? `, ${data.skipped} already existed` : ""}.`,
          `${data.created} स्लॉट जुड़े${data.skipped ? `, ${data.skipped} पहले से मौजूद थे` : ""}।`
        ),
      });
      await load();
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Could not create slots." });
    } finally {
      setBusy(false);
    }
  };

  const patch = async (id: string, body: { isActive?: boolean; capacity?: number }) => {
    setMsg(null);
    const res = await fetch(`/api/admin/slots/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) setMsg({ type: "err", text: data.error || "Could not update." });
    else await load();
  };

  const remove = async (s: SlotRow) => {
    if (!window.confirm(tr(`Delete the slot ${s.date} ${s.startTime}?`, `${s.date} ${s.startTime} का स्लॉट हटाएँ?`))) return;
    setMsg(null);
    const res = await fetch(`/api/admin/slots/${s.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) setMsg({ type: "err", text: data.error || "Could not delete." });
    else await load();
  };

  const byDate = useMemo(() => {
    const map = new Map<string, SlotRow[]>();
    for (const s of slots) map.set(s.date, [...(map.get(s.date) ?? []), s]);
    return [...map.entries()];
  }, [slots]);

  const previewCount = useMemo(() => {
    const per = Math.max(0, Math.floor((toMin(endTime) - toMin(startTime)) / Math.max(duration, 1)));
    let days = 0;
    const start = new Date(`${fromDate}T00:00:00Z`);
    const end = new Date(`${toDate}T00:00:00Z`);
    for (let d = start; d <= end && days < 1000; d = new Date(d.getTime() + 86400000)) {
      if (weekdays.includes(d.getUTCDay())) days++;
    }
    return days * per;
  }, [fromDate, toDate, weekdays, startTime, endTime, duration]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-secondary">{tr("Appointment slots", "अपॉइंटमेंट स्लॉट")}</h1>
        <p className="text-sm text-on-surface-variant">
          {tr(
            "Customers who book a plan with a consultation call pick one of these times. Add the days and hours you are available.",
            "परामर्श-कॉल वाले प्लान में ग्राहक इन्हीं समयों में से चुनते हैं। अपने उपलब्ध दिन और समय यहाँ जोड़ें।"
          )}
        </p>
      </div>

      {msg && (
        <div role="status" className={`p-3 rounded border text-sm ${msg.type === "ok" ? "border-primary/40 text-primary" : "border-error/40 text-on-error-container"}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={create} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 space-y-4">
        <h2 className="font-serif text-lg font-bold text-secondary flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-primary" aria-hidden="true" />
          {tr("Add slots", "स्लॉट जोड़ें")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-sm space-y-1">
            <span className="font-semibold text-secondary">{tr("From date", "आरंभ तिथि")}</span>
            <input type="date" className={field} value={fromDate} min={todayStr()} onChange={(e) => setFromDate(e.target.value)} required />
          </label>
          <label className="text-sm space-y-1">
            <span className="font-semibold text-secondary">{tr("To date", "अंतिम तिथि")}</span>
            <input type="date" className={field} value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} required />
          </label>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-secondary mb-1">{tr("Days of the week", "सप्ताह के दिन")}</legend>
          <div className="flex flex-wrap gap-2">
            {(isHindi ? WEEKDAYS_HI : WEEKDAYS_EN).map((label, i) => {
              const on = weekdays.includes(i);
              return (
                <label key={i} className={`inline-flex items-center gap-2 min-h-[40px] px-3 rounded border text-sm cursor-pointer ${on ? "border-primary bg-primary/10 font-semibold text-secondary" : "border-outline-variant"}`}>
                  <input type="checkbox" checked={on} onChange={() => setWeekdays(on ? weekdays.filter((d) => d !== i) : [...weekdays, i])} />
                  {label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <label className="text-sm space-y-1">
            <span className="font-semibold text-secondary">{tr("Start time", "आरंभ समय")}</span>
            <input type="time" className={field} value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </label>
          <label className="text-sm space-y-1">
            <span className="font-semibold text-secondary">{tr("End time", "समाप्ति समय")}</span>
            <input type="time" className={field} value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </label>
          <label className="text-sm space-y-1">
            <span className="font-semibold text-secondary">{tr("Minutes per slot", "प्रति स्लॉट मिनट")}</span>
            <input type="number" min={10} max={240} step={5} className={field} value={duration} onChange={(e) => setDuration(Number(e.target.value))} required />
          </label>
          <label className="text-sm space-y-1">
            <span className="font-semibold text-secondary">{tr("People per slot", "प्रति स्लॉट व्यक्ति")}</span>
            <input type="number" min={1} max={20} className={field} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy || previewCount === 0} className={btn}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {tr("Add slots", "स्लॉट जोड़ें")}
          </button>
          <span className="text-xs text-on-surface-variant">
            {tr(`This will create about ${previewCount} slot(s).`, `इससे लगभग ${previewCount} स्लॉट बनेंगे।`)}
          </span>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-bold text-secondary">{tr("Upcoming slots", "आगामी स्लॉट")}</h2>
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-primary" aria-label="Loading" />
        ) : byDate.length === 0 ? (
          <p className="text-sm text-on-surface-variant">{tr("No slots yet. Add some above.", "अभी कोई स्लॉट नहीं। ऊपर से जोड़ें।")}</p>
        ) : (
          byDate.map(([date, list]) => (
            <div key={date} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
              <div className="px-4 py-2 bg-surface-container font-semibold text-secondary text-sm">
                {new Date(`${date}T00:00:00Z`).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
              </div>
              <ul className="divide-y divide-outline-variant/40">
                {list.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="font-mono font-semibold w-28">{s.startTime} - {s.endTime}</span>
                    <span className="text-on-surface-variant">
                      {tr(`${s.bookedCount} of ${s.capacity} booked`, `${s.capacity} में से ${s.bookedCount} बुक`)}
                    </span>
                    <span className={`text-[11px] font-bold uppercase rounded-full px-2 py-0.5 ${s.isActive ? "bg-gold text-on-gold" : "bg-surface-container-high text-outline"}`}>
                      {s.isActive ? tr("On", "चालू") : tr("Off", "बंद")}
                    </span>
                    <span className="ml-auto flex items-center gap-2">
                      <button type="button" onClick={() => patch(s.id, { isActive: !s.isActive })} className="min-h-[38px] px-3 text-xs border border-outline-variant rounded hover:bg-surface-container-high">
                        {s.isActive ? tr("Switch off", "बंद करें") : tr("Switch on", "चालू करें")}
                      </button>
                      <button type="button" onClick={() => remove(s)} aria-label={tr("Delete slot", "स्लॉट हटाएँ")} className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center border border-error text-on-error-container rounded hover:bg-error-container">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
