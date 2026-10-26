"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Pencil,
  X,
} from "lucide-react";
import { LinkItem, normalizeLinks } from "@/lib/content/media";
import { ImageUrlField, LinksEditor, YouTubeUrlField } from "@/components/admin/MediaFields";

interface TestimonialItem {
  id: string;
  authorNameEn: string;
  authorNameHi: string;
  authorTitleEn: string;
  authorTitleHi: string;
  cityEn: string;
  cityHi: string;
  quoteEn: string;
  quoteHi: string;
  rating: number;
  isVerified: boolean;
  isActive: boolean;
  orderIndex: number;
  photoUrl?: string | null;
  youtubeUrl?: string | null;
  additionalLinks?: unknown;
}

interface FormState {
  authorNameEn: string;
  authorNameHi: string;
  authorTitleEn: string;
  authorTitleHi: string;
  cityEn: string;
  cityHi: string;
  quoteEn: string;
  quoteHi: string;
  rating: number;
  isVerified: boolean;
  isActive: boolean;
  orderIndex: number;
  photoUrl: string;
  youtubeUrl: string;
  additionalLinks: LinkItem[];
}

const EMPTY: FormState = {
  authorNameEn: "",
  authorNameHi: "",
  authorTitleEn: "Consultation Client",
  authorTitleHi: "परामर्शार्थी",
  cityEn: "",
  cityHi: "",
  quoteEn: "",
  quoteHi: "",
  rating: 5,
  isVerified: false,
  isActive: true,
  orderIndex: 0,
  photoUrl: "",
  youtubeUrl: "",
  additionalLinks: [],
};

const field =
  "w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none";
