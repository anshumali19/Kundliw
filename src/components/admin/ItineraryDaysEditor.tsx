"use client";

import { Plus, Trash2 } from "lucide-react";

export interface ItineraryDay {
  titleEn: string;
  titleHi: string;
  detailsEn: string;
  detailsHi: string;
}

export const emptyItineraryDay = (): ItineraryDay => ({ titleEn: "", titleHi: "", detailsEn: "", detailsHi: "" });

/** Reads a saved JSON day list (any shape) into a clean list. */
export function toItineraryDays(raw: unknown): ItineraryDay[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((d) => {
    const r = (d ?? {}) as Record<string, unknown>;
    return { titleEn: String(r.titleEn ?? ""), titleHi: String(r.titleHi ?? ""), detailsEn: String(r.detailsEn ?? ""), detailsHi: String(r.detailsHi ?? "") };
  });
}

const field = "w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-xs text-on-surface";

/** Day-wise schedule: add as many days as needed, each with a title and details in English and Hindi. */
export function ItineraryDaysEditor({ days, onChange }: { days: ItineraryDay[]; onChange: (days: ItineraryDay[]) => void }) {
  const set = (i: number, patch: Partial<ItineraryDay>) => onChange(days.map((d, k) => (k === i ? { ...d, ...patch } : d)));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold">Day-wise schedule (itinerary)</span>
        <button type="button" onClick={() => onChange([...days, emptyItineraryDay()])} className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-outline-variant px-3 text-xs font-semibold text-secondary hover:bg-surface-container">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add day
        </button>
      </div>
      {days.map((d, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-outline-variant/60 bg-surface-container-low p-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary">Day {i + 1}</span>
            <button type="button" aria-label={`Remove day ${i + 1}`} onClick={() => onChange(days.filter((_, k) => k !== i))} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-outline hover:bg-surface-container">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input type="text" placeholder="Title (English)" value={d.titleEn} onChange={(e) => set(i, { titleEn: e.target.value })} className={field} />
            <input type="text" placeholder="शीर्षक (हिन्दी)" value={d.titleHi} onChange={(e) => set(i, { titleHi: e.target.value })} className={field} />
            <textarea rows={3} placeholder="What happens this day (English)" value={d.detailsEn} onChange={(e) => set(i, { detailsEn: e.target.value })} className={field} />
            <textarea rows={3} placeholder="इस दिन का कार्यक्रम (हिन्दी)" value={d.detailsHi} onChange={(e) => set(i, { detailsHi: e.target.value })} className={field} />
          </div>
        </div>
      ))}
    </div>
  );
}
