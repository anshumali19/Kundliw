"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Inbox,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  MessageSquare,
} from "lucide-react";

interface EnquiryItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  subject: string;
  message: string;
  source: string;
  isResolved: boolean;
  createdAt: string;
}

export function AdminEnquiriesManager({ locale }: { locale: string }) {
  const isHindi = locale === "hi";
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const [sourceFilter, setSourceFilter] = useState<"ALL" | "CHATBOT_LEAD" | "CONTACT_PAGE">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/enquiries?status=${filter}`);
      const data = await res.json();
      if (res.ok && data.enquiries) {
        setEnquiries(data.enquiries);
      } else {
        setStatus({ type: "error", text: data.error || "Failed to load enquiries." });
      }
    } catch {
      setStatus({ type: "error", text: "Network error loading enquiries." });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const toggleResolved = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResolved: !currentStatus }),
      });
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, isResolved: !currentStatus } : e))
        );
      }
    } catch {
      setStatus({ type: "error", text: "Failed to update status." });
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        isHindi
          ? "क्या आप इस पूछताछ को हटाना चाहते हैं?"
          : "Are you sure you want to delete this enquiry?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEnquiries((prev) => prev.filter((e) => e.id !== id));
      }
    } catch {
      setStatus({ type: "error", text: "Failed to delete enquiry." });
    }
  };

  const filtered = enquiries.filter((e) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      e.name.toLowerCase().includes(term) ||
      e.phone.toLowerCase().includes(term) ||
      (e.email && e.email.toLowerCase().includes(term)) ||
      e.subject.toLowerCase().includes(term) ||
      e.message.toLowerCase().includes(term);

    const matchesSource =
      sourceFilter === "ALL" ||
      (sourceFilter === "CHATBOT_LEAD" && (e.source === "CHATBOT_LEAD" || e.source === "CHATBOT_TICKET")) ||
      (sourceFilter === "CONTACT_PAGE" && e.source === "CONTACT_PAGE");

    return matchesSearch && matchesSource;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-serif font-bold text-on-surface">
              {isHindi ? "संपर्क एवं परामर्श पूछताछ" : "Contact & Consultation Enquiries"}
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            {isHindi
              ? "वेबसाइट संपर्क पृष्ठ एवं चैटबॉट फ़ॉलबैक से प्राप्त प्रयोक्ताओं की सभी पूछताछ।"
              : "Inbound messages received from the Contact page and Chatbot fallback form."}
          </p>
        </div>

        <button
          onClick={fetchEnquiries}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded border border-outline-variant text-xs font-semibold hover:bg-surface-container transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{isHindi ? "पुनः लोड करें" : "Refresh"}</span>
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

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              isHindi
                ? "नाम, फोन या संदेश खोजें..."
                : "Search by name, phone, or message..."
            }
            className="w-full pl-9 pr-4 py-2 rounded border border-outline-variant bg-surface text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {/* Status Filter */}
          {(["all", "pending", "resolved"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filter === mode
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {mode === "all" && (isHindi ? "सभी स्थितियां" : "All Status")}
              {mode === "pending" && (isHindi ? "लंबित" : "Pending")}
              {mode === "resolved" && (isHindi ? "निस्तारित" : "Resolved")}
            </button>
          ))}

          <span className="text-outline-variant/60 hidden sm:inline">|</span>

          {/* Source Filter */}
          {(
            [
              { id: "ALL", labelEn: "All Sources", labelHi: "सभी स्रोत" },
              { id: "CHATBOT_LEAD", labelEn: "🤖 Chatbot Leads", labelHi: "🤖 चैटबॉट लीड्स" },
              { id: "CONTACT_PAGE", labelEn: "✉️ Contact Form", labelHi: "✉️ संपर्क प्रपत्र" },
            ] as const
          ).map((src) => (
            <button
              key={src.id}
              onClick={() => setSourceFilter(src.id)}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                sourceFilter === src.id
                  ? "bg-secondary text-on-secondary"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {isHindi ? src.labelHi : src.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries List */}
      {loading ? (
        <div className="py-12 text-center text-on-surface-variant text-sm">
          {isHindi ? "पूछताछ लोड हो रही हैं..." : "Loading enquiries..."}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-surface-container border border-outline-variant/40 space-y-2">
          <Inbox className="w-8 h-8 text-on-surface-variant mx-auto" />
          <p className="text-sm font-semibold text-on-surface">
            {isHindi ? "कोई पूछताछ नहीं मिली" : "No enquiries found"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-xl border transition-all ${
                item.isResolved
                  ? "bg-surface-container-low/60 border-outline-variant/20 opacity-80"
                  : "bg-surface border-outline-variant/40 shadow-sm"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-outline-variant/20">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif font-bold text-base text-on-surface">
                      {item.name}
                    </span>
                    {item.source === "CHATBOT_LEAD" ? (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                        🤖 {isHindi ? "चैटबॉट लीड" : "Chatbot Lead"}
                      </span>
                    ) : item.source === "CHATBOT_TICKET" ? (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30 flex items-center gap-1">
                        🎫 {isHindi ? "चैटबॉट टिकट" : "Chatbot Ticket"}
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                        {item.source}
                      </span>
                    )}
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                        item.isResolved
                          ? "bg-secondary-container/40 text-on-secondary-container"
                          : "bg-amber-500/10 text-amber-700"
                      }`}
                    >
                      {item.isResolved ? "Resolved" : "Pending"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-1.5 flex-wrap">
                    <a
                      href={`tel:${item.phone}`}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{item.phone}</span>
                    </a>
                    {item.email && (
                      <a
                        href={`mailto:${item.email}`}
                        className="inline-flex items-center gap-1 hover:text-primary"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{item.email}</span>
                      </a>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start">
                  <button
                    onClick={() => toggleResolved(item.id, item.isResolved)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      item.isResolved
                        ? "bg-surface-container text-on-surface-variant hover:text-on-surface"
                        : "bg-secondary text-on-secondary hover:bg-secondary/90"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {item.isResolved
                        ? isHindi
                          ? "लंबित करें"
                          : "Mark Pending"
                        : isHindi
                        ? "निस्तारित करें"
                        : "Mark Resolved"}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded hover:bg-error-container/30 text-on-surface-variant hover:text-error"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 text-xs space-y-1.5">
                <div className="font-semibold text-on-surface">
                  {item.subject}
                </div>
                <p className="text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                  {item.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
