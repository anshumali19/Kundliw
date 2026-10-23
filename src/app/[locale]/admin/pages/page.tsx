"use client";

import React, { useState, useEffect } from "react";
import { FileText, Save, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

interface StaticPageItem {
  id: string;
  slug: string;
  titleEn: string;
  titleHi: string;
  contentEn: string;
  contentHi: string;
  updatedAt: string;
}

const PRESET_PAGES = [
  { slug: "about", name: "About the Kendra (संस्था परिचय)" },
  { slug: "founder", name: "Founder & Astrological Lineage (संस्थापक परंपरा)" },
  { slug: "help", name: "Help & Frequently Asked Questions (सहायता)" },
  { slug: "terms", name: "Terms of Service & Astrological Ethics (नियम व शर्तें)" },
  { slug: "privacy", name: "Privacy Policy (गोपनीयता नीति)" },
  { slug: "refund", name: "Cancellation & Refund Policy (धनवापसी नीति)" },
];

export default function AdminPagesPage() {
  const [pages, setPages] = useState<StaticPageItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("about");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form
  const [titleEn, setTitleEn] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [contentHi, setContentHi] = useState("");

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pages");
      const data = await res.json();
      if (res.ok) {
        setPages(data.pages || []);
        loadSlugData(selectedSlug, data.pages || []);
      } else {
        setError(data.error || "Failed to load pages");
      }
    } catch {
      setError("Error loading pages");
    } finally {
      setLoading(false);
    }
  };

  const loadSlugData = (slug: string, pagesList: StaticPageItem[]) => {
    const existing = pagesList.find((p) => p.slug === slug);
    if (existing) {
      setTitleEn(existing.titleEn);
      setTitleHi(existing.titleHi);
      setContentEn(existing.contentEn);
      setContentHi(existing.contentHi);
    } else {
      const preset = PRESET_PAGES.find((p) => p.slug === slug);
      setTitleEn(preset ? preset.name.split(" (")[0] : slug);
      setTitleHi(preset ? preset.name.split("(")[1]?.replace(")", "") || slug : slug);
      setContentEn(`## ${slug}\n\nContent for ${slug} is being drafted.`);
      setContentHi(`## ${slug}\n\n${slug} का विवरण अभी तैयार किया जा रहा है।`);
    }
  };

  useEffect(() => {
    fetchPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectSlug = (slug: string) => {
    setSelectedSlug(slug);
    loadSlugData(slug, pages);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: selectedSlug,
          titleEn,
          titleHi,
          contentEn,
          contentHi,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`Page "${selectedSlug}" saved successfully`);
        fetchPages();
      } else {
        setError(data.error || "Failed to save page");
      }
    } catch {
      setError("Error saving static page");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="font-serif text-2xl font-bold text-secondary">
          स्थैतिक पृष्ठ संपादक • Static Pages CMS
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Edit bilingual copy for About, Founder Lineage, Legal, and Help pages.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded bg-error-container/20 border border-error text-error text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Page Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-outline-variant/40">
        {PRESET_PAGES.map((preset) => {
          const isSelected = selectedSlug === preset.slug;
          const isSaved = pages.some((p) => p.slug === preset.slug);
          return (
            <button
              key={preset.slug}
              type="button"
              onClick={() => handleSelectSlug(preset.slug)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? "bg-secondary text-on-secondary"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface"
              }`}
            >
              <span>{preset.name}</span>
              {isSaved && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
            </button>
          );
        })}
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSave} className="bg-surface rounded-lg p-6 border-2 border-secondary/20 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Editing: /{selectedSlug === "terms" || selectedSlug === "privacy" || selectedSlug === "refund" ? `legal/${selectedSlug}` : selectedSlug}
            </span>
            <h2 className="font-serif text-lg font-bold text-secondary">{titleEn}</h2>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-6 py-2.5 bg-secondary hover:bg-secondary/90 text-on-secondary font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Page"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* English Version */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Title (English) *
              </label>
              <input
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Body Content (English - Markdown/HTML) *
              </label>
              <textarea
                required
                rows={16}
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-surface-container-low border border-outline-variant rounded focus:border-secondary focus:outline-none"
              />
            </div>
          </div>

          {/* Hindi Version */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                शीर्षक (हिन्दी) *
              </label>
              <input
                type="text"
                required
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                सामग्री विवरण (हिन्दी - Markdown/HTML) *
              </label>
              <textarea
                required
                rows={16}
                value={contentHi}
                onChange={(e) => setContentHi(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-surface-container-low border border-outline-variant rounded focus:border-secondary focus:outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