const label = "block text-xs font-bold uppercase text-on-surface-variant mb-1";

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials");
      const data = await res.json();
      if (res.ok) {
        setTestimonials(data.testimonials || []);
      } else {
        setError(data.error || "Failed to load testimonials");
      }
    } catch {
      setError("Error loading testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const startEdit = (t: TestimonialItem) => {
    setEditingId(t.id);
    setForm({
      authorNameEn: t.authorNameEn,
      authorNameHi: t.authorNameHi,
      authorTitleEn: t.authorTitleEn,
      authorTitleHi: t.authorTitleHi,
      cityEn: t.cityEn,
      cityHi: t.cityHi,
      quoteEn: t.quoteEn,
      quoteHi: t.quoteHi,
      rating: t.rating,
      isVerified: t.isVerified,
      isActive: t.isActive,
      orderIndex: t.orderIndex,
      photoUrl: t.photoUrl || "",
      youtubeUrl: t.youtubeUrl || "",
      additionalLinks: normalizeLinks(t.additionalLinks),
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
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const payload = {
      ...form,
      photoUrl: form.photoUrl.trim() || null,
      youtubeUrl: form.youtubeUrl.trim() || null,
      additionalLinks: form.additionalLinks.filter((l) => l.url.trim()),
    };

    try {
      const res = await fetch(
        editingId ? `/api/admin/testimonials/${editingId}` : "/api/admin/testimonials",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setSuccess(editingId ? "Testimonial updated" : "Testimonial added");
        cancelEdit();
        fetchTestimonials();
      } else {
        setError(data.error || "Failed to save testimonial");
      }
    } catch {
      setError("Error saving testimonial");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
        if (editingId === id) cancelEdit();
        setSuccess("Testimonial deleted");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete");
      }
    } catch {
      setError("Error deleting testimonial");
    }
  };

  const toggle = async (item: TestimonialItem, key: "isVerified" | "isActive") => {
    try {
      const res = await fetch(`/api/admin/testimonials/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: !item[key] }),
      });
      if (res.ok) {
        setTestimonials((prev) => prev.map((t) => (t.id === item.id ? { ...t, [key]: !t[key] } : t)));
      }
    } catch {
      setError("Error updating testimonial");
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="font-serif text-2xl font-bold text-secondary">
          परामर्शार्थी अनुभव • Testimonials CMS
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Add, edit, hide or remove client feedback. Each one can have a photo, a YouTube video and extra links.
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

      <div className="bg-surface rounded-lg p-6 border-2 border-secondary/20 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-base font-bold text-secondary flex items-center gap-2">
            {editingId ? <Pencil className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
            <span>{editingId ? "अनुभव संपादित करें • Edit Testimonial" : "नया अनुभव जोड़ें • Add Testimonial"}</span>
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="min-h-[44px] px-3 inline-flex items-center gap-1 rounded border border-maroon text-xs font-bold"
            >
              <X className="w-4 h-4" /> Cancel edit
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={label}>Client Name (English) *</label>
              <input type="text" required value={form.authorNameEn} onChange={(e) => set("authorNameEn", e.target.value)} placeholder="e.g. Alok Verma" className={field} />
            </div>
            <div>
              <label className={label}>ग्राहक नाम (हिन्दी) *</label>
              <input type="text" required value={form.authorNameHi} onChange={(e) => set("authorNameHi", e.target.value)} placeholder="उदा: आलोक वर्मा" className={field} />
            </div>
            <div>
              <label className={label}>Star Rating (1 - 5)</label>
              <select value={form.rating} onChange={(e) => set("rating", Number(e.target.value))} className={field + " font-medium"}>
                <option value={5}>5 Stars ★★★★★</option>
                <option value={4}>4 Stars ★★★★</option>
                <option value={3}>3 Stars ★★★</option>
                <option value={2}>2 Stars ★★</option>
                <option value={1}>1 Star ★</option>
              </select>
            </div>
            <div>
              <label className={label}>Title / Occupation (English) *</label>
              <input type="text" required value={form.authorTitleEn} onChange={(e) => set("authorTitleEn", e.target.value)} className={field} />
            </div>
            <div>
              <label className={label}>पद / कार्यक्षेत्र (हिन्दी) *</label>
              <input type="text" required value={form.authorTitleHi} onChange={(e) => set("authorTitleHi", e.target.value)} className={field} />
            </div>
            <div>
              <label className={label}>City / Location (English / हिन्दी) *</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" required placeholder="e.g. Lucknow" value={form.cityEn} onChange={(e) => set("cityEn", e.target.value)} className={field} />
                <input type="text" required placeholder="उदा: लखनऊ" value={form.cityHi} onChange={(e) => set("cityHi", e.target.value)} className={field} />
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={label}>Feedback Quote (English) *</label>
              <textarea required rows={2} value={form.quoteEn} onChange={(e) => set("quoteEn", e.target.value)} className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={label}>प्रशस्ति वाक्य (हिन्दी) *</label>
              <textarea required rows={2} value={form.quoteHi} onChange={(e) => set("quoteHi", e.target.value)} className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none" />
            </div>
          </div>

          <ImageUrlField label="Client photo (optional)" value={form.photoUrl} onChange={(v) => set("photoUrl", v)} />
          <YouTubeUrlField value={form.youtubeUrl} onChange={(v) => set("youtubeUrl", v)} />
          <LinksEditor links={form.additionalLinks} onChange={(v) => set("additionalLinks", v)} />

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input type="checkbox" checked={form.isVerified} onChange={(e) => set("isVerified", e.target.checked)} className="w-4 h-4 rounded text-secondary" />
              <span>Verified client (shown on the website only when verified)</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 rounded text-secondary" />
              <span>Active</span>
            </label>
          </div>

          <div className="sticky bottom-[calc(6.75rem+env(safe-area-inset-bottom,0px))] xl:bottom-12 z-30 bg-surface/95 backdrop-blur border-t border-outline-variant/40 -mx-2 px-2 py-3">
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] px-6 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? "Saving..." : editingId ? "Save changes" : "Add Testimonial"}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-secondary">
          विद्यमान अनुभव • Testimonials ({testimonials.length})
        </h2>

        {loading ? (
          <p className="text-xs text-outline">Loading testimonials...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((t) => (
              <div key={t.id} className="p-4 rounded-lg bg-surface border border-outline-variant/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {t.photoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-outline-variant/60" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-secondary">{t.authorNameEn}</span>
                        {t.isVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-outline">
                        {t.authorTitleEn} • {t.cityEn}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(t)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded hover:bg-gold text-secondary" aria-label="Edit testimonial">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded hover:bg-error-container/20 text-on-error-container" aria-label="Delete testimonial">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs italic text-on-surface leading-relaxed">&ldquo;{t.quoteEn}&rdquo;</p>
                <p className="text-xs italic text-on-surface-variant font-serif">&ldquo;{t.quoteHi}&rdquo;</p>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-xs">
                  <button
                    onClick={() => toggle(t, "isVerified")}
                    className={`min-h-[36px] px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.isVerified ? "bg-emerald-100 text-emerald-800" : "bg-surface-container text-outline"}`}
                  >
                    {t.isVerified ? "Verified Badge ON" : "Unverified"}
                  </button>
                  <button
                    onClick={() => toggle(t, "isActive")}
                    className={`min-h-[36px] px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.isActive ? "bg-brand text-on-brand" : "bg-surface-container text-outline"}`}
                  >
                    {t.isActive ? "Active" : "Hidden"}
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
