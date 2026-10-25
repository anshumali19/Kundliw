"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Type,
  Palette,
} from "lucide-react";

interface MarqueeItem {
  id: string;
  textEn: string;
  textHi: string;
  speedSec: number;
  fontSize: number;
  bgColor: string;
  textColor: string;
  position: "TOP" | "BOTTOM";
  isActive: boolean;
  orderIndex: number;
}

export default function AdminMarqueePage() {
  const [items, setItems] = useState<MarqueeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [textEn, setTextEn] = useState("");
  const [textHi, setTextHi] = useState("");
  const [speedSec, setSpeedSec] = useState(30);
  const [fontSize, setFontSize] = useState(13);
  const [bgColor, setBgColor] = useState("var(--brand)");
  const [textColor, setTextColor] = useState("var(--on-brand)");
  const [position, setPosition] = useState<"TOP" | "BOTTOM">("BOTTOM");
  const [orderIndex, setOrderIndex] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/marquee");
      const data = await res.json();
      if (res.ok) {
        setItems(data.items || []);
      } else {
        setError(data.error || "Failed to load marquee announcements");
      }
    } catch {
      setError("Network error fetching marquee items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/marquee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textEn,
          textHi,
          speedSec,
          fontSize,
          bgColor,
          textColor,
          position,
          orderIndex,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Marquee announcement created");
        setTextEn("");
        setTextHi("");
        fetchItems();
      } else {
        setError(data.error || "Failed to create announcement");
      }
    } catch {
      setError("Error creating marquee item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this marquee notice?")) return;
    try {
      const res = await fetch(`/api/admin/marquee/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setSuccess("Announcement deleted");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete");
      }
    } catch {
      setError("Error deleting marquee item");
    }
  };

  const handleToggleActive = async (item: MarqueeItem) => {
    try {
      const res = await fetch(`/api/admin/marquee/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isActive: !i.isActive } : i))
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
          मार्की एवं सूचना पट्टी • Marquee Announcements
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Configure real-time ticker notices, speed, font size, and positions (TOP, BOTTOM).
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

      {/* Create Form */}
      <div className="bg-surface rounded-lg p-6 border-2 border-secondary/20 shadow-sm space-y-4">
        <h2 className="font-serif text-base font-bold text-secondary flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          <span>नई सूचना पट्टी जोड़ें • Add Marquee Announcement</span>
        </h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Announcement Text (English) *
              </label>
              <input
                type="text"
                required
                value={textEn}
                onChange={(e) => setTextEn(e.target.value)}
                placeholder="e.g. Special Surya Siddhanta Vivah Muhurat Tables published for Samvat 2083"
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                सूचना पाठ (हिन्दी) *
              </label>
              <input
                type="text"
                required
                value={textHi}
                onChange={(e) => setTextHi(e.target.value)}
                placeholder="उदा: शुद्ध सूर्य सिद्धान्त सम्मत सम्वत् २०८३ विवाह एवं गृह प्रवेश शुभ मुहूर्त तालिका प्रकाशित"
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Scroll Duration (Seconds: 5 - 120)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={speedSec}
                onChange={(e) => setSpeedSec(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Font Size (px: 10 - 36)
              </label>
              <input
                type="number"
                min={10}
                max={36}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Position *
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as any)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none font-medium"
              >
                <option value="BOTTOM">BOTTOM (Default Header Sub-strip)</option>
                <option value="TOP">TOP (Above Header)</option>
              </select>
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
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] px-6 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{submitting ? "Saving..." : "Add Marquee Notice"}</span>
          </button>
        </form>
      </div>

      {/* List */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-secondary">
          सक्रिय सूचनाएँ • Marquee Items ({items.length})
        </h2>

        {loading ? (
          <p className="text-xs text-outline">Loading items...</p>
        ) : items.length === 0 ? (
          <div className="p-8 rounded-lg border border-dashed border-outline-variant text-center text-xs text-outline">
            No custom marquee items yet. The system is showing default design notices.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-surface border border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container text-secondary">
                      {item.position}
                    </span>
                    <span className="text-[10px] text-outline font-mono">
                      {item.speedSec}s • {item.fontSize}px
                    </span>
                  </div>
                  <p className="font-semibold text-xs text-secondary">{item.textEn}</p>
                  <p className="text-xs text-on-surface-variant font-serif">{item.textHi}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase ${
                      item.isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-surface-container text-outline"
                    }`}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded hover:bg-error-container/20 text-on-error-container transition-colors"
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
