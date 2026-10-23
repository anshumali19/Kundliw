"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Star,
  ShieldCheck,
} from "lucide-react";

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
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form
  const [authorNameEn, setAuthorNameEn] = useState("");
  const [authorNameHi, setAuthorNameHi] = useState("");
  const [authorTitleEn, setAuthorTitleEn] = useState("Consultation Client");
  const [authorTitleHi, setAuthorTitleHi] = useState("परामर्शार्थी");
  const [cityEn, setCityEn] = useState("");
  const [cityHi, setCityHi] = useState("");
  const [quoteEn, setQuoteEn] = useState("");
  const [quoteHi, setQuoteHi] = useState("");
  const [rating, setRating] = useState(5);
  const [isVerified, setIsVerified] = useState(false);
  const [orderIndex, setOrderIndex] = useState(0);

  const [submitting, setSubmitting] = useState(false);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorNameEn,
          authorNameHi,
          authorTitleEn,
          authorTitleHi,
          cityEn,
          cityHi,
          quoteEn,
          quoteHi,
          rating,
          isVerified,
          orderIndex,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Testimonial recorded successfully");
        setAuthorNameEn("");
        setAuthorNameHi("");
        setCityEn("");
        setCityHi("");
        setQuoteEn("");
        setQuoteHi("");
        fetchTestimonials();
      } else {
        setError(data.error || "Failed to create testimonial");
      }
    } catch {
      setError("Error creating testimonial");
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
        setSuccess("Testimonial deleted");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete");
      }
    } catch {
      setError("Error deleting testimonial");
    }
  };

  const handleToggleVerified = async (item: TestimonialItem) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !item.isVerified }),
      });
      if (res.ok) {
        setTestimonials((prev) =>
          prev.map((t) => (t.id === item.id ? { ...t, isVerified: !t.isVerified } : t))
        );
      }
    } catch {
      setError("Error toggling verification status");
    }
  };

  const handleToggleActive = async (item: TestimonialItem) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (res.ok) {
        setTestimonials((prev) =>
          prev.map((t) => (t.id === item.id ? { ...t, isActive: !t.isActive } : t))
        );
      }
    } catch {
      setError("Error toggling status");
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="font-serif text-2xl font-bold text-secondary">
          परामर्शार्थी अनुभव • Testimonials CMS
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Manage client feedback, ratings, and authenticity verification badges.
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
          <span>नया अनुभव जोड़ें • Add Testimonial</span>
        </h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Client Name (English) *
              </label>
              <input
                type="text"
                required
                value={authorNameEn}
                onChange={(e) => setAuthorNameEn(e.target.value)}
                placeholder="e.g. Alok Verma"
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                ग्राहक नाम (हिन्दी) *
              </label>
              <input
                type="text"
                required
                value={authorNameHi}
                onChange={(e) => setAuthorNameHi(e.target.value)}
                placeholder="उदा: आलोक वर्मा"
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Star Rating (1 - 5)
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none font-medium"
              >
                <option value={5}>5 Stars ★★★★★</option>
                <option value={4}>4 Stars ★★★★</option>
                <option value={3}>3 Stars ★★★</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Title / Occupation (English) *
              </label>
              <input
                type="text"
                required
                value={authorTitleEn}
                onChange={(e) => setAuthorTitleEn(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                पद / कार्यक्षेत्र (हिन्दी) *
              </label>
              <input
                type="text"
                required
                value={authorTitleHi}
                onChange={(e) => setAuthorTitleHi(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                City / Location (English / हिन्दी) *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Lucknow"
                  value={cityEn}
                  onChange={(e) => setCityEn(e.target.value)}
                  className="w-full min-h-[44px] px-2.5 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="उदा: लखनऊ"
                  value={cityHi}
                  onChange={(e) => setCityHi(e.target.value)}
                  className="w-full min-h-[44px] px-2.5 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Feedback Quote (English) *
              </label>
              <textarea
                required
                rows={2}
                value={quoteEn}
                onChange={(e) => setQuoteEn(e.target.value)}
                placeholder="The Kendra team identified the timing of my promotion with remarkable mathematical accuracy..."
                className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                प्रशस्ति वाक्य (हिन्दी) *
              </label>
              <textarea
                required
                rows={2}
                value={quoteHi}
                onChange={(e) => setQuoteHi(e.target.value)}
                placeholder="केंद्र ज्योतिषी दल ने सूर्य सिद्धान्त गणना से मेरे व्यापारिक निर्णय की अनुकूलता स्पष्ट की..."
                className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4 rounded text-secondary"
              />
              <span>Mark as Verified Client (सत्यापित ग्राहक बैज प्रदान करें)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] px-6 py-2.5 bg-secondary hover:bg-secondary/90 text-on-secondary font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{submitting ? "Saving..." : "Add Testimonial"}</span>
          </button>
        </form>
      </div>

      {/* List */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-secondary">
          विद्यमान अनुभव • Testimonials ({testimonials.length})
        </h2>

        {loading ? (
          <p className="text-xs text-outline">Loading testimonials...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-lg bg-surface border border-outline-variant/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
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

                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 rounded hover:bg-error-container/20 text-error transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs italic text-on-surface leading-relaxed">
                  &ldquo;{t.quoteEn}&rdquo;
                </p>
                <p className="text-xs italic text-on-surface-variant font-serif">
                  &ldquo;{t.quoteHi}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-xs">
                  <button
                    onClick={() => handleToggleVerified(t)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      t.isVerified
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-surface-container text-outline"
                    }`}
                  >
                    {t.isVerified ? "Verified Badge ON" : "Unverified (Sample)"}
                  </button>

                  <button
                    onClick={() => handleToggleActive(t)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      t.isActive
                        ? "bg-secondary/10 text-secondary"
                        : "bg-surface-container text-outline"
                    }`}
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
