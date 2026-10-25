"use client";

import React, { useState, useEffect } from "react";
import {
  Image,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Upload,
  Video,
  ExternalLink,
  Layers,
} from "lucide-react";

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
  orderIndex: number;
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form
  const [titleEn, setTitleEn] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [captionEn, setCaptionEn] = useState("");
  const [captionHi, setCaptionHi] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO" | "YOUTUBE">("IMAGE");
  const [externalLink, setExternalLink] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gallery");
      const data = await res.json();
      if (res.ok) {
        setItems(data.items || []);
      } else {
        setError(data.error || "Failed to load gallery items");
      }
    } catch {
      setError("Error loading gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subfolder", "gallery");

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setImageUrl(data.url);
        setSuccess("Gallery media uploaded successfully.");
      } else {
        setError(data.error || "Upload failed");
      }
    } catch {
      setError("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn,
          titleHi,
          captionEn: captionEn || null,
          captionHi: captionHi || null,
          imageUrl,
          videoUrl: videoUrl || null,
          mediaType,
          externalLink: externalLink || null,
          orderIndex: Number(orderIndex) || 0,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Gallery item created successfully.");
        setTitleEn("");
        setTitleHi("");
        setCaptionEn("");
        setCaptionHi("");
        setImageUrl("");
        setVideoUrl("");
        setMediaType("IMAGE");
        setExternalLink("");
        setOrderIndex(0);
        fetchItems();
      } else {
        setError(data.error || "Failed to create gallery item.");
      }
    } catch {
      setError("Network error creating gallery item.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery item?")) return;

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSuccess("Item deleted.");
        setItems((prev) => prev.filter((i) => i.id !== id));
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
        <h1 className="font-serif text-2xl font-bold text-secondary">
          Media Gallery Management (चित्र एवं वीडियो दीर्घा)
        </h1>
        <p className="text-xs text-on-surface-variant">
          Upload sanctum photos, add YouTube discourse links, video URLs, and external links (#11).
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add New Media Form */}
      <form
        onSubmit={handleCreate}
        className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-4 text-xs shadow-sm"
      >
        <div className="flex items-center gap-2 font-serif font-bold text-sm text-secondary">
          <Plus className="w-4 h-4 text-primary" />
          <span>Add New Gallery Item</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold block mb-1">Media Type</label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
            >
              <option value="IMAGE">Image / Photograph</option>
              <option value="YOUTUBE">YouTube Video Embed</option>
              <option value="VIDEO">Direct Video File</option>
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-1">Title (English) *</label>
            <input
              type="text"
              required
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="e.g. Sanctum Altar Aarti"
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Title (Hindi) *</label>
            <input
              type="text"
              required
              value={titleHi}
              onChange={(e) => setTitleHi(e.target.value)}
              placeholder="उदा. दशाश्वमेध घाट पीठ वेदी"
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold block mb-1">Caption / Description (English)</label>
            <input
              type="text"
              value={captionEn}
              onChange={(e) => setCaptionEn(e.target.value)}
              placeholder="Short description in English"
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Caption / Description (Hindi)</label>
            <input
              type="text"
              value={captionHi}
              onChange={(e) => setCaptionHi(e.target.value)}
              placeholder="संक्षिप्त हिंदी विवरण"
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold block mb-1">Image URL or Cover Photo *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/images/gallery-1.jpg or URL"
                className="flex-1 p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
              />
              <label className="p-2.5 rounded-xl border border-outline-variant bg-surface-container hover:bg-surface-container-high cursor-pointer flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-on-surface-variant" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Video / YouTube URL (Optional)</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Additional Link / URL (Optional)</label>
            <input
              type="text"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="https://..."
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <label className="font-semibold">Display Order:</label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              className="w-20 p-2 rounded-xl border border-outline-variant bg-surface text-on-surface"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || uploading}
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{submitting ? "Saving..." : "Save Gallery Item"}</span>
          </button>
        </div>
      </form>

      {/* Gallery Items Grid */}
      <div className="space-y-3">
        <div className="font-serif font-bold text-sm text-secondary">
          Published Items ({items.length})
        </div>

        {loading ? (
          <div className="py-8 text-center text-on-surface-variant text-xs">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface border border-outline-variant/30 text-on-surface-variant text-xs">
            No gallery items published.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-surface border border-outline-variant/40 space-y-3 text-xs shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-40 w-full rounded-xl overflow-hidden bg-surface-container relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.titleEn}
                      className="w-full h-full object-cover"
                    />
                    {item.mediaType === "YOUTUBE" && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold">
                        YouTube
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="font-serif font-bold text-sm text-secondary">{item.titleEn}</div>
                    <div className="text-primary font-medium">{item.titleHi}</div>
                  </div>

                  {item.captionEn && (
                    <p className="text-[11px] text-on-surface-variant line-clamp-2">{item.captionEn}</p>
                  )}

                  {item.videoUrl && (
                    <div className="flex items-center gap-1 text-[11px] text-primary truncate">
                      <Video className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.videoUrl}</span>
                    </div>
                  )}

                  {item.externalLink && (
                    <div className="flex items-center gap-1 text-[11px] text-secondary truncate">
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.externalLink}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                  <span className="text-[10px] font-mono text-outline">Order: {item.orderIndex}</span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-500/10 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
