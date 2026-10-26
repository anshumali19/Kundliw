"use client";

import { LinkTextarea } from "@/components/admin/LinkTextarea";
import React, { useState, useEffect, useCallback } from "react";
import { LinkItem, normalizeLinks } from "@/lib/content/media";
import { ImageUrlField, LinksEditor, YouTubeUrlField } from "@/components/admin/MediaFields";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Video,
  Globe,
  RefreshCw,
  X,
} from "lucide-react";

export interface OtherServiceItem {
  id: string;
  slug: string;
  titleEn: string;
  titleHi: string;
  taglineEn?: string | null;
  taglineHi?: string | null;
  descriptionEn: string;
  descriptionHi: string;
  imageUrl?: string | null;
  actionUrl?: string | null;
  actionTextEn?: string | null;
  actionTextHi?: string | null;
  youtubeUrl?: string | null;
  additionalLinks?: unknown;
  orderIndex: number;
  isActive: boolean;
}

export function AdminOtherServicesManager({ locale }: { locale: string }) {
  const isHindi = locale === "hi";

  const [items, setItems] = useState<OtherServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OtherServiceItem | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [slug, setSlug] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [taglineEn, setTaglineEn] = useState("");
  const [taglineHi, setTaglineHi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionHi, setDescriptionHi] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [actionTextEn, setActionTextEn] = useState("");
  const [actionTextHi, setActionTextHi] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [orderIndex, setOrderIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/other-services");
      const data = await res.json();
      if (res.ok && data.items) {
        setItems(data.items);
      } else {
        setStatus({ type: "error", text: data.error || "Failed to load other services." });
      }
    } catch {
      setStatus({ type: "error", text: "Network error loading other services." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenModal = (item?: OtherServiceItem) => {
    setStatus(null);
    if (item) {
      setEditingItem(item);
      setSlug(item.slug);
      setTitleEn(item.titleEn);
      setTitleHi(item.titleHi);
      setTaglineEn(item.taglineEn || "");
      setTaglineHi(item.taglineHi || "");
      setDescriptionEn(item.descriptionEn);
      setDescriptionHi(item.descriptionHi);
      setImageUrl(item.imageUrl || "");
      setActionUrl(item.actionUrl || "");
      setActionTextEn(item.actionTextEn || "Visit Portal / Learn More");
      setActionTextHi(item.actionTextHi || "पोर्टल पर जाएं / विवरण देखें");
      setYoutubeUrl(item.youtubeUrl || "");
      setLinks(normalizeLinks(item.additionalLinks));
      setOrderIndex(item.orderIndex);
      setIsActive(item.isActive);
    } else {
      setEditingItem(null);
      setSlug("");
      setTitleEn("");
      setTitleHi("");
      setTaglineEn("");
      setTaglineHi("");
      setDescriptionEn("");
      setDescriptionHi("");
      setImageUrl("");
      setActionUrl("");
      setActionTextEn("Visit Portal / Learn More");
      setActionTextHi("पोर्टल पर जाएं / विवरण देखें");
      setYoutubeUrl("");
      setLinks([]);
      setOrderIndex(items.length + 1);
      setIsActive(true);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const payload = {
      slug: slug.trim(),
      titleEn: titleEn.trim(),
      titleHi: titleHi.trim(),
      taglineEn: taglineEn.trim() || null,
      taglineHi: taglineHi.trim() || null,
      descriptionEn: descriptionEn.trim(),
      descriptionHi: descriptionHi.trim(),
      imageUrl: imageUrl.trim() || null,
      actionUrl: actionUrl.trim() || null,
      actionTextEn: actionTextEn.trim() || null,
      actionTextHi: actionTextHi.trim() || null,
      youtubeUrl: youtubeUrl.trim() || null,
      additionalLinks: links.filter((l) => l.url.trim()),
      orderIndex: Number(orderIndex),
      isActive,
    };

    try {
      const url = editingItem
        ? `/api/admin/other-services/${editingItem.id}`
        : "/api/admin/other-services";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({
          type: "success",
          text: isHindi
            ? "अन्य सेवा विवरण सफलतापूर्वक सहेजा गया।"
            : "Other service saved successfully.",
        });
        setModalOpen(false);
        fetchItems();
      } else {
        setStatus({ type: "error", text: data.error || "Save failed." });
      }
    } catch {
      setStatus({ type: "error", text: "Network error saving other service." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        isHindi
          ? "क्या आप इस अन्य सेवा प्रविष्टि को हटाना चाहते हैं?"
          : "Are you sure you want to delete this service entry?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/other-services/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStatus({
          type: "success",
          text: isHindi ? "प्रविष्टि हटाई गई।" : "Entry deleted successfully.",
        });
        fetchItems();
      } else {
        setStatus({ type: "error", text: "Failed to delete entry." });
      }
    } catch {
      setStatus({ type: "error", text: "Network error deleting entry." });
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-serif font-bold text-on-surface">
              {isHindi ? "अन्य सेवाएँ CMS" : "Other Services CMS"}
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            {isHindi
              ? "भारत दर्शन तीर्थ यात्रा, वैवाहिक संस्कार (विंध्य विवाह संस्कार) एवं यूट्यूब प्रवचन चैनल का प्रबंधन।"
              : "Manage Bharat Darshan Teerth Yatra, Matrimonial Portal links, and YouTube video discourse cards."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchItems}
            disabled={loading}
            className="p-2 rounded-xl border border-outline-variant hover:bg-surface-container text-on-surface-variant transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-xl bg-brand text-on-brand hover:bg-brand-hover transition-colors font-semibold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isHindi ? "नई सेवा जोड़ें" : "Add Other Service"}</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {status && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2 text-xs ${
            status.type === "success"
              ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
              : "bg-error-container0/10 text-on-error-container border border-error"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{status.text}</span>
        </div>
      )}

      {/* Items List */}
      {loading ? (
        <div className="py-12 text-center text-on-surface-variant text-xs">
          Loading other services...
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-2">
          <Sparkles className="w-8 h-8 text-outline mx-auto" />
          <p className="text-sm font-semibold text-on-surface">
            {isHindi ? "कोई प्रविष्टि नहीं मिली" : "No entries found"}
          </p>
          <p className="text-xs text-on-surface-variant">
            {isHindi
              ? "डिफ़ॉल्ट रूप से तीर्थ यात्रा, विवाह संस्कार एवं यूट्यूब चैनल सार्वजनिक पृष्ठ पर प्रदर्शित हैं।"
              : "Default entries (Teerth Yatra, Matrimonial, YouTube) appear on the public page until customized here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-surface border border-outline-variant/40 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                    /{item.slug}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      item.isActive
                        ? "bg-emerald-500/15 text-emerald-700"
                        : "bg-outline/10 text-outline"
                    }`}
                  >
                    {item.isActive ? "Active" : "Disabled"}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base text-secondary">
                  {item.titleEn}
                </h3>
                <p className="text-xs text-primary font-medium">
                  {item.titleHi}
                </p>
                <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                  {item.descriptionEn}
                </p>

                {item.actionUrl && (
                  <div className="flex items-center gap-1 text-[11px] text-on-surface-variant pt-1 truncate">
                    <Globe className="w-3 h-3 text-secondary shrink-0" />
                    <span className="truncate">{item.actionUrl}</span>
                  </div>
                )}
                {item.youtubeUrl && (
                  <div className="flex items-center gap-1 text-[11px] text-on-error-container truncate">
                    <Video className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.youtubeUrl}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenModal(item)}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant text-secondary hover:bg-surface-container transition-colors text-xs font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isHindi ? "संपादित करें" : "Edit"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg hover:bg-error-container0/10 text-outline hover:text-on-error-container transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-surface border border-outline-variant/60 rounded-2xl shadow-2xl overflow-hidden max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between shrink-0">
              <h2 className="font-serif font-bold text-base text-secondary">
                {editingItem
                  ? isHindi
                    ? "अन्य सेवा संपादित करें"
                    : "Edit Other Service"
                  : isHindi
                  ? "नई अन्य सेवा जोड़ें"
                  : "Add Other Service"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Slug (URL Identifier) *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. teerth-yatra"
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Display Order Index</label>
                  <input
                    type="number"
                    min={0}
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="Bharat Darshan Teerth Yatra"
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">शीर्षक (हिन्दी) *</label>
                  <input
                    type="text"
                    required
                    value={titleHi}
                    onChange={(e) => setTitleHi(e.target.value)}
                    placeholder="भारत दर्शन तीर्थ यात्रा"
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Tagline (English)</label>
                  <input
                    type="text"
                    value={taglineEn}
                    onChange={(e) => setTaglineEn(e.target.value)}
                    placeholder="Sacred Pilgrimage Guided by Vedic Scholars"
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">टैगलाइन (हिन्दी)</label>
                  <input
                    type="text"
                    value={taglineHi}
                    onChange={(e) => setTaglineHi(e.target.value)}
                    placeholder="विद्वानों के सानिध्य में पावन तीर्थ यात्रा"
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Description (English) *</label>
                  <LinkTextarea rows={3} value={descriptionEn} onChange={(v) => setDescriptionEn(v)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface" required />
                </div>
                <div>
                  <label className="font-semibold block mb-1">विवरण (हिन्दी) *</label>
                  <LinkTextarea rows={3} value={descriptionHi} onChange={(v) => setDescriptionHi(v)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Action Outbound URL</label>
                  <input
                    type="url"
                    value={actionUrl}
                    onChange={(e) => setActionUrl(e.target.value)}
                    placeholder="https://vindhyavivahsanskar.com"
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Action Button Text (English)</label>
                  <input
                    type="text"
                    value={actionTextEn}
                    onChange={(e) => setActionTextEn(e.target.value)}
                    placeholder="Visit Sister Portal"
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
                  />
                </div>
              </div>

              <ImageUrlField label="Image (link or upload)" value={imageUrl} onChange={setImageUrl} folder="other-services" />
              <YouTubeUrlField label="YouTube video link" value={youtubeUrl} onChange={setYoutubeUrl} />
              <LinksEditor links={links} onChange={setLinks} label="Additional links (besides the main button above)" />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="itemActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="itemActive" className="font-semibold text-on-surface">
                  {isHindi ? "सक्रिय रखें (Visible on public Other Services page)" : "Active (Visible publicly)"}
                </label>
              </div>

              <div className="sticky bottom-0 z-10 bg-surface -mx-6 -mb-6 px-6 py-3 border-t border-outline-variant/30 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface-variant font-medium text-xs hover:bg-surface-container"
                >
                  {isHindi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand text-on-brand hover:bg-brand-hover font-semibold text-xs disabled:opacity-50"
                >
                  {submitting ? "Saving..." : isHindi ? "सहेजें" : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
