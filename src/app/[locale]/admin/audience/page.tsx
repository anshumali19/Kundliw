"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { AUDIENCE_KINDS, type AudienceKind, type AudienceMap, type Only } from "@/lib/audience";

interface Row {
  id: string;
  title: string;
  note?: string;
}

const KIND_LABEL: Record<AudienceKind, { en: string; hi: string }> = {
  service: { en: "Services", hi: "सेवाएँ" },
  otherService: { en: "Other services", hi: "अन्य सेवाएँ" },
  offer: { en: "Offers", hi: "ऑफ़र" },
  testimonial: { en: "Reviews", hi: "समीक्षाएँ" },
  blog: { en: "Articles", hi: "लेख" },
  faq: { en: "Questions", hi: "प्रश्नोत्तर" },
  gallery: { en: "Gallery", hi: "गैलरी" },
  marquee: { en: "Scrolling notices", hi: "स्क्रॉलिंग सूचनाएँ" },
  banner: { en: "Banners", hi: "बैनर" },
  slide: { en: "Home hero slides", hi: "होम हीरो स्लाइड" },
  page: { en: "Custom pages", hi: "कस्टम पेज" },
};

type Choice = "BOTH" | Only;
const CHOICES: { value: Choice; en: string; hi: string }[] = [
  { value: "BOTH", en: "Both", hi: "दोनों" },
  { value: "WEB", en: "Website only", hi: "सिर्फ वेबसाइट" },
  { value: "APP", en: "App only", hi: "सिर्फ ऐप" },
];

export default function AdminAudiencePage() {
  const [lists, setLists] = useState<Record<AudienceKind, Row[]> | null>(null);
  const [audience, setAudience] = useState<AudienceMap>({});
  const [kind, setKind] = useState<AudienceKind>("offer");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/audience")
      .then((r) => r.json())
      .then((d) => {
        if (d.lists) {
          setLists(d.lists);
          setAudience(d.audience || {});
        } else setError(d.error || "Failed to load");
      })
      .catch(() => setError("Failed to load"));
  }, []);

  const choiceOf = (k: AudienceKind, id: string): Choice => audience[k]?.[id] ?? "BOTH";

  const choose = (k: AudienceKind, id: string, c: Choice) => {
    setAudience((a) => {
      const next = { ...(a[k] ?? {}) };
      if (c === "BOTH") delete next[id];
      else next[id] = c;
      return { ...a, [k]: next };
    });
    setDirty(true);
    setOk(null);
  };

  const counts = useMemo(() => {
    const out: Partial<Record<AudienceKind, number>> = {};
    for (const k of AUDIENCE_KINDS) out[k] = Object.keys(audience[k] ?? {}).length;
    return out;
  }, [audience]);

  const save = async () => {
    setSaving(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/admin/audience", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audience }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to save");
      setAudience(d.audience);
      setDirty(false);
      setOk("Saved. The website and the app show the new choices within a minute. / सहेजा गया।");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!lists) {
    return error ? (
      <div className="p-3 rounded bg-error-container/20 border border-error text-on-error-container text-xs">{error}</div>
    ) : (
      <Loader2 className="w-6 h-6 animate-spin text-primary" aria-label="Loading" />
    );
  }

  const rows = lists[kind];

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="font-serif text-2xl font-bold text-secondary">कहाँ दिखे • Show where</h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Choose for each item: shown on the website only, in the app only, or in both (the default). Items you do not change stay in both. /
          हर चीज़ के लिए चुनें: सिर्फ वेबसाइट पर, सिर्फ ऐप में, या दोनों में (डिफ़ॉल्ट)।
        </p>
      </div>

      {error && (
        <div className="p-3 rounded bg-error-container/20 border border-error text-on-error-container text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {ok && (
        <div className="p-3 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{ok}</span>
        </div>
      )}

      <div role="tablist" className="flex flex-wrap gap-2">
        {AUDIENCE_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={kind === k}
            onClick={() => setKind(k)}
            className={`min-h-[44px] px-4 rounded text-xs font-bold border ${kind === k ? "bg-brand text-on-brand border-maroon" : "bg-surface text-secondary border-outline-variant/60 hover:bg-surface-container-high"}`}
          >
            {KIND_LABEL[k].en} • {KIND_LABEL[k].hi}
            {(counts[k] ?? 0) > 0 && <span className="ml-2 rounded-full bg-gold/60 text-maroon-deep px-2 py-0.5 text-[10px]">{counts[k]}</span>}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="p-8 rounded-lg border border-dashed border-outline-variant text-center text-xs text-outline">Nothing here yet. / अभी कुछ नहीं।</div>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => {
            const current = choiceOf(kind, r.id);
            return (
              <li key={r.id} className="p-3 rounded-lg bg-surface border border-outline-variant/40 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-sm text-secondary break-words">{r.title}</div>
                  {r.note && <div className="text-xs text-on-surface-variant break-words">{r.note}</div>}
                </div>
                <div role="radiogroup" aria-label={r.title} className="flex rounded overflow-hidden border border-outline-variant">
                  {CHOICES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      role="radio"
                      aria-checked={current === c.value}
                      onClick={() => choose(kind, r.id, c.value)}
                      className={`min-h-[44px] px-3 text-[11px] font-bold ${current === c.value ? "bg-maroon text-white" : "bg-surface text-on-surface hover:bg-surface-container-high"}`}
                    >
                      {c.en} • {c.hi}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="sticky bottom-[calc(6.75rem+env(safe-area-inset-bottom,0px))] xl:bottom-12 z-30 bg-surface/95 backdrop-blur border-t border-outline-variant/40 -mx-2 px-2 py-3">
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="min-h-[44px] px-6 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save choices • सहेजें"}
        </button>
      </div>
    </div>
  );
}
