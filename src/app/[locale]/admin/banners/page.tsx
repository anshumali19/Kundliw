"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import {
  Image,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Upload,
  ExternalLink,
  Eye,
  Layers,
} from "lucide-react";

interface BannerItem {
  id: string;
  titleEn: string;
  titleHi: string;
  subtitleEn?: string | null;
  subtitleHi?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  position: "TOP" | "BOTTOM" | "LEFT" | "RIGHT";
  type: "STATIC" | "CAROUSEL";
  isActive: boolean;
  orderIndex: number;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [titleEn, setTitleEn] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");
  const [subtitleHi, setSubtitleHi] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("/services");
  const [position, setPosition] = useState<"TOP" | "BOTTOM" | "LEFT" | "RIGHT">("RIGHT");
  const [type, setType] = useState<"STATIC" | "CAROUSEL">("STATIC");
  const [orderIndex, setOrderIndex] = useState(0);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      if (res.ok) {
        setBanners(data.banners || []);
      } else {
        setError(data.error || "Failed to load banners");
      }
    } catch {
      setError("Network error fetching banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subfolder", "banners");

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setImageUrl(data.url);
        setSuccess("Banner image uploaded successfully");
      } else {
        setError(data.error || "Image upload failed");
      }
    } catch {
      setError("Error uploading banner image");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn,
          titleHi,
          subtitleEn: subtitleEn || null,
          subtitleHi: subtitleHi || null,
          imageUrl,
          linkUrl: linkUrl || null,
          position,
          type,
          orderIndex,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Banner created successfully");
        setTitleEn("");
        setTitleHi("");
        setSubtitleEn("");
        setSubtitleHi("");
        setImageUrl("");
        fetchBanners();
      } else {
        setError(data.error || "Failed to create banner");
      }
    } catch {
      setError("Error creating banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
        setSuccess("Banner deleted");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete");
      }
    } catch {
      setError("Error deleting banner");
    }
  };

  const handleToggleActive = async (banner: BannerItem) => {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      if (res.ok) {
        setBanners((prev) =>
          prev.map((b) => (b.id === banner.id ? { ...b, isActive: !b.isActive } : b))
        );
      }
    } catch {
      setError("Error toggling banner status");
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="font-serif text-2xl font-bold text-secondary">
          बैनर प्रबंधन • Promotional Banners
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Configure site promotional banners across layout positions (TOP, BOTTOM, LEFT, RIGHT).
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

      {/* Create Banner Form */}
      <div className="bg-surface rounded-lg p-6 border-2 border-secondary/20 shadow-sm space-y-4">
        <h2 className="font-serif text-base font-bold text-secondary flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          <span>नया बैनर जोड़ें • Add New Banner</span>
        </h2>

        <form onSubmit={handleCreateBanner} className="space-y-4">
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
                placeholder="e.g. Special Guru Transit Yajna"
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
                placeholder="उदा: गुरु राशि परिवर्तन विशेष अनुष्ठान"
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Subtitle (English)
              </label>
              <input
                type="text"
                value={subtitleEn}
                onChange={(e) => setSubtitleEn(e.target.value)}
                placeholder="e.g. Live Vedic Yajna at Varanasi"
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                उपशीर्षक (हिन्दी)
              </label>
              <input
                type="text"
                value={subtitleHi}
                onChange={(e) => setSubtitleHi(e.target.value)}
                placeholder="उदा: दशाश्वमेध घाट काशी से सस्वर वैदिक पाठ"
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Layout Position *
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as any)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none font-medium"
              >
                <option value="RIGHT">RIGHT (Hero sidebar banner)</option>
                <option value="TOP">TOP (Header notification banner)</option>
                <option value="BOTTOM">BOTTOM (Pre-footer banner)</option>
                <option value="LEFT">LEFT (Sidebar left)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Banner Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none font-medium"
              >
                <option value="STATIC">STATIC (Single display card)</option>
                <option value="CAROUSEL">CAROUSEL (Rotational slide)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Target Link URL
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="/services or https://..."
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
                Banner Image * (Upload or Enter URL)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/images/banner1.jpg or upload below"
                  className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                />
                <label className="min-h-[44px] px-4 py-2 border border-outline-variant rounded text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-surface-container shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? "Uploading..." : "Upload File"}</span>
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
            className="min-h-[44px] px-6 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{submitting ? "Saving..." : "Create Banner"}</span>
          </button>
        </form>
      </div>

      {/* Existing Banners List */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-secondary">
          विद्यमान बैनर सूची • Existing Banners ({banners.length})
        </h2>

        {loading ? (
          <p className="text-xs text-outline">Loading banners...</p>
        ) : banners.length === 0 ? (
          <div className="p-8 rounded-lg border border-dashed border-outline-variant text-center text-xs text-outline">
            No banners created yet. Use the form above to add promotional banners.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="p-4 rounded-lg bg-surface border border-outline-variant/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container text-secondary">
                        {banner.position}
                      </span>
                      <span className="text-[10px] uppercase text-outline">
                        {banner.type} • Order: {banner.orderIndex}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-secondary mt-1">
                      {banner.titleEn}
                    </h3>
                    <p className="text-xs text-on-surface-variant font-serif">
                      {banner.titleHi}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="p-1.5 rounded hover:bg-error-container/20 text-on-error-container transition-colors"
                    title="Delete banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {banner.imageUrl && (
                  <div className="h-28 w-full bg-surface-container rounded overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={banner.imageUrl}
                      alt={banner.titleEn}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-xs">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase ${
                      banner.isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-surface-container text-outline"
                    }`}
                  >
                    {banner.isActive ? "Active (सक्रिय)" : "Inactive (निष्क्रिय)"}
                  </button>

                  {banner.linkUrl && (
                    <a
                      href={banner.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1 text-[11px]"
                    >
                      <span>Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
