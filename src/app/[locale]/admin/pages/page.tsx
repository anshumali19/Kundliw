"use client";

import React, { useState, useEffect } from "react";
import { Save, CheckCircle2, AlertCircle, Plus, Trash2, ExternalLink } from "lucide-react";
import { DEFAULT_GUIDES, GUIDE_SLUGS, guidePageSlug } from "@/lib/guides/defaults";
import { ContentBlock, normalizeBlocks } from "@/lib/content/media";
import { isCorePageSlug } from "@/lib/content/pages";
import { BlocksEditor } from "@/components/admin/MediaFields";

interface StaticPageItem {
  id: string;
  slug: string;
  titleEn: string;
  titleHi: string;
  contentEn: string;
  contentHi: string;
  blocks?: unknown;
  isActive: boolean;
  showInFooter: boolean;
  updatedAt: string;
}

const PRESET_PAGES = [
  { slug: "about", name: "About the Kendra (संस्था परिचय)", path: "/about" },
  { slug: "founder", name: "Founder & Astrological Lineage (संस्थापक परंपरा)", path: "/founder" },
  { slug: "help", name: "Help & Frequently Asked Questions (सहायता)", path: "/help" },
  { slug: "terms", name: "Terms of Service & Astrological Ethics (नियम व शर्तें)", path: "/legal/terms" },
  { slug: "privacy", name: "Privacy Policy (गोपनीयता नीति)", path: "/legal/privacy" },
  { slug: "refund", name: "Cancellation & Refund Policy (धनवापसी नीति)", path: "/legal/refund" },
  { slug: "guide-user", name: "Guide: User (उपयोगकर्ता मार्गदर्शिका)", path: "/guides/user" },
  { slug: "guide-associate", name: "Guide: Associate (एसोसिएट मार्गदर्शिका)", path: "/guides/associate" },
  { slug: "guide-admin", name: "Guide: Admin (एडमिन मार्गदर्शिका)", path: "/guides/admin" },
];

const field =
  "w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none";
const label = "block text-xs font-bold uppercase text-on-surface-variant mb-1";

