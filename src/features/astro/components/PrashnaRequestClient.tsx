"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import {
  HelpCircle,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  User,
  Phone,
} from "lucide-react";

interface PrashnaRequestClientProps {
  locale: string;
}

const CATEGORIES = [
  { value: "CAREER", labelEn: "Career & Business Crossroads", labelHi: "आजीविका, पदोन्नति एवं व्यापार" },
  { value: "MARRIAGE", labelEn: "Marriage & Relationship Timing", labelHi: "विवाह योग एवं दांपत्य प्रश्न" },
  { value: "HEALTH", labelEn: "Health & Vitality Query", labelHi: "स्वास्थ्य, रोग मुक्ति एवं आयुष" },
  { value: "LEGAL", labelEn: "Legal Disputes & Litigation", labelHi: "न्यायालय विवाद एवं विजय योग" },
  { value: "FINANCE", labelEn: "Wealth, Debt & Capital Recovery", labelHi: "धन लाभ, ऋण मुक्ति एवं संपत्ति" },
  { value: "LOST_OBJECT", labelEn: "Lost Person or Precious Object", labelHi: "नष्ट वस्तु या विस्मृत व्यक्ति की खोज" },
  { value: "GENERAL", labelEn: "General Life Decision / Other", labelHi: "सामान्य जीवन निर्णय / अन्य" },
];

export function PrashnaRequestClient({ locale }: PrashnaRequestClientProps) {
  const isHindi = locale === "hi";

  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10);
  const defaultTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("CAREER");
  const [questionText, setQuestionText] = useState("");
  const [dateOfQuery, setDateOfQuery] = useState(defaultDate);
  const [timeOfQuery, setTimeOfQuery] = useState(defaultTime);
  const [placeOfQuery, setPlaceOfQuery] = useState("Varanasi, UP");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderCreated, setOrderCreated] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/astro/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "PRASHNA_KUNDLI",
          jatakaDetails: {
            name,
            phone,
            email,
            category,
            questionText,
            queryTimestamp: `${dateOfQuery}T${timeOfQuery}`,
            placeOfQuery,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit Prashna query");
      }

      setOrderCreated(data.orderNumber);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error submitting query";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 text-left space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {isHindi ? "दैवज्ञ प्रश्न विचार" : "Vedic Prashna Shastra"}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            Demo
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary mt-1">
          {isHindi ? "तात्कालिक प्रश्न कुण्डली परामर्श" : "Horary Vedic Query (Prashna Kundli)"}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          {isHindi
            ? "जब जन्म समय ज्ञात न हो अथवा किसी विशिष्ट तात्कालिक संशय का सटीक समाधान चाहिए, तब प्रश्न लग्न से भविष्य निर्णय किया जाता है।"
            : "When birth coordinates are unknown or an immediate decision is critical, the cosmic clock at the exact moment of your question reveals the outcome."}
        </p>
      </div>

      {orderCreated ? (
        <div className="bg-surface rounded-lg p-6 sm:p-8 border-2 border-emerald-400 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h2 className="font-serif text-lg font-bold text-emerald-950">
                {isHindi ? "प्रश्न कुण्डली अनुरोध दर्ज कर लिया गया है" : "Prashna Query Logged Successfully"}
              </h2>
              <p className="text-xs text-emerald-800">
                {isHindi
                  ? "प्रश्न लग्न का समय एवं स्थान सुरक्षित कर लिया गया है।"
                  : "The exact coordinates and timestamp have been locked for astrological examination."}
              </p>
            </div>
          </div>

          <div className="p-4 rounded bg-emerald-50 border border-emerald-200">
            <span className="text-xs text-emerald-800 block">
              {isHindi ? "आदेश संदर्भ संख्या:" : "Tracking Token:"}
            </span>
            <span className="font-mono text-xl font-bold text-emerald-950">
              {orderCreated}
            </span>
          </div>

          <p className="text-xs text-on-surface-variant">
            {isHindi
              ? "हमारे वरिष्ठ दैवज्ञ आपके प्रश्न लग्न का सूक्ष्म विश्लेषण कर आदेश स्थिति अपडेट करेंगे।"
              : "Our senior Daivajna will evaluate the planetary lagna and update your order progress in the tracker."}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/track"
              className="min-h-[44px] px-6 py-2.5 bg-secondary hover:bg-secondary/90 text-on-secondary font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
            >
              <span>{isHindi ? "आदेश स्थिति ट्रैक करें" : "Track Order Status"}</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setOrderCreated(null);
                setQuestionText("");
              }}
              className="min-h-[44px] px-4 py-2.5 border border-outline-variant hover:bg-surface-container text-xs font-semibold rounded text-on-surface"
            >
              {isHindi ? "अन्य प्रश्न पूछें" : "Submit Another Question"}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-lg p-6 sm:p-8 border-2 border-secondary/30 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Querent Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "प्रश्नकर्ता का नाम *" : "Your Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "मोबाइल नंबर *" : "Mobile Phone (+91) *"}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9827991224"
                  className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "ईमेल (वैकल्पिक)" : "Email Address"}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                {isHindi ? "प्रश्न की श्रेणी *" : "Question Domain / Category *"}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {isHindi ? c.labelHi : c.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                {isHindi ? "स्पष्ट प्रश्न विवरण (अधिकतम ५०० अक्षर) *" : "Your Specific Question (Max 500 characters) *"}
              </label>
              <textarea
                required
                rows={4}
                maxLength={500}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder={
                  isHindi
                    ? "उदा: क्या मुझे आगामी माह में नौकरी में पदोन्नति मिलेगी अथवा स्थान परिवर्तन उचित रहेगा?"
                    : "e.g. Will my ongoing court proceedings resolve in my favour within the next six months?"
                }
                className="w-full p-3 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
              <span className="text-[11px] text-outline block text-right">
                {questionText.length} / 500
              </span>
            </div>

            {/* Timestamp and Place of Query */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-surface-container-low/50 border border-outline-variant/30">
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "प्रश्न तिथि *" : "Date of Question *"}
                </label>
                <input
                  type="date"
                  required
                  value={dateOfQuery}
                  onChange={(e) => setDateOfQuery(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "प्रश्न समय *" : "Time of Question *"}
                </label>
                <input
                  type="time"
                  required
                  value={timeOfQuery}
                  onChange={(e) => setTimeOfQuery(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "प्रश्न का स्थान *" : "Place of Question *"}
                </label>
                <input
                  type="text"
                  required
                  value={placeOfQuery}
                  onChange={(e) => setPlaceOfQuery(e.target.value)}
                  placeholder="e.g. Varanasi, Uttar Pradesh"
                  className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded bg-error-container/20 border border-error text-error text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] px-6 py-2.5 bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {submitting
                  ? isHindi
                    ? "अनुरोध भेजा जा रहा है..."
                    : "Submitting Query..."
                  : isHindi
                  ? "प्रश्न कुण्डली समीक्षा अनुरोध दर्ज करें"
                  : "Submit Horary Question for Acharya Review"}
              </span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
