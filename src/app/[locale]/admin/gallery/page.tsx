"use client";

import React, { useState, useEffect } from "react";
import {
  Image,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Upload,
} from "lucide-react";

interface MediaItem {
  id: string;
  titleEn: string;
  titleHi: string;
  captionEn?: string | null;
  captionHi?: string | null;
  imageUrl: string;
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
        setSuccess("Gallery photo uploaded");
      } else {
        setError(data.error || "Upload failed");
      }
    } catch {
      setError("Error uploading photo");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

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
          orderIndex,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Gallery item saved");
        setTitleEn("");
        setTitleHi("");
        setCaptionEn("");
        setCaptionHi("");
        setImageUrl("");
        fetchItems();
      } else {
        setError(data.error || "Failed to save photo");
      }
    } catch {
      setError("Error saving gallery item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this gallery image?")) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setSuccess("Image deleted");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete");
      }
    } catch {
      setError("Error deleting image");
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="font-serif text-2xl font-bold text-secondary">
          चित्र दीर्घा प्रबंधन • Media Gallery CMS
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Upload sanctum photographs, Varanasi ephemeris heritage records, and ceremonies.
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

      {/* Form */}
      <div className="bg-surface rounded-lg p-6 border-2 border-secondary/20 shadow-sm space-y-4">
        <h2 className="font-serif text-base font-bold text-secondary flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          <span>नया चित्र जोड़ें • Add Photo to Gallery</span>
        </h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Title (English) *
              </label>
              <input
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Dashashwamedh Sanctum Astrological Altar"
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                शीर्षक (हिन्दी) *
              </label>
              <input
                type="text"
                required
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                placeholder="उदा: दशाश्वमेध घाट ज्योतिष पीठ एवं ग्रह वेदी"
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Caption (English)
              </label>
              <input
                type="text"
                value={captionEn}
                onChange={(e) => setCaptionEn(e.target.value)}
                placeholder="e.g. Daily planetary calculation recitation"
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                विवरण (हिन्दी)
              </label>
              <input
                type="text"
                value={captionHi}
                onChange={(e) => setCaptionHi(e.target.value)}
                placeholder="उदा: प्रातःकालीन पंचांग पठन एवं ग्रह स्पष्ट साधना"
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Order Index
              </label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Image Source * (Upload or Enter URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/images/gallery1.jpg or upload"
                  className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                />
                <label className="min-h-[44px] px-4 py-2 border border-outline-variant rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer hover:bg-surface-container shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? "..." : "Upload Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !imageUrl}
            className="min-h-[44px] px-6 py-2.5 bg-secondary hover:bg-secondary/90 text-on-secondary font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{submitting ? "Saving..." : "Add to Gallery"}</span>
          </button>
        </form>
      </div>

      {/* List */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-secondary">
          चित्र सूची • Gallery Items ({items.length})
        </h2>

        {loading ? (
          <p className="text-xs text-outline">Loading photos...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg bg-surface border border-outline-variant/40 overflow-hidden space-y-2 pb-3"
              >
                <div className="h-44 w-full bg-surface-container overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.titleEn}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="px-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-xs text-secondary">{item.titleEn}</h3>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded hover:bg-error-container/20 text-error transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-outline font-serif">{item.titleHi}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
