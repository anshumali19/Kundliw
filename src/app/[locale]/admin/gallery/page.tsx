"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, AlertCircle, Video, ExternalLink, Pencil, X } from "lucide-react";
import { LinkItem, normalizeLinks } from "@/lib/content/media";
import { ImageUrlField, LinksEditor } from "@/components/admin/MediaFields";

interface MediaItem {
  id: string;
  titleEn: string;
  titleHi: string;
  captionEn?: string | null;
  captionHi?: string | null;
  imageUrl: string;
  videoUrl?: string | null;
  mediaType?: string;
  externalLink?: string | null;
  additionalLinks?: unknown;
  isActive: boolean;
  orderIndex: number;
}

interface FormState {
  titleEn: string;
  titleHi: string;
  captionEn: string;
  captionHi: string;
  imageUrl: string;
  videoUrl: string;
  mediaType: "IMAGE" | "VIDEO" | "YOUTUBE";
  additionalLinks: LinkItem[];
  isActive: boolean;
  orderIndex: number;
}

const EMPTY: FormState = {
  titleEn: "",
  titleHi: "",
  captionEn: "",
  captionHi: "",
  imageUrl: "",
  videoUrl: "",
  mediaType: "IMAGE",
  additionalLinks: [],
  isActive: true,
  orderIndex: 0,
};