export default function AdminPagesPage() {
  const [pages, setPages] = useState<StaticPageItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("about");
  const [creating, setCreating] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [titleEn, setTitleEn] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [contentHi, setContentHi] = useState("");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [showInFooter, setShowInFooter] = useState(false);

  const customPages = pages.filter((p) => !isCorePageSlug(p.slug));
  const isCore = isCorePageSlug(selectedSlug);
  const selectedPage = pages.find((p) => p.slug === selectedSlug);

  const loadSlugData = (slug: string, pagesList: StaticPageItem[]) => {
    const existing = pagesList.find((p) => p.slug === slug);
    if (existing) {
      setTitleEn(existing.titleEn);
      setTitleHi(existing.titleHi);
      setContentEn(existing.contentEn);
      setContentHi(existing.contentHi);
      setBlocks(normalizeBlocks(existing.blocks));
      setIsActive(existing.isActive);
      setShowInFooter(existing.showInFooter);
    } else if (GUIDE_SLUGS.some((g) => guidePageSlug(g) === slug)) {
      const guide = DEFAULT_GUIDES[slug.replace("guide-", "") as keyof typeof DEFAULT_GUIDES];
      setTitleEn(guide.titleEn);
      setTitleHi(guide.titleHi);
      setContentEn(guide.contentEn);
      setContentHi(guide.contentHi);
      setBlocks([]);
      setIsActive(true);
      setShowInFooter(false);
    } else {
      const preset = PRESET_PAGES.find((p) => p.slug === slug);
      setTitleEn(preset ? preset.name.split(" (")[0] : slug);
      setTitleHi(preset ? preset.name.split("(")[1]?.replace(")", "") || slug : slug);
      setContentEn(`${slug}: content coming soon.`);
      setContentHi(`${slug}: विवरण शीघ्र उपलब्ध होगा।`);
      setBlocks([]);
      setIsActive(true);
      setShowInFooter(false);
    }
  };

  const fetchPages = async (slugToLoad?: string) => {
    try {
      const res = await fetch("/api/admin/pages");
      const data = await res.json();
      if (res.ok) {
        setPages(data.pages || []);
        loadSlugData(slugToLoad || selectedSlug, data.pages || []);
      } else {
        setError(data.error || "Failed to load pages");
      }
    } catch {
      setError("Error loading pages");
    }
  };

  useEffect(() => {
    fetchPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectSlug = (slug: string) => {
    setCreating(false);
    setSelectedSlug(slug);
    loadSlugData(slug, pages);
    setError(null);
    setSuccess(null);
  };

  const startNewPage = () => {
    setCreating(true);
    setNewSlug("");
    setSelectedSlug("");
    setTitleEn("");
    setTitleHi("");
    setContentEn("");
    setContentHi("");
    setBlocks([]);
    setIsActive(true);
    setShowInFooter(true);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = creating ? newSlug.trim().toLowerCase() : selectedSlug;
    if (!/^[a-z0-9-]{2,60}$/.test(slug)) {
      setError("The page address may contain only lowercase letters, numbers and hyphens (at least 2 characters).");
      return;
    }
    if (creating && (isCorePageSlug(slug) || pages.some((p) => p.slug === slug))) {
      setError("A page with this address already exists.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          titleEn,
          titleHi,
          contentEn,
          contentHi,
          blocks,
          isActive,
          showInFooter,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Page "${slug}" saved`);
        setCreating(false);
        setSelectedSlug(slug);
        await fetchPages(slug);
      } else {
        const detail = data.details?.fieldErrors ? Object.values(data.details.fieldErrors).flat().join(" ") : "";
        setError(`${data.error || "Failed to save page"} ${detail}`.trim());
      }
    } catch {
      setError("Error saving page");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPage || isCore) return;
    if (!window.confirm(`Remove the page "${selectedPage.titleEn}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/pages/${selectedPage.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove page");
      setSuccess("Page removed");
      setSelectedSlug("about");
      await fetchPages("about");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove page");
    }
  };

  const publicPath = isCore
    ? PRESET_PAGES.find((p) => p.slug === selectedSlug)?.path
    : selectedSlug
      ? `/pages/${selectedSlug}`
      : undefined;

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="font-serif text-2xl font-bold text-secondary">स्थैतिक पृष्ठ संपादक • Pages CMS</h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Edit the text of About, Help and Legal pages, add images, YouTube videos and links as blocks, and create your own pages for the footer Quick Links.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded bg-error-container/20 border border-error text-on-error-container text-xs flex items-center gap-2">
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

      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-outline-variant/40">
        {[...PRESET_PAGES, ...customPages.map((p) => ({ slug: p.slug, name: `${p.titleEn} (custom)`, path: `/pages/${p.slug}` }))].map((preset) => {
          const isSelected = !creating && selectedSlug === preset.slug;
          const saved = pages.some((p) => p.slug === preset.slug);
          return (
            <button
              key={preset.slug}
              type="button"
              onClick={() => handleSelectSlug(preset.slug)}
              className={`min-h-[44px] px-3.5 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isSelected ? "bg-brand text-on-brand" : "bg-surface-container hover:bg-surface-container-high text-on-surface"
              }`}
            >
              <span>{preset.name}</span>
              {saved && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
            </button>
          );
        })}
        <button
          type="button"
          onClick={startNewPage}
          className={`min-h-[44px] px-3.5 py-1.5 rounded text-xs font-bold whitespace-nowrap flex items-center gap-1.5 border border-maroon ${
            creating ? "bg-brand text-on-brand" : "bg-surface text-secondary hover:bg-brand"
          }`}
        >
          <Plus className="w-4 h-4" /> New page
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-surface rounded-lg p-6 border-2 border-secondary/20 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {creating ? "New page" : `Editing: ${publicPath || selectedSlug}`}
            </span>
            <h2 className="font-serif text-lg font-bold text-secondary">{titleEn || "Untitled page"}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {!creating && publicPath && (
              <a href={publicPath} target="_blank" rel="noreferrer" className="min-h-[44px] px-3 inline-flex items-center gap-1.5 rounded border border-maroon text-xs font-bold text-secondary hover:bg-brand">
                <ExternalLink className="w-4 h-4" /> View page
              </a>
            )}
            {!creating && !isCore && selectedPage && (
              <button type="button" onClick={handleDelete} className="min-h-[44px] px-3 inline-flex items-center gap-1.5 rounded border border-error text-xs font-bold text-on-error-container hover:bg-error-container">
                <Trash2 className="w-4 h-4" /> Remove page
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] px-6 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Page"}</span>
            </button>
          </div>
        </div>

        {creating && (
          <div>
            <label className={label}>Page address * (letters, numbers and hyphens)</label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-on-surface-variant">/pages/</span>
              <input type="text" required value={newSlug} onChange={(e) => setNewSlug(e.target.value.toLowerCase())} placeholder="our-process" className={field + " font-mono max-w-xs"} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className={label}>Title (English) *</label>
              <input type="text" required value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={field} />
            </div>
            <div>
              <label className={label}>Page text (English) *</label>
              <textarea required rows={12} value={contentEn} onChange={(e) => setContentEn(e.target.value)} className="w-full p-3 text-xs bg-surface-container-low border border-outline-variant rounded focus:border-secondary focus:outline-none" />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className={label}>शीर्षक (हिन्दी) *</label>
              <input type="text" required value={titleHi} onChange={(e) => setTitleHi(e.target.value)} className={field} />
            </div>
            <div>
              <label className={label}>पृष्ठ का पाठ (हिन्दी) *</label>
              <textarea required rows={12} value={contentHi} onChange={(e) => setContentHi(e.target.value)} className="w-full p-3 text-xs bg-surface-container-low border border-outline-variant rounded focus:border-secondary focus:outline-none" />
            </div>
          </div>
        </div>

        <BlocksEditor blocks={blocks} onChange={setBlocks} />

        {!isCore && (
          <div className="flex flex-wrap items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4" />
              Active (page is visible)
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input type="checkbox" checked={showInFooter} onChange={(e) => setShowInFooter(e.target.checked)} className="w-4 h-4" />
              Show in footer Quick Links
            </label>
          </div>
        )}

        <div className="sticky bottom-[calc(6.75rem+env(safe-area-inset-bottom,0px))] xl:bottom-12 z-30 bg-surface/95 backdrop-blur border-t border-outline-variant/40 -mx-2 px-2 py-3">
          <button type="submit" disabled={saving} className="min-h-[44px] px-6 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 disabled:opacity-50">
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Page"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
