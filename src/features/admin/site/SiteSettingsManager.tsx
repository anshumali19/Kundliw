"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, Save, Upload } from "lucide-react";
import { SECTIONS, type FieldDef, type SectionValues, type SocialLink } from "@/lib/siteConfig/definitions";
import { SocialIcon } from "@/components/content/SocialIcon";

const field = "w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-sm";
const btn =
  "min-h-[44px] px-4 rounded text-xs font-bold uppercase tracking-wider border border-maroon bg-brand hover:bg-brand-hover text-on-brand disabled:opacity-50 inline-flex items-center justify-center gap-2";

type Msg = { type: "ok" | "err"; text: string } | null;

export function SiteSettingsManager({ isHindi }: { isHindi: boolean }) {
  const tr = (en: string, hi: string) => (isHindi ? hi : en);
  const [active, setActive] = useState("social");
  const [sections, setSections] = useState<Record<string, SectionValues>>({});
  const [social, setSocial] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/site-config");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSections(data.sections);
      setSocial(data.social);
    } catch (e) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Failed to load." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (section: string, values: unknown) => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, values }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      setMsg({ type: "ok", text: tr("Saved. The website is updated.", "सहेजा गया। वेबसाइट अपडेट हो गई।") });
    } catch (e) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Could not save." });
    } finally {
      setSaving(false);
    }
  };

  const upload = async (key: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("subfolder", "media");
    const res = await fetch("/api/admin/media/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok || !data.url) {
      setMsg({ type: "err", text: data.error || tr("Upload failed.", "अपलोड नहीं हुआ।") });
      return;
    }
    setSections((s) => ({ ...s, [active]: { ...s[active], [key]: data.url } }));
  };

  const def = SECTIONS.find((s) => s.id === active);
  const values = sections[active] ?? {};
  const set = (key: string, v: string | boolean | number) =>
    setSections((s) => ({ ...s, [active]: { ...s[active], [key]: v } }));

  const renderField = (f: FieldDef) => {
    const label = tr(f.en, f.hi);
    const v = values[f.key];
    if (f.type === "toggle") {
      return (
        <label key={f.key} className="flex items-center gap-3 min-h-[44px] text-sm">
          <input type="checkbox" className="w-5 h-5" checked={v === true} onChange={(e) => set(f.key, e.target.checked)} />
          {label}
        </label>
      );
    }
    return (
      <label key={f.key} className="block text-sm space-y-1">
        <span className="font-semibold text-secondary">{label}</span>
        {f.type === "textarea" ? (
          <textarea className={field} rows={3} maxLength={f.max} value={String(v ?? "")} onChange={(e) => set(f.key, e.target.value)} />
        ) : f.type === "color" ? (
          <input type="color" className="block h-11 w-24 rounded border border-outline-variant" value={String(v || "#C2610C")} onChange={(e) => set(f.key, e.target.value)} />
        ) : f.type === "number" ? (
          <input type="number" min={0} className={field} value={Number(v ?? 0)} onChange={(e) => set(f.key, Number(e.target.value))} />
        ) : (
          <span className="flex gap-2">
            <input
              className={field}
              maxLength={f.max}
              inputMode={f.type === "url" ? "url" : undefined}
              placeholder={f.type === "url" || f.type === "image" ? "https://" : ""}
              value={String(v ?? "")}
              onChange={(e) => set(f.key, e.target.value)}
            />
            {f.type === "image" && (
              <span className="relative shrink-0">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  aria-label={tr("Upload image", "इमेज अपलोड करें")}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => e.target.files?.[0] && upload(f.key, e.target.files[0])}
                />
                <span className={`${btn} !bg-surface !text-secondary`}>
                  <Upload className="w-4 h-4" />
                  {tr("Upload", "अपलोड")}
                </span>
              </span>
            )}
          </span>
        )}
        {f.type === "image" && typeof v === "string" && v && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v} alt="" className="h-14 w-auto rounded border border-outline-variant/60 bg-white p-1" />
        )}
      </label>
    );
  };

  if (loading)
    return (
      <div className="space-y-3">
        <h1 className="font-serif text-2xl font-bold text-secondary">{tr("Website Settings", "वेबसाइट सेटिंग्स")}</h1>
        <Loader2 className="w-6 h-6 animate-spin text-primary" aria-label="Loading" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-secondary">{tr("Website Settings", "वेबसाइट सेटिंग्स")}</h1>
        <p className="text-sm text-on-surface-variant">
          {tr("Everything here changes the live website – no code needed.", "यहाँ से हर चीज़ बदलें – कोड की ज़रूरत नहीं।")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <nav aria-label="Sections" className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setActive(s.id);
                setMsg(null);
              }}
              className={`shrink-0 min-h-[44px] px-3 rounded text-left text-sm font-semibold border ${
                active === s.id ? "bg-brand text-on-brand border-maroon" : "bg-surface text-secondary border-outline-variant/60 hover:bg-surface-container-high"
              }`}
            >
              {tr(s.en, s.hi)}
            </button>
          ))}
        </nav>

        <section className="bg-surface border border-outline-variant/60 rounded-lg p-5 space-y-4 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-outline-variant/30">
            <h2 className="font-serif text-lg font-bold text-secondary">{def && tr(def.en, def.hi)}</h2>
            {active === "social" && (
              <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1">
                {tr("Shown automatically in footer and home page", "फुटर और होम पेज पर स्वतः प्रदर्शित")}
              </span>
            )}
          </div>

          {msg && (
            <div role="status" className={`p-3 rounded border text-sm ${msg.type === "ok" ? "border-primary/40 text-primary" : "border-error/40 text-on-error-container"}`}>
              {msg.text}
            </div>
          )}

          {def && (def.noteEn || def.noteHi) && <p className="text-sm text-on-surface-variant">{tr(def.noteEn || "", def.noteHi || "")}</p>}

          {active === "social" ? (
            <div className="space-y-3">
              <p className="text-sm text-on-surface-variant">
                {tr(
                  "Set the name, link and Active / Hide for each platform. Only Active ones with a link appear on the website.",
                  "हर प्लेटफ़ॉर्म का नाम, लिंक और सक्रिय/छिपाएँ चुनें। केवल सक्रिय और लिंक वाले ही वेबसाइट पर दिखेंगे।"
                )}
              </p>
              {social.map((row, i) => (
                <div key={row.id} className="grid grid-cols-[28px_1fr] sm:grid-cols-[28px_160px_1fr_150px_36px] gap-2 items-center rounded-lg border border-outline-variant/50 bg-surface-container-low p-2">
                  <SocialIcon id={row.id} className="w-5 h-5 text-primary" />
                  <input
                    className={field}
                    aria-label={tr("Name", "नाम")}
                    maxLength={40}
                    value={row.name}
                    onChange={(e) => setSocial((l) => l.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))}
                  />
                  <input
                    className={`${field} col-span-2 sm:col-span-1`}
                    aria-label="URL"
                    inputMode="url"
                    placeholder={row.id === "whatsapp" ? "https://wa.me/91XXXXXXXXXX" : "https://"}
                    value={row.url}
                    onChange={(e) => setSocial((l) => l.map((r, j) => (j === i ? { ...r, url: e.target.value } : r)))}
                  />
                  <select
                    className={`${field} col-span-1`}
                    aria-label={tr("Status", "स्थिति")}
                    value={row.active ? "1" : "0"}
                    onChange={(e) => setSocial((l) => l.map((r, j) => (j === i ? { ...r, active: e.target.value === "1" } : r)))}
                  >
                    <option value="1">{tr("Active", "सक्रिय (Active)")}</option>
                    <option value="0">{tr("Hide", "छिपाएँ (Hide)")}</option>
                  </select>
                  {row.url ? (
                    <a href={row.url} target="_blank" rel="noopener noreferrer" aria-label={tr("Open link", "लिंक खोलें")} className="inline-flex justify-center text-primary">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  ) : (
                    <span />
                  )}
                </div>
              ))}
              <button type="button" disabled={saving} onClick={() => save("social", { items: social })} className={btn}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {tr("Save social links", "सोशल लिंक सहेजें")}
              </button>
            </div>
          ) : (
            def && (
              <div className="space-y-4">
                {def.fields.map(renderField)}
                <div className="flex flex-wrap gap-3">
                  {def.fields.length > 0 && (
                    <button type="button" disabled={saving} onClick={() => save(active, values)} className={btn}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {tr("Save", "सहेजें")}
                    </button>
                  )}
                  {def.link && (
                    <a href={def.link.href} className={`${btn} !bg-surface !text-secondary`}>
                      {tr(def.link.en, def.link.hi)}
                    </a>
                  )}
                </div>
              </div>
            )
          )}
        </section>
      </div>
    </div>
  );
}