const input = "w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface min-h-[44px]";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gallery");
      const data = await res.json();
      if (res.ok) setItems(data.items || []);
      else setError(data.error || "Failed to load gallery items");
    } catch {
      setError("Error loading gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const startEdit = (item: MediaItem) => {
    setEditingId(item.id);
    const links = normalizeLinks(item.additionalLinks);
    // The older single "additional link" becomes the first entry of the list.
    if (item.externalLink && !links.some((l) => l.url === item.externalLink)) {
      links.unshift({ labelEn: "View details", labelHi: "विवरण देखें", url: item.externalLink });
    }
    setForm({
      titleEn: item.titleEn,
      titleHi: item.titleHi,
      captionEn: item.captionEn || "",
      captionHi: item.captionHi || "",
      imageUrl: item.imageUrl,
      videoUrl: item.videoUrl || "",
      mediaType: (item.mediaType as FormState["mediaType"]) || "IMAGE",
      additionalLinks: links,
      isActive: item.isActive,
      orderIndex: item.orderIndex,
    });
    setError(null);
    setSuccess(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch(editingId ? `/api/admin/gallery/${editingId}` : "/api/admin/gallery", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn: form.titleEn,
          titleHi: form.titleHi,
          captionEn: form.captionEn || null,
          captionHi: form.captionHi || null,
          imageUrl: form.imageUrl,
          videoUrl: form.videoUrl.trim() || null,
          mediaType: form.mediaType,
          // The single older link field is now part of the links list.
          externalLink: null,
          additionalLinks: form.additionalLinks.filter((l) => l.url.trim()),
          isActive: form.isActive,
          orderIndex: Number(form.orderIndex) || 0,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(editingId ? "Gallery item updated." : "Gallery item created.");
        cancelEdit();
        fetchItems();
      } else {
        setError(data.error || "Failed to save gallery item.");
      }
    } catch {
      setError("Network error saving gallery item.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (item: MediaItem) => {
    try {
      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (res.ok) setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isActive: !i.isActive } : i)));
      else setError("Failed to update item.");
    } catch {
      setError("Network error updating item.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery item?")) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Item deleted.");
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (editingId === id) cancelEdit();
      } else {
        setError("Failed to delete item.");
      }
    } catch {
      setError("Network error deleting item.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-secondary">Media Gallery Management (चित्र एवं वीडियो दीर्घा)</h1>
        <p className="text-xs text-on-surface-variant">
          Add, edit, hide or remove photos and videos. Each item can have a YouTube video and several extra links.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-error-container/20 border border-error rounded-xl text-on-error-container text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-4 text-xs shadow-sm">
        <div className="flex items-center justify-between gap-2 font-serif font-bold text-sm text-secondary">
          <span className="flex items-center gap-2">
            {editingId ? <Pencil className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
            {editingId ? "Edit Gallery Item" : "Add New Gallery Item"}
          </span>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="min-h-[44px] px-3 inline-flex items-center gap-1 rounded border border-maroon text-xs font-bold">
              <X className="w-4 h-4" /> Cancel edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold block mb-1">Media Type</label>
            <select value={form.mediaType} onChange={(e) => set("mediaType", e.target.value as FormState["mediaType"])} className={input}>
              <option value="IMAGE">Image / Photograph</option>
              <option value="YOUTUBE">YouTube Video Embed</option>
              <option value="VIDEO">Direct Video File</option>
            </select>
          </div>
          <div>
            <label className="font-semibold block mb-1">Title (English) *</label>
            <input type="text" required value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} className={input} />
          </div>
          <div>
            <label className="font-semibold block mb-1">Title (Hindi) *</label>
            <input type="text" required value={form.titleHi} onChange={(e) => set("titleHi", e.target.value)} className={input} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold block mb-1">Caption / Description (English)</label>
            <input type="text" value={form.captionEn} onChange={(e) => set("captionEn", e.target.value)} className={input} />
          </div>
          <div>
            <label className="font-semibold block mb-1">Caption / Description (Hindi)</label>
            <input type="text" value={form.captionHi} onChange={(e) => set("captionHi", e.target.value)} className={input} />
          </div>
        </div>

        <ImageUrlField label="Image or cover photo * (link or upload)" value={form.imageUrl} onChange={(v) => set("imageUrl", v)} folder="gallery" />
        <div>
          <label className="font-semibold block mb-1">Video / YouTube link (optional)</label>
          <input type="url" value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={input} />
        </div>
        <LinksEditor links={form.additionalLinks} onChange={(v) => set("additionalLinks", v)} />

        <div className="flex flex-wrap items-center gap-6 pt-1">
          <div className="flex items-center gap-2">
            <label className="font-semibold">Display Order:</label>
            <input type="number" value={form.orderIndex} onChange={(e) => set("orderIndex", Number(e.target.value))} className="w-20 p-2 rounded-xl border border-outline-variant bg-surface text-on-surface min-h-[44px]" />
          </div>
          <label className="flex items-center gap-2 font-semibold cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4" />
            Active (shown on the website)
          </label>
        </div>

        <div className="sticky bottom-[calc(6.75rem+env(safe-area-inset-bottom,0px))] xl:bottom-12 z-30 bg-surface/95 backdrop-blur border-t border-outline-variant/40 -mx-2 px-2 py-3">
          <button type="submit" disabled={submitting} className="min-h-[44px] px-5 py-2.5 rounded-xl bg-brand text-on-brand font-semibold hover:bg-brand-hover disabled:opacity-50 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>{submitting ? "Saving..." : editingId ? "Save changes" : "Save Gallery Item"}</span>
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <div className="font-serif font-bold text-sm text-secondary">Gallery items ({items.length})</div>

        {loading ? (
          <div className="py-8 text-center text-on-surface-variant text-xs">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface border border-outline-variant/30 text-on-surface-variant text-xs">No gallery items yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {items.map((item) => (
              <div key={item.id} className={`p-4 rounded-2xl bg-surface border space-y-3 text-xs shadow-sm flex flex-col justify-between ${item.isActive ? "border-outline-variant/40" : "border-dashed border-outline-variant opacity-75"}`}>
                <div className="space-y-2">
                  <div className="h-40 w-full rounded-xl overflow-hidden bg-surface-container relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.titleEn} className="w-full h-full object-cover" />
                    {item.mediaType === "YOUTUBE" && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold">YouTube</span>
                    )}
                  </div>
                  <div>
                    <div className="font-serif font-bold text-sm text-secondary">{item.titleEn}</div>
                    <div className="text-primary font-medium">{item.titleHi}</div>
                  </div>
                  {item.captionEn && <p className="text-[11px] text-on-surface-variant line-clamp-2">{item.captionEn}</p>}
                  {item.videoUrl && (
                    <div className="flex items-center gap-1 text-[11px] text-primary truncate">
                      <Video className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.videoUrl}</span>
                    </div>
                  )}
                  {(normalizeLinks(item.additionalLinks).length > 0 || item.externalLink) && (
                    <div className="flex items-center gap-1 text-[11px] text-secondary">
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>{normalizeLinks(item.additionalLinks).length + (item.externalLink ? 1 : 0)} extra link(s)</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1 pt-2 border-t border-outline-variant/20">
                  <button onClick={() => toggleActive(item)} className={`min-h-[44px] px-3 rounded text-[11px] font-bold uppercase ${item.isActive ? "bg-brand text-on-brand" : "bg-surface-container text-outline"}`}>
                    {item.isActive ? "Active" : "Hidden"}
                  </button>
                  <span className="text-[10px] font-mono text-outline">#{item.orderIndex}</span>
                  <div className="flex">
                    <button onClick={() => startEdit(item)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-secondary hover:bg-gold" aria-label="Edit item">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-on-error-container hover:bg-error-container/20" aria-label="Delete item">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
