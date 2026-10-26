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
  Pencil,
  X,
} from "lucide-react";

interface MarqueeItem {
  id: string;
  textEn: string;
  textHi: string;
  speedSec: number;
  fontSize: number;
  bgColor: string;
  textColor: string;
  pauseOnHover?: boolean;
  allowClose?: boolean;
  position: "TOP" | "BOTTOM";
  isActive: boolean;
  orderIndex: number;
}

// Site colours the admin can pick with one click (any other colour can be chosen with the picker)
const COLOR_PRESETS: Array<{ name: string; bg: string; text: string }> = [
  { name: "Yellow", bg: "#F4C65D", text: "#4B1724" },
  { name: "Saffron", bg: "#E77B18", text: "#271B1B" },
  { name: "Maroon", bg: "#641E2B", text: "#FFF8EC" },
  { name: "Red", bg: "#C62828", text: "#FFFFFF" },
  { name: "Cream", bg: "#FFF3DF", text: "#4B1724" },
];

/** The colour picker needs a #rrggbb value; older entries stored site colour names. */
function toHex(value: string, fallback: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    return "#" + value.slice(1).split("").map((c) => c + c).join("");
  }
  const named: Record<string, string> = {
    "var(--brand)": "#641E2B",
    "var(--on-brand)": "#FFFFFF",
    "var(--gold)": "#F4C65D",
    "var(--maroon)": "#641E2B",
  };
  return named[value] ?? fallback;
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
  const [pauseOnHover, setPauseOnHover] = useState(true);
  const [allowClose, setAllowClose] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const startEdit = (item: MarqueeItem) => {
    setEditingId(item.id);
    setTextEn(item.textEn);
    setTextHi(item.textHi);
    setSpeedSec(item.speedSec);
    setFontSize(item.fontSize);
    setBgColor(item.bgColor);
    setTextColor(item.textColor);
    setPosition(item.position);
    setOrderIndex(item.orderIndex);
    setPauseOnHover(item.pauseOnHover ?? true);
    setAllowClose(item.allowClose ?? true);
    setError(null);
    setSuccess(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTextEn("");
    setTextHi("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(editingId ? `/api/admin/marquee/${editingId}` : "/api/admin/marquee", {
        method: editingId ? "PUT" : "POST",
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
          pauseOnHover,
          allowClose,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(editingId ? "Marquee announcement updated" : "Marquee announcement created");
        cancelEdit();
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
          <span>{editingId ? "सूचना पट्टी संपादित करें • Edit Marquee Announcement" : "नई सूचना पट्टी जोड़ें • Add Marquee Announcement"}</span>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="ml-auto min-h-[44px] px-3 inline-flex items-center gap-1 rounded border border-maroon text-xs font-bold">
              <X className="w-4 h-4" /> Cancel edit
            </button>
          )}
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

            <div className="sm:col-span-2 space-y-3 p-3 rounded-lg border border-outline-variant/60">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-secondary">
                <Palette className="w-4 h-4 text-primary" /> Colours
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 text-xs font-semibold">
                  <input
                    type="color"
                    value={toHex(bgColor, "#F4C65D")}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-14 h-11 rounded border border-outline-variant bg-transparent cursor-pointer"
                    aria-label="Background colour"
                  />
                  Background colour
                </label>
                <label className="flex items-center gap-3 text-xs font-semibold">
                  <input
                    type="color"
                    value={toHex(textColor, "#FFFFFF")}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-14 h-11 rounded border border-outline-variant bg-transparent cursor-pointer"
                    aria-label="Font colour"
                  />
                  Font colour
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setBgColor(c.bg);
                      setTextColor(c.text);
                    }}
                    className="min-h-[40px] px-3 rounded border border-outline-variant text-xs font-bold"
                    style={{ background: c.bg, color: c.text }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              <div
                className="rounded px-3 py-2 font-semibold overflow-hidden whitespace-nowrap"
                style={{ background: toHex(bgColor, "#F4C65D"), color: toHex(textColor, "#FFFFFF"), fontSize: `${fontSize}px` }}
                aria-label="Preview"
              >
                {textEn || "Preview of the announcement text"}
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input type="checkbox" checked={pauseOnHover} onChange={(e) => setPauseOnHover(e.target.checked)} className="w-4 h-4" />
                  Pause the scrolling when the pointer is over it
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input type="checkbox" checked={allowClose} onChange={(e) => setAllowClose(e.target.checked)} className="w-4 h-4" />
                  Let visitors close it
                </label>
              </div>
            </div>
          </div>

          <div className="sticky bottom-[calc(6.75rem+env(safe-area-inset-bottom,0px))] xl:bottom-12 z-30 bg-surface/95 backdrop-blur border-t border-outline-variant/40 -mx-2 px-2 py-3">
          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] px-6 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{submitting ? "Saving..." : editingId ? "Save changes" : "Add Marquee Notice"}</span>
          </button>
          </div>
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
                    onClick={() => startEdit(item)}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded hover:bg-brand text-secondary"
                    aria-label="Edit announcement"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded hover:bg-error-container/20 text-on-error-container transition-colors"
                    aria-label="Delete announcement"
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
