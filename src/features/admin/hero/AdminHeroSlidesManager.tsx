"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2, Plus, Trash2 } from "lucide-react";
import { ImageUrlField } from "@/components/admin/MediaFields";
import { HeroSlide, MAX_HERO_SLIDES } from "@/lib/content/heroSlides";

interface ServiceOption {
  slug: string;
  titleEn: string;
  titleHi: string;
  imageUrl: string | null;
}

const input =
  "w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]";
const label = "block text-xs font-bold uppercase text-secondary mb-1";
const smallBtn =
  "inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3 rounded border border-maroon bg-surface hover:bg-gold text-xs font-bold text-secondary disabled:opacity-40";

const blank = (): HeroSlide => ({
  id: `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
  imageUrl: "",
  titleEn: "",
  titleHi: "",
  descEn: "",
  descHi: "",
  youtubeUrl: "",
  serviceSlug: "",
  isActive: true,
});

export function AdminHeroSlidesManager({ locale, services }: { locale: string; services: ServiceOption[] }) {
  const isHindi = locale === "hi";
  const tr = (en: string, hi: string) => (isHindi ? hi : en);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/hero-slides")
      .then((r) => r.json())
      .then((d) => setSlides(d.items ?? []))
      .catch(() => setMsg({ ok: false, text: tr("Could not load the slides.", "स्लाइड लोड नहीं हो सकीं।") }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (i: number, patch: Partial<HeroSlide>) => setSlides((l) => l.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const move = (i: number, dir: -1 | 1) =>
    setSlides((l) => {
      const j = i + dir;
      if (j < 0 || j >= l.length) return l;
      const n = [...l];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  const serviceImage = (slug: string) => services.find((s) => s.slug === slug)?.imageUrl || "";

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/hero-slides", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: slides }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMsg({ ok: true, text: tr("Saved. The home page now shows these slides.", "सहेजा गया। होम पेज पर अब ये स्लाइड दिखेंगी।") });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader2 className="w-6 h-6 animate-spin text-primary" aria-label="Loading" />;

  return (
    <div className="space-y-5 text-left">
      <div>
        <h1 className="font-serif text-2xl font-bold text-secondary">{tr("Home page hero slides", "होम पेज हीरो स्लाइड")}</h1>
        <p className="text-sm text-on-surface-variant max-w-3xl">
          {tr(
            `Add up to ${MAX_HERO_SLIDES} pictures for the top of the home page. Each slide has its own text, a YouTube link and, if you like, a service. A slide linked to a service uses that service's picture when you add none, so the same picture serves both. With no active slides the usual top section is shown.`,
            `होम पेज के ऊपर ${MAX_HERO_SLIDES} तक तस्वीरें जोड़ें। हर स्लाइड का अपना लेख, YouTube लिंक और चाहें तो एक सेवा होती है। सेवा से जुड़ी स्लाइड में तस्वीर न दें तो सेवा की तस्वीर ही दिखती है, यानी एक ही तस्वीर दोनों जगह।`
          )}
        </p>
      </div>

      {slides.length === 0 && <p className="text-sm text-on-surface-variant">{tr("No slides yet.", "अभी कोई स्लाइड नहीं।")}</p>}

      {slides.map((s, i) => {
        const svcImg = serviceImage(s.serviceSlug);
        const shownImg = s.imageUrl || svcImg;
        return (
          <div key={s.id} className={`rounded-lg border p-4 space-y-4 ${s.isActive ? "border-outline-variant/60 bg-surface" : "border-dashed border-outline-variant bg-surface-container-low opacity-80"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {tr("Slide", "स्लाइड")} {i + 1} {s.isActive ? "" : `(${tr("hidden", "छिपी")})`}
              </span>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={smallBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label={tr("Move up", "ऊपर")}>
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button type="button" className={smallBtn} onClick={() => move(i, 1)} disabled={i === slides.length - 1} aria-label={tr("Move down", "नीचे")}>
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button type="button" className={smallBtn} onClick={() => update(i, { isActive: !s.isActive })} aria-pressed={s.isActive}>
                  {s.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {s.isActive ? tr("Active", "चालू") : tr("Hidden", "छिपी")}
                </button>
                <button type="button" className={smallBtn} onClick={() => setSlides((l) => l.filter((_, j) => j !== i))} aria-label={tr("Remove slide", "स्लाइड हटाएँ")}>
                  <Trash2 className="w-4 h-4" /> {tr("Remove", "हटाएँ")}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className={label}>{tr("Service (optional)", "सेवा (वैकल्पिक)")}</label>
                  <select className={input} value={s.serviceSlug} onChange={(e) => update(i, { serviceSlug: e.target.value })}>
                    <option value="">{tr("No service", "कोई सेवा नहीं")}</option>
                    {services.map((v) => (
                      <option key={v.slug} value={v.slug}>
                        {isHindi ? v.titleHi : v.titleEn}
                      </option>
                    ))}
                  </select>
                  {s.serviceSlug && (
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {tr("The View service button opens this service. ", "'सेवा देखें' बटन इसी सेवा को खोलेगा। ")}
                      {svcImg
                        ? tr("Its picture is used if you add none below.", "नीचे तस्वीर न दें तो इसकी तस्वीर दिखेगी।")
                        : tr("This service has no picture yet, so add one below.", "इस सेवा की तस्वीर अभी नहीं है, नीचे जोड़ें।")}
                    </p>
                  )}
                </div>
                <ImageUrlField label={tr("Picture", "तस्वीर")} value={s.imageUrl} onChange={(url) => update(i, { imageUrl: url })} folder="banners" />
                {s.imageUrl === "" && svcImg && (
                  <p className="text-xs text-on-surface-variant">{tr("Using the service picture shown below.", "सेवा की तस्वीर नीचे दिख रही है।")}</p>
                )}
                {shownImg && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={shownImg} alt="" className="h-28 w-auto rounded border border-outline-variant/60 object-cover" />
                )}
                <div>
                  <label className={label}>{tr("YouTube link", "YouTube लिंक")}</label>
                  <input type="url" className={input} value={s.youtubeUrl} onChange={(e) => update(i, { youtubeUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className={label}>{tr("Heading (English)", "शीर्षक (अंग्रेज़ी)")}</label>
                  <input className={input} maxLength={160} value={s.titleEn} onChange={(e) => update(i, { titleEn: e.target.value })} />
                </div>
                <div>
                  <label className={label}>{tr("Heading (Hindi)", "शीर्षक (हिंदी)")}</label>
                  <input className={input} maxLength={160} value={s.titleHi} onChange={(e) => update(i, { titleHi: e.target.value })} />
                </div>
                <div>
                  <label className={label}>{tr("Description (English)", "विवरण (अंग्रेज़ी)")}</label>
                  <textarea rows={3} className={input} maxLength={600} value={s.descEn} onChange={(e) => update(i, { descEn: e.target.value })} />
                </div>
                <div>
                  <label className={label}>{tr("Description (Hindi)", "विवरण (हिंदी)")}</label>
                  <textarea rows={3} className={input} maxLength={600} value={s.descHi} onChange={(e) => update(i, { descHi: e.target.value })} />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={smallBtn} disabled={slides.length >= MAX_HERO_SLIDES} onClick={() => setSlides((l) => [...l, blank()])}>
          <Plus className="w-4 h-4" /> {tr("Add slide", "स्लाइड जोड़ें")} ({slides.length}/{MAX_HERO_SLIDES})
        </button>
        <button type="button" onClick={save} disabled={saving} className="min-h-[44px] px-6 rounded bg-brand text-on-brand text-sm font-bold hover:bg-brand-hover disabled:opacity-50 inline-flex items-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {tr("Save slides", "स्लाइड सहेजें")}
        </button>
        {msg && (
          <span role="status" className={`inline-flex items-center gap-1.5 text-sm font-semibold ${msg.ok ? "text-tertiary" : "text-on-error-container"}`}>
            {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
