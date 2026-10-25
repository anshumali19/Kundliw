"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search,
  Zap,
} from "lucide-react";

interface ChatbotQAItem {
  id: string;
  orderIndex: number;
  category: string;
  keywords: string[];
  questionHi: string;
  questionEn: string;
  answerHi: string;
  answerEn: string;
  quickReplyHi: string | null;
  quickReplyEn: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  "GENERAL",
  "SERVICES",
  "PRICING",
  "KUNDLI",
  "MUHURTA",
  "LOCATION",
  "TIMINGS",
  "ASSOCIATE",
];

export function AdminChatbotManager({ locale }: { locale: string }) {
  const isHindi = locale === "hi";
  const [items, setItems] = useState<ChatbotQAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal / Form state
  const [editingItem, setEditingItem] = useState<ChatbotQAItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    category: "GENERAL",
    orderIndex: 0,
    keywordsInput: "",
    questionHi: "",
    questionEn: "",
    answerHi: "",
    answerEn: "",
    quickReplyHi: "",
    quickReplyEn: "",
    isActive: true,
  });

  const fetchItems = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/chatbot");
      const data = await res.json();
      if (res.ok && data.items) {
        setItems(data.items);
      } else {
        setStatus({ type: "error", text: data.error || "Failed to load Q&A entries." });
      }
    } catch {
      setStatus({ type: "error", text: "Network error loading Q&A list." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      category: "GENERAL",
      orderIndex: items.length,
      keywordsInput: "",
      questionHi: "",
      questionEn: "",
      answerHi: "",
      answerEn: "",
      quickReplyHi: "",
      quickReplyEn: "",
      isActive: true,
    });
    setIsCreating(true);
  };

  const openEditModal = (item: ChatbotQAItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      orderIndex: item.orderIndex,
      keywordsInput: item.keywords.join(", "),
      questionHi: item.questionHi,
      questionEn: item.questionEn,
      answerHi: item.answerHi,
      answerEn: item.answerEn,
      quickReplyHi: item.quickReplyHi || "",
      quickReplyEn: item.quickReplyEn || "",
      isActive: item.isActive,
    });
    setIsCreating(true);
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const keywords = formData.keywordsInput
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const payload = {
      category: formData.category,
      orderIndex: Number(formData.orderIndex) || 0,
      keywords,
      questionHi: formData.questionHi,
      questionEn: formData.questionEn,
      answerHi: formData.answerHi,
      answerEn: formData.answerEn,
      quickReplyHi: formData.quickReplyHi || null,
      quickReplyEn: formData.quickReplyEn || null,
      isActive: Boolean(formData.isActive),
    };

    try {
      const url = editingItem
        ? `/api/admin/chatbot/${editingItem.id}`
        : "/api/admin/chatbot";
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
          text: editingItem
            ? isHindi
              ? "प्रश्नोत्तरी सफलतापूर्वक अद्यतन की गई।"
              : "Q&A entry updated successfully."
            : isHindi
            ? "नई प्रश्नोत्तरी सफलतापूर्वक जोड़ी गई।"
            : "New Q&A entry created successfully.",
        });
        closeModal();
        await fetchItems();
      } else {
        setStatus({ type: "error", text: data.error || "Save operation failed." });
      }
    } catch {
      setStatus({ type: "error", text: "Network error saving Q&A." });
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        isHindi
          ? "क्या आप निश्चित रूप से इस प्रश्नोत्तरी को हटाना चाहते हैं?"
          : "Are you sure you want to permanently delete this Q&A entry?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/chatbot/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStatus({
          type: "success",
          text: isHindi
            ? "प्रश्नोत्तरी हटाई गई।"
            : "Q&A entry deleted successfully.",
        });
        await fetchItems();
      } else {
        const data = await res.json();
        setStatus({ type: "error", text: data.error || "Failed to delete entry." });
      }
    } catch {
      setStatus({ type: "error", text: "Network error deleting Q&A." });
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCat =
      categoryFilter === "ALL" || item.category === categoryFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      item.questionEn.toLowerCase().includes(term) ||
      item.questionHi.toLowerCase().includes(term) ||
      item.answerEn.toLowerCase().includes(term) ||
      item.answerHi.toLowerCase().includes(term) ||
      item.keywords.some((k) => k.toLowerCase().includes(term));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-serif font-bold text-on-surface">
              {isHindi ? "वैदिक चैटबॉट प्रश्नोत्तरी प्रबंधक" : "Vedic Rule-Based Chatbot CMS"}
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            {isHindi
              ? "शून्य एपीआई लागत! कीवर्ड आधारित स्वचालित उत्तर, त्वरित चिप बटन एवं व्हाट्सएप/टिकट फ़ॉलबैक नियंत्रित करें।"
              : "Zero API cost! Manage keyword triggers, bilingual replies, quick action chips, and WhatsApp fallback."}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-on-primary font-medium text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow"
        >
          <Plus className="w-4 h-4" />
          <span>{isHindi ? "नया प्रश्न जोड़ें" : "Add Q&A Entry"}</span>
        </button>
      </div>

      {/* Status banner */}
      {status && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 text-sm ${
            status.type === "success"
              ? "bg-secondary-container/30 text-on-secondary-container border border-secondary"
              : "bg-error-container/30 text-error border border-error"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-secondary" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-error" />
          )}
          <span>{status.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              isHindi
                ? "प्रश्न, उत्तर या कीवर्ड खोजें..."
                : "Search questions, answers, or keywords..."
            }
            className="w-full pl-9 pr-4 py-2 rounded border border-outline-variant bg-surface text-on-surface text-xs placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 rounded border border-outline-variant bg-surface text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="ALL">{isHindi ? "सभी श्रेणियाँ (All Categories)" : "All Categories"}</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Q&A List */}
      {loading ? (
        <div className="py-12 text-center text-on-surface-variant text-sm">
          {isHindi ? "प्रश्नोत्तरी लोड हो रही है..." : "Loading Q&A list..."}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-surface-container border border-outline-variant/40 space-y-2">
          <HelpCircle className="w-8 h-8 text-on-surface-variant mx-auto" />
          <p className="text-sm font-semibold text-on-surface">
            {isHindi ? "कोई प्रश्नोत्तरी नहीं मिली" : "No Q&A entries found"}
          </p>
          <p className="text-xs text-on-surface-variant">
            {isHindi
              ? "नया प्रश्न जोड़ने के लिए ऊपर दिए गए बटन पर क्लिक करें।"
              : "Click the Add Q&A Entry button above to create one."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-xl border transition-all ${
                item.isActive
                  ? "bg-surface border-outline-variant/40 hover:border-primary/50 shadow-sm"
                  : "bg-surface-container/50 border-outline-variant/20 opacity-75"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-outline-variant/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                      #{item.orderIndex}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                        item.isActive
                          ? "bg-secondary-container/50 text-secondary"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                    {(item.quickReplyHi || item.quickReplyEn) && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-tertiary-container/40 text-on-tertiary-container font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3 text-tertiary" />
                        <span>{item.quickReplyHi || item.quickReplyEn}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-base text-on-surface mt-1">
                    {item.questionHi}
                  </h3>
                  <p className="text-xs text-on-surface-variant italic">
                    {item.questionEn}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded hover:bg-error-container/30 text-on-surface-variant hover:text-error transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Answers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                <div className="p-3 rounded bg-surface-container-low border border-outline-variant/20 space-y-1">
                  <div className="font-semibold text-secondary text-[11px]">
                    हिंदी उत्तर (Hindi):
                  </div>
                  <p className="text-on-surface whitespace-pre-wrap">{item.answerHi}</p>
                </div>

                <div className="p-3 rounded bg-surface-container-low border border-outline-variant/20 space-y-1">
                  <div className="font-semibold text-secondary text-[11px]">
                    अंग्रेजी उत्तर (English):
                  </div>
                  <p className="text-on-surface whitespace-pre-wrap">{item.answerEn}</p>
                </div>
              </div>

              {/* Keywords */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-3 border-t border-outline-variant/15 text-[11px] text-on-surface-variant">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="font-semibold">
                    {isHindi ? "ट्रिगर कीवर्ड्स:" : "Keywords:"}
                  </span>
                  {item.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30 font-mono"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-surface rounded-2xl border border-outline-variant p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <h2 className="text-lg font-serif font-bold text-on-surface">
                {editingItem
                  ? isHindi
                    ? "प्रश्नोत्तरी संपादित करें"
                    : "Edit Chatbot Q&A"
                  : isHindi
                  ? "नया चैटबॉट प्रश्न जोड़ें"
                  : "Add New Chatbot Q&A"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 rounded hover:bg-surface-container text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-on-surface mb-1">
                    श्रेणी (Category)
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-outline-variant bg-surface text-on-surface"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-on-surface mb-1">
                    क्रम सूचकांक (Order Index)
                  </label>
                  <input
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderIndex: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-outline-variant bg-surface text-on-surface"
                  />
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="block font-medium text-on-surface mb-1">
                  ट्रिगर कीवर्ड्स (Keywords, comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.keywordsInput}
                  onChange={(e) =>
                    setFormData({ ...formData, keywordsInput: e.target.value })
                  }
                  placeholder="kundli, fees, price, शुल्क, जन्मपत्री, खर्च"
                  required
                  className="w-full px-3 py-2 rounded border border-outline-variant bg-surface text-on-surface font-mono"
                />
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  अल्पविराम से अलग करें। जब प्रयोक्ता इनमें से कोई शब्द लिखेगा, चैटबॉट यह उत्तर देगा।
                </p>
              </div>

              {/* Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-on-surface mb-1">
                    प्रश्न (Hindi)
                  </label>
                  <input
                    type="text"
                    value={formData.questionHi}
                    onChange={(e) =>
                      setFormData({ ...formData, questionHi: e.target.value })
                    }
                    placeholder="कुंडली परामर्श की दक्षिणा क्या है?"
                    required
                    className="w-full px-3 py-2 rounded border border-outline-variant bg-surface text-on-surface"
                  />
                </div>

                <div>
                  <label className="block font-medium text-on-surface mb-1">
                    Question (English)
                  </label>
                  <input
                    type="text"
                    value={formData.questionEn}
                    onChange={(e) =>
                      setFormData({ ...formData, questionEn: e.target.value })
                    }
                    placeholder="What are the consultation fees for Kundli?"
                    required
                    className="w-full px-3 py-2 rounded border border-outline-variant bg-surface text-on-surface"
                  />
                </div>
              </div>

              {/* Answers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-on-surface mb-1">
                    उत्तर (Hindi)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.answerHi}
                    onChange={(e) =>
                      setFormData({ ...formData, answerHi: e.target.value })
                    }
                    placeholder="महर्षि कणाद ज्योतिष केंद्र में विस्तृत कुंडली परामर्श..."
                    required
                    className="w-full px-3 py-2 rounded border border-outline-variant bg-surface text-on-surface resize-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-on-surface mb-1">
                    Answer (English)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.answerEn}
                    onChange={(e) =>
                      setFormData({ ...formData, answerEn: e.target.value })
                    }
                    placeholder="Consultation fees start at ₹501 for a complete birth chart analysis..."
                    required
                    className="w-full px-3 py-2 rounded border border-outline-variant bg-surface text-on-surface resize-none"
                  />
                </div>
              </div>

              {/* Quick Reply Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-on-surface mb-1">
                    त्वरित बटन पाठ (Hindi Quick Reply Chip)
                  </label>
                  <input
                    type="text"
                    value={formData.quickReplyHi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quickReplyHi: e.target.value,
                      })
                    }
                    placeholder="कुंडली दक्षिणा"
                    className="w-full px-3 py-2 rounded border border-outline-variant bg-surface text-on-surface"
                  />
                </div>

                <div>
                  <label className="block font-medium text-on-surface mb-1">
                    Quick Reply Chip (English)
                  </label>
                  <input
                    type="text"
                    value={formData.quickReplyEn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quickReplyEn: e.target.value,
                      })
                    }
                    placeholder="Kundli Fees"
                    className="w-full px-3 py-2 rounded border border-outline-variant bg-surface text-on-surface"
                  />
                </div>
              </div>

              {/* Status Switch */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded border-outline-variant text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="font-medium text-on-surface cursor-pointer">
                  सक्रिय रखें (Active on public chatbot)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded border border-outline-variant text-on-surface hover:bg-surface-container"
                >
                  {isHindi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded bg-primary text-on-primary font-medium hover:bg-primary/90"
                >
                  <Save className="w-4 h-4" />
                  <span>{isHindi ? "सहेजें" : "Save Entry"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
