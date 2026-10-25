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
  BookOpen,
  Calendar,
  Briefcase,
  Heart,
  Activity,
  Home,
  TrendingUp,
  FileText,
  Lock,
  Target,
  Users,
  ShieldCheck,
  PenLine,
  Quote,
} from "lucide-react";

interface PrashnaRequestClientProps {
  locale: string;
}

const CATEGORIES = [
  { value: "CAREER", labelEn: "Career & Business Crossroads", labelHi: "आजीविका, पदोन्नति एवं व्यापार" },
  { value: "MARRIAGE", labelEn: "Relationships & Marriage Timing", labelHi: "विवाह योग एवं दांपत्य प्रश्न" },
  { value: "HEALTH", labelEn: "Health & Well-being Query", labelHi: "स्वास्थ्य, रोग मुक्ति एवं आयुष" },
  { value: "LEGAL", labelEn: "Legal Disputes & Litigation", labelHi: "न्यायालय विवाद एवं विजय योग" },
  { value: "FINANCE", labelEn: "Wealth, Investments & Recovery", labelHi: "धन लाभ, ऋण मुक्ति एवं संपत्ति" },
  { value: "PROPERTY", labelEn: "Property, Relocation & Travel", labelHi: "भूमि, भवन एवं विदेश यात्रा" },
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
  const [placeOfQuery, setPlaceOfQuery] = useState("");

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

  const commonAreas = [
    {
      titleEn: "Career & Business",
      titleHi: "आजीविका एवं व्यापार",
      descEn: "Job, professional growth, business decisions",
      descHi: "नौकरी, व्यावसायिक प्रगति व निर्णय",
      icon: Briefcase,
    },
    {
      titleEn: "Relationships & Marriage",
      titleHi: "संबंध एवं विवाह विचार",
      descEn: "Compatibility, timing, family matters",
      descHi: "अनुकूलता, विवाह समय व पारिवारिक विषय",
      icon: Heart,
    },
    {
      titleEn: "Health & Well-being",
      titleHi: "स्वास्थ्य एवं आरोग्य",
      descEn: "Health concerns, recovery, wellness",
      descHi: "स्वास्थ्य संशय, स्वास्थ्य लाभ व आरोग्य",
      icon: Activity,
    },
    {
      titleEn: "Property & Travel",
      titleHi: "सम्पत्ति एवं यात्रा",
      descEn: "Buying property, travel plans, relocation",
      descHi: "भूमि-भवन क्रय, यात्रा व स्थान परिवर्तन",
      icon: Home,
    },
    {
      titleEn: "Finance & Investments",
      titleHi: "वित्त एवं निवेश",
      descEn: "Wealth, savings, investments",
      descHi: "धन संचय, बचत व निवेश निर्णय",
      icon: TrendingUp,
    },
    {
      titleEn: "Legal Matters",
      titleHi: "न्यायालय एवं विवाद",
      descEn: "Court cases, disputes, legal advice",
      descHi: "विवाद, कानूनी प्रक्रिया व निर्णय पक्ष",
      icon: FileText,
    },
    {
      titleEn: "General Life Questions",
      titleHi: "सामान्य जीवन संशय",
      descEn: "Any specific question or decision",
      descHi: "कोई भी विशिष्ट तात्कालिक संशय",
      icon: HelpCircle,
    },
  ];

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-10 text-left space-y-8">
      {/* Top Header with Quote */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              {isHindi ? "दैवज्ञ प्रश्न शास्त्र" : "VEDIC PRASHNA SHASTRA"}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
              Demo
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary tracking-tight">
            {isHindi ? "तात्कालिक प्रश्न कुण्डली परामर्श" : "Horary Vedic Query (Prashna Kundli)"}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            {isHindi
              ? "जब जन्म समय ज्ञात न हो अथवा किसी विशिष्ट तात्कालिक संशय का सटीक समाधान चाहिए, तब प्रश्न लग्न से भविष्य निर्णय किया जाता है।"
              : "When birth coordinates are unknown or an immediate decision is critical, the cosmic clock at the exact moment of your question reveals the outcome."}
          </p>
        </div>

        {/* Quote Card */}
        <div className="bg-surface-container-low/70 rounded-xl p-4 sm:p-5 border border-secondary/20 max-w-sm shrink-0 flex items-start gap-3">
          <Quote className="w-6 h-6 text-primary shrink-0 opacity-60" />
          <div className="space-y-1 text-xs">
            <p className="font-serif italic text-secondary leading-relaxed font-medium">
              {isHindi
                ? "“प्रश्न कुण्डली में प्रश्न का क्षण ही जातक की जन्मपत्रिका बन जाता है।”"
                : "“In Prashna Kundli, time itself becomes the birth chart.”"}
            </p>
            <span className="block text-[11px] font-bold text-primary">
              {isHindi ? "— दैवज्ञ प्रश्न शास्त्र" : "— Vedic Prashna Shastra"}
            </span>
          </div>
        </div>
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (4 cols): About & Common Question Areas */}
        <div className="lg:col-span-4 space-y-5 bg-surface rounded-xl border border-outline-variant/60 p-5 sm:p-6 text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2 className="font-serif text-base font-bold text-secondary">
                {isHindi ? "प्रश्न कुण्डली परिचय" : "About Prashna Kundli"}
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {isHindi
                ? "प्रश्न कुण्डली वैदिक ज्योतिष की वह शास्त्रीय विधा है जिसके द्वारा बिना जन्म विवरण के भी मन में उठे तात्कालिक प्रश्न के समय के आधार पर सटीक निर्णय लिया जाता है।"
                : "Prashna Kundli (Horary Astrology) is a traditional Vedic method used to answer specific questions when birth details are unknown or when you need guidance on an immediate matter."}
            </p>
          </div>

          {/* Common Question Areas */}
          <div className="pt-3 border-t border-outline-variant/40 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              {isHindi ? "प्रमुख प्रश्न क्षेत्र" : "Common Question Areas"}
            </h3>

            <div className="space-y-2.5">
              {commonAreas.map((area) => {
                const Icon = area.icon;
                return (
                  <div
                    key={area.titleEn}
                    className="p-2.5 rounded-lg bg-surface-container-low/40 border border-outline-variant/30 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-secondary">
                        {isHindi ? area.titleHi : area.titleEn}
                      </div>
                      <p className="text-[11px] text-on-surface-variant truncate">
                        {isHindi ? area.descHi : area.descEn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Form Card */}
        <div className="lg:col-span-8 space-y-6 bg-surface rounded-xl border border-outline-variant/60 p-6 sm:p-8 text-left">
          <div className="space-y-1 border-b border-outline-variant/40 pb-4">
            <div className="flex items-center gap-2">
              <PenLine className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-lg sm:text-xl font-bold text-secondary">
                {isHindi ? "अपना प्रश्न (Horary Question) दर्ज करें" : "Submit Your Prashna (Horary Question)"}
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {isHindi
                ? "अपना विवरण एवं वह प्रश्न दर्ज करें जिस पर आप मार्गदर्शन चाहते हैं। केंद्र की टीम प्रश्न लग्न की वैदिक गणना कर समाधान प्रस्तुत करेगी।"
                : "Fill in the details and the exact question you want guidance on. Our Kendra team will analyze the Prashna Kundli using Vedic principles and share the interpretation."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "आपका नाम *" : "YOUR NAME *"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "मोबाइल नंबर (+91) *" : "MOBILE PHONE (+91) *"}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9827991224"
                  className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "ईमेल पता" : "EMAIL ADDRESS"}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                />
              </div>
            </div>

            {/* Row 2: Category Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                {isHindi ? "प्रश्न विषय / श्रेणी *" : "QUESTION DOMAIN / CATEGORY *"}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {isHindi ? cat.labelHi : cat.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Row 3: Question Textarea */}
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                {isHindi ? "आपका विशिष्ट प्रश्न (अधिकतम ५०० अक्षर) *" : "YOUR SPECIFIC QUESTION (MAX 500 CHARACTERS) *"}
              </label>
              <textarea
                required
                maxLength={500}
                rows={5}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="e.g. Will my ongoing court proceedings resolve in my favour within the next six months?"
                className="w-full px-3 py-2.5 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none leading-relaxed"
              />
              <div className="text-right text-[11px] text-outline mt-1 font-mono">
                {questionText.length} / 500
              </div>
            </div>

            {/* Row 4: Date, Time, Place of Question */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "प्रश्न तिथि *" : "DATE OF QUESTION *"}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    type="date"
                    required
                    value={dateOfQuery}
                    onChange={(e) => setDateOfQuery(e.target.value)}
                    className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "प्रश्न समय *" : "TIME OF QUESTION *"}
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    type="time"
                    required
                    value={timeOfQuery}
                    onChange={(e) => setTimeOfQuery(e.target.value)}
                    className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "प्रश्न स्थान *" : "PLACE OF QUESTION *"}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    type="text"
                    required
                    value={placeOfQuery}
                    onChange={(e) => setPlaceOfQuery(e.target.value)}
                    placeholder="Varanasi, UP"
                    className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[48px] px-6 py-3 bg-[#e8751a] hover:bg-[#d06410] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>
                {submitting
                  ? isHindi
                    ? "अनुरोध दर्ज हो रहा है..."
                    : "SUBMITTING QUERY..."
                  : isHindi
                  ? "प्रश्न कुण्डली समीक्षा हेतु अनुरोध भेजें"
                  : "SUBMIT HORARY QUESTION FOR KENDRA TEAM REVIEW"}
              </span>
            </button>

            {/* Confidentiality Notice Banner */}
            <div className="p-3.5 rounded-lg bg-sky-50/80 border border-sky-200 text-sky-900 text-xs flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-sky-600 shrink-0" />
              <p>
                {isHindi
                  ? "आपकी जानकारी पूर्णतः गोपनीय है एवं इसका उपयोग केवल ज्योतिषीय विश्लेषण प्रदान करने हेतु किया जाएगा।"
                  : "Your information is completely confidential and will be used only for providing astrological analysis."}
              </p>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-error-container/20 border border-error text-error text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success State */}
          {orderCreated && (
            <div className="p-6 rounded-lg bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{isHindi ? "प्रश्न कुण्डली अनुरोध सफलतापूर्वक दर्ज" : "Prashna Query Registered Successfully"}</span>
              </div>
              <p className="text-xs">
                {isHindi ? "आदेश संदर्भ संख्या:" : "Tracking Token:"}{" "}
                <strong className="font-mono text-emerald-900 text-base">{orderCreated}</strong>
              </p>
              <p className="text-xs text-emerald-800">
                {isHindi
                  ? "प्रश्न लग्न का समय एवं स्थान सुरक्षित कर लिया गया है। केंद्र के वरिष्ठ दैवज्ञ विश्लेषण प्रारंभ कर रहे हैं।"
                  : "The exact timestamp and coordinates of your question have been recorded for senior Kendra team examination."}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/track"
                  className="inline-flex items-center justify-center min-h-[44px] px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors"
                >
                  {isHindi ? "आदेश स्थिति ट्रैक करें →" : "Track Order Status →"}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOrderCreated(null);
                    setQuestionText("");
                  }}
                  className="min-h-[44px] px-4 py-2 border border-emerald-700 text-emerald-800 rounded font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 transition-colors"
                >
                  {isHindi ? "अन्य प्रश्न दर्ज करें" : "Submit Another Question"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Feature Card: Why Choose Our Prashna Analysis */}
      <div className="bg-surface rounded-xl border border-outline-variant/50 p-6 sm:p-7 space-y-5 text-left">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-base sm:text-lg font-bold text-secondary">
            {isHindi ? "हमारा प्रश्न विश्लेषण क्यों चुनें?" : "Why Choose Our Prashna Analysis?"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="p-3.5 rounded-lg bg-surface-container-low/40 border border-outline-variant/30 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-secondary">
                {isHindi ? "प्रामाणिक ग्रंथ सम्मत" : "Based on Authentic Texts"}
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                {isHindi
                  ? "ताजिक नीलकंठी एवं प्रश्न मार्ग के शास्त्रीय नियमों पर आधारित"
                  : "Analysis using classical Vedic texts and proven methods."}
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-3.5 rounded-lg bg-surface-container-low/40 border border-outline-variant/30 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-secondary">
                {isHindi ? "अनुभवी दैवज्ञ मंडल" : "Expert Astrologers"}
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                {isHindi
                  ? "काशी परंपरा के अनुभवी दैवज्ञों द्वारा व्यक्तिगत समीक्षा"
                  : "Reviewed by experienced Kendra Vedic astrologers."}
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-3.5 rounded-lg bg-surface-container-low/40 border border-outline-variant/30 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-secondary">
                {isHindi ? "व्यावहारिक समाधान" : "Practical Guidance"}
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                {isHindi
                  ? "स्पष्ट निष्कर्ष, समय-सीमा एवं कार्यान्वयन योग्य सलाह"
                  : "Clear interpretation with actionable insights."}
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-3.5 rounded-lg bg-surface-container-low/40 border border-outline-variant/30 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-secondary">
                {isHindi ? "गोपनीय एवं सुरक्षित" : "Confidential & Secure"}
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                {isHindi
                  ? "आपके सभी प्रश्न एवं व्यक्तिगत विवरण पूर्णतः सुरक्षित"
                  : "Your questions and details remain private."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
