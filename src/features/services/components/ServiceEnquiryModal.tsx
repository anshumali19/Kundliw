"use client";

import React, { useState } from "react";
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  Phone,
  User,
  Mail,
  MessageSquare,
} from "lucide-react";

export interface ServiceEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle: string;
  locale: string;
}

export function ServiceEnquiryModal({
  isOpen,
  onClose,
  serviceTitle,
  locale,
}: ServiceEnquiryModalProps) {
  const isHindi = locale === "hi";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const fullMessage = preferredDate
      ? `Preferred Consultation Date: ${preferredDate}\n\nClient Query:\n${message}`
      : message;

    try {
      const res = await fetch("/api/contact/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          subject: `Service Enquiry: ${serviceTitle}`,
          message: fullMessage.trim(),
          source: "SERVICE_MODAL",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({
          type: "success",
          text: isHindi
            ? "आपकी सेवा पूछताछ सफलतापूर्वक दर्ज कर ली गई है। हमारे दैवज्ञ प्रतिनिधि शीघ्र संपर्क करेंगे।"
            : "Your service enquiry has been recorded successfully. Our consultation desk will contact you shortly.",
        });
        setTimeout(() => {
          onClose();
          setName("");
          setPhone("");
          setEmail("");
          setPreferredDate("");
          setMessage("");
          setStatus(null);
        }, 2500);
      } else {
        setStatus({
          type: "error",
          text: data.error || (isHindi ? "पूछताछ दर्ज करने में त्रुटि हुई।" : "Failed to record enquiry."),
        });
      }
    } catch {
      setStatus({
        type: "error",
        text: isHindi
          ? "नेटवर्क त्रुटि। कृपया सीधे हमारे हेल्पलाइन नंबर पर संपर्क करें।"
          : "Network error. Please call our direct helpline.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface border border-outline-variant/60 rounded-2xl shadow-2xl overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-enquiry-title"
      >
        {/* Modal Header */}
        <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <div>
              <h2 id="service-enquiry-title" className="font-serif font-bold text-base text-secondary">
                {isHindi ? "सेवा परामर्श पूछताछ" : "Service Consultation Enquiry"}
              </h2>
              <p className="text-[11px] text-on-surface-variant line-clamp-1">
                {serviceTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {status && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                status.type === "success"
                  ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-700 border border-red-500/20"
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

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Name */}
            <div>
              <label className="font-semibold block mb-1 text-on-surface">
                {isHindi ? "आपका शुभ नाम *" : "Your Name *"}
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-3 text-outline" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isHindi ? "उदा. आचार्य / जातक का नाम" : "e.g. Devotee Name"}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-on-surface">
                  {isHindi ? "मोबाइल नंबर *" : "Phone Number *"}
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-outline" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91-98XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-on-surface">
                  {isHindi ? "ईमेल (वैकल्पिक)" : "Email (Optional)"}
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-outline" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="devotee@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Preferred Date */}
            <div>
              <label className="font-semibold block mb-1 text-on-surface">
                {isHindi ? "अपेक्षित परामर्श तिथि / काल (वैकल्पिक)" : "Preferred Consultation Date (Optional)"}
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-outline" />
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Message / Query */}
            <div>
              <label className="font-semibold block mb-1 text-on-surface">
                {isHindi ? "परामर्श अथवा पूजा हेतु आपकी विशिष्ट आवश्यकता *" : "Specific Astrological Need or Query *"}
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isHindi
                    ? "कृपया अपनी जन्म विवरण संबंधी अथवा विशेष अनुष्ठान संबंधी आवश्यकता लिखें..."
                    : "Please describe your birth query, preferred muhurta, or puja requirements..."
                }
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors font-medium text-xs"
              >
                {isHindi ? "रद्द करें" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors font-semibold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? (isHindi ? "भेज रहे हैं..." : "Sending...") : isHindi ? "पूछताछ भेजें" : "Submit Enquiry"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
