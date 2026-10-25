"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface FaqItem {
  id: string;
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
  category: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
}

export function AdminFaqManager({ isHindi }: { isHindi: boolean }) {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [questionEn, setQuestionEn] = useState("");
  const [questionHi, setQuestionHi] = useState("");
  const [answerEn, setAnswerEn] = useState("");
  const [answerHi, setAnswerHi] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [orderIndex, setOrderIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faq");
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(data.items || []);
      } else {
        setStatus({ type: "error", text: data.error || "Failed to load FAQs." });
      }
    } catch {
      setStatus({ type: "error", text: "Network error loading FAQs." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreateModal = () => {
    setEditingId(null);
    setQuestionEn("");
    setQuestionHi("");
    setAnswerEn("");
    setAnswerHi("");
    setCategory("GENERAL");
    setOrderIndex(0);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (item: FaqItem) => {
    setEditingId(item.id);
    setQuestionEn(item.questionEn);
    setQuestionHi(item.questionHi);
    setAnswerEn(item.answerEn);
    setAnswerHi(item.answerHi);
    setCategory(item.category);
    setOrderIndex(item.orderIndex);
    setIsActive(item.isActive);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const payload = {
      questionEn,
      questionHi,
      answerEn,
      answerHi,
      category,
      orderIndex: Number(orderIndex) || 0,
      isActive,
    };

    try {
      const url = editingId ? `/api/admin/faq/${editingId}` : "/api/admin/faq";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({
          type: "success",
          text: editingId
            ? isHindi ? "प्रश्न अद्यतन हुआ।" : "FAQ updated successfully."
            : isHindi ? "नया प्रश्न जोड़ा गया।" : "FAQ created successfully.",
        });
        setModalOpen(false);
        fetchItems();
      } else {
        setStatus({ type: "error", text: data.error || "Failed to save FAQ." });
      }
    } catch {
      setStatus({ type: "error", text: "Network error saving FAQ." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        isHindi
          ? "क्या आप इस प्रश्न को हटाना चाहते हैं?"
          : "Are you sure you want to delete this FAQ item?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({
          type: "success",
          text: isHindi ? "प्रश्न हटाया गया।" : "FAQ deleted successfully.",
        });
        setItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        setStatus({ type: "error", text: data.error || "Failed to delete FAQ." });
      }
    } catch {
      setStatus({ type: "error", text: "Network error deleting FAQ." });
    }
  };

  const filtered = items.filter((item) => {
    const matchesCat = filterCategory === "ALL" || item.category === filterCategory;
    const s = search.toLowerCase().trim();
    const matchesSearch =
      !s ||
      item.questionEn.toLowerCase().includes(s) ||
      item.questionHi.toLowerCase().includes(s) ||
      item.answerEn.toLowerCase().includes(s) ||
      item.answerHi.toLowerCase().includes(s);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>FAQ System CMS</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-secondary">
            Frequently Asked Questions (प्रश्नोत्तरी प्रबंधन)
          </h1>
          <p className="text-xs text-on-surface-variant">
            Manage bilingual FAQs, categories, active status, and display sequence.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-brand text-on-brand font-semibold text-xs hover:bg-brand-hover transition-colors flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{isHindi ? "नया प्रश्न जोड़ें" : "Add FAQ Question"}</span>
        </button>
      </div>

      {status && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
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

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {["ALL", "GENERAL", "KUNDLI", "PUJA", "PAYMENT"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-colors ${
                filterCategory === cat
                  ? "bg-brand text-on-brand"
                  : "bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* FAQ Items List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-on-surface-variant">Loading FAQs...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-surface border border-outline-variant/30 text-xs text-on-surface-variant">
          No FAQs found matching filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all text-xs ${
                item.isActive
                  ? "bg-surface border-outline-variant/40 shadow-sm"
                  : "bg-surface-container-low/50 border-outline-variant/20 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface font-semibold">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        item.isActive ? "bg-emerald-500/10 text-emerald-700" : "bg-zinc-500/10 text-zinc-600"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-[10px] text-outline">Order: {item.orderIndex}</span>
                  </div>

                  <div className="font-serif font-bold text-sm text-secondary">
                    {item.questionEn}
                  </div>
                  <div className="font-medium text-primary">
                    {item.questionHi}
                  </div>
                  <p className="text-on-surface-variant line-clamp-2 text-[11px] pt-1">
                    {item.answerEn}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container text-on-surface transition-colors"
                    title="Edit FAQ"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg border border-error hover:bg-error-container0/10 text-on-error-container transition-colors"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-surface rounded-2xl max-w-2xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 space-y-4 border border-outline-variant text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <span className="font-serif font-bold text-base text-secondary">
                {editingId ? "Edit FAQ Question" : "Add New FAQ Question"}
              </span>
              <button
                onClick={() => setModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
                  >
                    <option value="GENERAL">GENERAL</option>
                    <option value="KUNDLI">KUNDLI</option>
                    <option value="PUJA">PUJA</option>
                    <option value="PAYMENT">PAYMENT</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    <span>Active / Published</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <label className="font-semibold">Order:</label>
                    <input
                      type="number"
                      value={orderIndex}
                      onChange={(e) => setOrderIndex(Number(e.target.value))}
                      className="w-16 p-1.5 rounded-lg border border-outline-variant bg-surface text-on-surface"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Question (English) *</label>
                <input
                  type="text"
                  required
                  value={questionEn}
                  onChange={(e) => setQuestionEn(e.target.value)}
                  placeholder="e.g. How are Kundlis calculated?"
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Question (Hindi) *</label>
                <input
                  type="text"
                  required
                  value={questionHi}
                  onChange={(e) => setQuestionHi(e.target.value)}
                  placeholder="उदा. कुण्डली गणना की क्या पद्धति है?"
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Answer (English) *</label>
                <textarea
                  required
                  rows={3}
                  value={answerEn}
                  onChange={(e) => setAnswerEn(e.target.value)}
                  placeholder="Detailed answer in English..."
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Answer (Hindi) *</label>
                <textarea
                  required
                  rows={3}
                  value={answerHi}
                  onChange={(e) => setAnswerHi(e.target.value)}
                  placeholder="विस्तृत उत्तर हिंदी में..."
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface"
                />
              </div>

              <div className="sticky bottom-0 z-10 bg-surface -mx-6 -mb-6 px-6 py-3 flex items-center justify-end gap-2 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand text-on-brand font-semibold hover:bg-brand-hover disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Saving..." : editingId ? "Update FAQ" : "Save FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
