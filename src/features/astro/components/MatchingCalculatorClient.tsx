"use client";

import React, { useState } from "react";
import { MatchingResult } from "@/lib/astro/types";
import { Link } from "@/i18n/routing";
import {
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  ShieldCheck,
  Star,
  Activity,
  Calendar,
  Clock,
  MapPin,
  User,
  Lock,
  BarChart2,
  FileCheck,
  Lightbulb,
  Compass,
  Gem,
  Flame,
  Users,
} from "lucide-react";

interface MatchingCalculatorClientProps {
  locale: string;
}

export function MatchingCalculatorClient({ locale }: MatchingCalculatorClientProps) {
  const isHindi = locale === "hi";

  // Boy details
  const [boyName, setBoyName] = useState("Aarav Sharma");
  const [boyDob, setBoyDob] = useState("1994-06-12");
  const [boyTob, setBoyTob] = useState("07:15");
  const [boyPob, setBoyPob] = useState("Varanasi, UP");

  // Girl details
  const [girlName, setGirlName] = useState("Pooja Mishra");
  const [girlDob, setGirlDob] = useState("1996-09-24");
  const [girlTob, setGirlTob] = useState("14:40");
  const [girlPob, setGirlPob] = useState("Patna, Bihar");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchingResult | null>(null);

  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderCreated, setOrderCreated] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/astro/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boy: { name: boyName, gender: "MALE", dob: boyDob, tob: boyTob, pob: boyPob },
          girl: { name: girlName, gender: "FEMALE", dob: girlDob, tob: girlTob, pob: girlPob },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Matching calculation failed");
      }

      setResult(data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error calculating Ashtakoot matching";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsOrder = async () => {
    setSubmittingOrder(true);
    setError(null);

    try {
      const res = await fetch("/api/astro/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "KUNDLI_MATCHING",
          jatakaDetails: {
            boy: { name: boyName, dob: boyDob, tob: boyTob, pob: boyPob },
            girl: { name: girlName, dob: girlDob, tob: girlTob, pob: girlPob },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit matching request");
      }

      setOrderCreated(data.orderNumber);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record request";
      setError(msg);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const kootaDescriptions = [
    {
      name: "Varna",
      nameHi: "वर्ण",
      pts: "1 Point",
      ptsHi: "१ अंक",
      desc: "Spiritual compatibility & ego levels",
      descHi: "आध्यात्मिक सामंजस्य व अहंकार स्तर",
      icon: Flame,
    },
    {
      name: "Vashya",
      nameHi: "वश्य",
      pts: "2 Points",
      ptsHi: "२ अंक",
      desc: "Mutual attraction & emotional control",
      descHi: "परस्पर आकर्षण व भावनात्मक नियंत्रण",
      icon: Users,
    },
    {
      name: "Tara",
      nameHi: "तारा",
      pts: "3 Points",
      ptsHi: "३ अंक",
      desc: "Destiny, health & longevity",
      descHi: "भाग्य, स्वास्थ्य व दीर्घायु विचार",
      icon: Star,
    },
    {
      name: "Yoni",
      nameHi: "योनि",
      pts: "4 Points",
      ptsHi: "४ अंक",
      desc: "Physical & biological compatibility",
      descHi: "शारीरिक व जैविक अनुकूलता",
      icon: Activity,
    },
    {
      name: "Graha Maitri",
      nameHi: "ग्रह मैत्री",
      pts: "5 Points",
      ptsHi: "५ अंक",
      desc: "Mental affinity & friendship",
      descHi: "मानसिक अनुकूलता व सौहार्द",
      icon: HeartHandshake,
    },
    {
      name: "Gana",
      nameHi: "गण",
      pts: "6 Points",
      ptsHi: "६ अंक",
      desc: "Temperament & psychological nature",
      descHi: "स्वभाव व मनोवैज्ञानिक प्रकृति",
      icon: Compass,
    },
    {
      name: "Bhakoot",
      nameHi: "भकूट",
      pts: "7 Points",
      ptsHi: "७ अंक",
      desc: "Family welfare, love & financial prosperity",
      descHi: "दांपत्य प्रेम, वंश वृद्धि व समृद्धि",
      icon: Gem,
    },
    {
      name: "Nadi",
      nameHi: "नाड़ी",
      pts: "8 Points",
      ptsHi: "८ अंक",
      desc: "Genetic compatibility & progeny health",
      descHi: "आनुवंशिक अनुकूलता व संतान स्वास्थ्य",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-left space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {isHindi ? "अष्टकूट गुण मिलान" : "VEDIC ASHTAKOOT GUN MILAN"}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            Demo
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary mt-1">
          {isHindi ? "विवाह कुण्डली एवं मेलापक विचार" : "Matrimonial Compatibility & Horoscope Milan"}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 max-w-3xl">
          {isHindi
            ? "वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट एवं नाड़ी के ३६ गुणों पर आधारित शास्त्रीय मिलान।"
            : "Complete 36-Guna Ashtakoot mathematical compatibility assessment including Manglik and Nadi Dosha review."}
        </p>
      </div>

      {/* Top 4-card Feature Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-surface rounded-xl p-4 border border-outline-variant/40 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-secondary">
              {isHindi ? "३६ गुण विश्लेषण" : "36 Guna Analysis"}
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              {isHindi
                ? "८ मुख्य ज्योतिषीय अष्टकूट घटकों का गहन विश्लेषण"
                : "Detailed assessment across 8 key astrological factors"}
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface rounded-xl p-4 border border-outline-variant/40 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-secondary">
              {isHindi ? "मांगलिक विचार" : "Manglik Evaluation"}
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              {isHindi
                ? "मांगलिक दोष एवं ग्रह सामंजस्य की शास्त्रीय जांच"
                : "Check for Manglik Dosha and planetary harmony"}
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface rounded-xl p-4 border border-outline-variant/40 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-secondary">
              {isHindi ? "नाड़ी दोष समीक्षा" : "Nadi Dosha Review"}
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              {isHindi
                ? "स्वास्थ्य एवं आनुवंशिक अनुकूलता का शास्त्रीय परीक्षण"
                : "Health and genetic compatibility verification"}
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface rounded-xl p-4 border border-outline-variant/40 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-secondary">
              {isHindi ? "विस्तृत रिपोर्ट" : "Detailed Report"}
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              {isHindi
                ? "त्वरित परिणाम एवं व्यक्तिगत ज्योतिषीय मार्गदर्शन"
                : "Instant insights with personalized recommendations"}
            </p>
          </div>
        </div>
      </div>

      {/* Main 12-column Card (Form + Sidebar) */}
      <div className="bg-surface rounded-xl p-6 sm:p-8 border border-outline-variant/50 space-y-6">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-secondary">
            {isHindi ? "जन्म विवरण दर्ज करें" : "Enter Birth Details"}
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            {isHindi
              ? "प्रामाणिक कुंडली मिलान हेतु वर और कन्या दोनों का सटीक विवरण दर्ज करें।"
              : "Please provide accurate birth details for both partners for an authentic horoscope matching."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form (8 cols) */}
          <form onSubmit={handleCalculate} className="lg:col-span-8 space-y-6">
            {/* Groom / Boy Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-2">
                <User className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  {isHindi ? "वर विवरण (Boy Details)" : "Groom / Boy Details"}
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "वर का नाम *" : "Boy's Name *"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    type="text"
                    required
                    value={boyName}
                    onChange={(e) => setBoyName(e.target.value)}
                    placeholder="Aarav Sharma"
                    className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                    {isHindi ? "जन्म तिथि *" : "Date of Birth *"}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      type="date"
                      required
                      value={boyDob}
                      onChange={(e) => setBoyDob(e.target.value)}
                      className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                    {isHindi ? "जन्म समय *" : "Time of Birth *"}
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      type="time"
                      required
                      value={boyTob}
                      onChange={(e) => setBoyTob(e.target.value)}
                      className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "जन्म स्थान *" : "Birth Place *"}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    type="text"
                    required
                    value={boyPob}
                    onChange={(e) => setBoyPob(e.target.value)}
                    placeholder="Varanasi, UP"
                    className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Boy Alert Notice (Rose tinted) */}
            <div className="p-3.5 rounded-lg bg-rose-50/80 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {isHindi
                  ? "सटीक कुंडली मिलान के लिए जन्म समय और स्थान अत्यंत महत्वपूर्ण हैं। यदि सही समय ज्ञात न हो, तो निकटतम उपलब्ध समय दर्ज करें।"
                  : "Birth time and place are important for accurate horoscope matching. If exact time is unknown, please use nearest available time."}
              </p>
            </div>

            {/* Bride / Girl Details */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-2">
                <User className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  {isHindi ? "कन्या विवरण (Girl Details)" : "Bride / Girl Details"}
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "कन्या का नाम *" : "Girl's Name *"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    type="text"
                    required
                    value={girlName}
                    onChange={(e) => setGirlName(e.target.value)}
                    placeholder="Pooja Mishra"
                    className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                    {isHindi ? "जन्म तिथि *" : "Date of Birth *"}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      type="date"
                      required
                      value={girlDob}
                      onChange={(e) => setGirlDob(e.target.value)}
                      className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                    {isHindi ? "जन्म समय *" : "Time of Birth *"}
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      type="time"
                      required
                      value={girlTob}
                      onChange={(e) => setGirlTob(e.target.value)}
                      className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "जन्म स्थान *" : "Birth Place *"}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    type="text"
                    required
                    value={girlPob}
                    onChange={(e) => setGirlPob(e.target.value)}
                    placeholder="Patna, Bihar"
                    className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Girl Confidentiality Notice (Sky tinted) */}
            <div className="p-3.5 rounded-lg bg-sky-50/80 border border-sky-200 text-sky-900 text-xs flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {isHindi
                  ? "सभी विवरण पूर्णतः गोपनीय रखे जाते हैं और केवल अनुकूलता गणना के लिए प्रयुक्त होते हैं। हम आपकी व्यक्तिगत जानकारी संग्रहीत नहीं करते।"
                  : "All details are kept confidential and are used only for compatibility calculation. We do not store your personal information."}
              </p>
            </div>

            {/* Orange Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] px-6 py-3 bg-[#e8751a] hover:bg-[#d06410] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <HeartHandshake className="w-5 h-5" />
              <span>
                {loading
                  ? isHindi
                    ? "गुण मिलान गणना जारी..."
                    : "Calculating Matching..."
                  : isHindi
                  ? "अष्टकूट गुण मिलान करें"
                  : "CALCULATE ASHTAKOOT GUN MILAN"}
              </span>
            </button>
          </form>

          {/* Right Column: Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-5 bg-surface-container-low/40 p-5 rounded-xl border border-outline-variant/30">
            <div>
              <h3 className="font-serif text-base font-bold text-secondary">
                {isHindi ? "अष्टकूट गुण मिलान परिचय" : "About Ashtakoot Guna Milan"}
              </h3>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                {isHindi
                  ? "अष्टकूट मिलान आठ (अष्ट) कूट श्रेणियों पर आधारित कुण्डली मिलान की पारम्परिक वैदिक पद्धति है। वैवाहिक सामंजस्य हेतु कुल ३६ गुणों का आकलन किया जाता है।"
                  : "Ashtakoot Milan is the traditional Vedic method of matching horoscopes based on eight (Ashta) categories (Kootas). A total of 36 Gunas are evaluated to assess marital harmony and compatibility."}
              </p>
            </div>

            {/* 8 Kootas Grid */}
            <div className="space-y-2 pt-1 border-t border-outline-variant/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                {kootaDescriptions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.name}
                      className="p-2.5 rounded-lg bg-surface border border-outline-variant/30 flex items-start gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-md bg-surface-container text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-secondary">
                            {isHindi ? item.nameHi : item.name}
                          </span>
                          <span className="text-[10px] font-semibold text-primary">
                            ({isHindi ? item.ptsHi : item.pts})
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant truncate">
                          {isHindi ? item.descHi : item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ideal Compatibility Card */}
            <div className="p-4 rounded-lg bg-amber-50/90 border border-amber-300 text-amber-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                <CheckCircle2 className="w-4 h-4 text-amber-700" />
                <span>{isHindi ? "आदर्श अनुकूलता (१८+ गुण)" : "Ideal Compatibility (18+)"}</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                {isHindi
                  ? "विवाह हेतु ३६ में से न्यूनतम १८ अंक अनुशंसित हैं। २४ से अधिक अंक एक सुखी एवं आनंदमय दांपत्य जीवन के लिए अत्यंत शुभ माने जाते हैं।"
                  : "A minimum score of 18 points out of 36 is recommended for marriage. Scores above 24 are considered very auspicious for a blissful union."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 4-card Feature Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-surface rounded-xl p-4 border border-outline-variant/40 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-secondary">
              {isHindi ? "विस्तृत अनुकूलता अंक" : "Detailed Compatibility Score"}
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              {isHindi
                ? "सभी आठ वैदिक कूटों में प्राप्त अंकों का विस्तृत विवरण"
                : "Comprehensive breakdown of points across all eight Vedic kootas"}
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface rounded-xl p-4 border border-outline-variant/40 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-secondary">
              {isHindi ? "मांगलिक एवं नाड़ी परीक्षण" : "Manglik & Nadi Analysis"}
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              {isHindi
                ? "दांपत्य शांति को प्रभावित करने वाले मुख्य दोषों का परीक्षण"
                : "Thorough evaluation of critical doshas affecting matrimonial peace"}
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface rounded-xl p-4 border border-outline-variant/40 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-secondary">
              {isHindi ? "व्यक्तिगत अंतर्दृष्टि" : "Personalized Insights"}
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              {isHindi
                ? "ग्रह मित्रता एवं वैवाहिक सामंजस्य की सूक्ष्म व्याख्या"
                : "In-depth interpretation of planetary harmonies and potential areas of growth"}
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface rounded-xl p-4 border border-outline-variant/40 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-secondary">
              {isHindi ? "वैदिक मार्गदर्शन" : "Vedic Guidance"}
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              {isHindi
                ? "सुखी दांपत्य हेतु प्रामाणिक आध्यात्मिक एवं वैदिक मार्गदर्शन"
                : "Actionable spiritual and astrological advice for a fulfilling partnership"}
            </p>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-error-container/20 border border-error text-error text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Order registration notification */}
      {orderCreated && (
        <div className="p-6 rounded-lg bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{isHindi ? "विवाह मिलान अनुरोध दर्ज" : "Matching Request Registered"}</span>
          </div>
          <p className="text-xs">
            {isHindi ? "आदेश संदर्भ संख्या:" : "Tracking Token:"}{" "}
            <strong className="font-mono text-emerald-900">{orderCreated}</strong>
          </p>
          <p className="text-xs text-emerald-800">
            {isHindi
              ? "आपकी कुंडली मिलान समीक्षा केंद्र के वरिष्ठ ज्योतिषी के संज्ञान में दर्ज कर ली गई है।"
              : "Your matrimonial match request has been filed for senior Kendra team review."}
          </p>
          <div className="pt-2">
            <Link
              href="/track"
              className="text-xs font-bold text-emerald-900 underline hover:text-emerald-700"
            >
              {isHindi ? "स्थिति ट्रैक करें →" : "Track Order Status →"}
            </Link>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="bg-surface rounded-xl p-6 sm:p-8 border-2 border-secondary/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/40">
            <div>
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest block">
                {isHindi ? "गुण मिलान परिणाम" : "Matching Scorecard"}
              </span>
              <h2 className="font-serif text-xl font-bold text-secondary mt-0.5">
                {boyName} & {girlName}
              </h2>
            </div>
            <div className="flex flex-col sm:items-end gap-1">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-on-surface-variant block">
                    {isHindi ? "कुल प्राप्त गुण" : "Total Score"}
                  </span>
                  <span className="font-serif text-2xl font-bold text-secondary">
                    {result.totalScore} <span className="text-sm font-normal text-outline">/ {result.maxScore}</span>
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded text-xs font-bold uppercase tracking-wider">
                  Demo
                </span>
              </div>
              <span className="text-[11px] font-medium text-amber-900">
                Sample output, not a real calculation • नमूना परिणाम, वास्तविक गणना नहीं
              </span>
            </div>
          </div>

          {/* Verdict Box */}
          <div className="p-4 rounded-lg bg-surface-container-low border border-secondary/20 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
              {isHindi ? "शास्त्रीय सम्मति (Verdict)" : "Astrological Verdict"}
            </span>
            <p className="font-serif text-base font-semibold text-secondary">
              {isHindi ? result.verdictHi : result.verdictEn}
            </p>
          </div>

          {/* Planetary & Dosha Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded bg-surface-container-low border border-outline-variant/30">
              <span className="text-[10px] uppercase text-outline font-semibold block">
                {isHindi ? "मांगलिक स्थिति" : "Manglik Status"}
              </span>
              <span className="font-bold text-secondary text-sm">
                {result.manglikStatus.compatibility}
              </span>
            </div>
            <div className="p-3 rounded bg-surface-container-low border border-outline-variant/30">
              <span className="text-[10px] uppercase text-outline font-semibold block">
                {isHindi ? "नाड़ी दोष" : "Nadi Dosha"}
              </span>
              <span className={`font-bold text-sm ${result.nadiDosha ? "text-error" : "text-emerald-700"}`}>
                {result.nadiDosha
                  ? isHindi
                    ? "दोष उपस्थित"
                    : "Dosha Present"
                  : isHindi
                  ? "दोष रहित (शुभ)"
                  : "Nadi Shuddha (Safe)"}
              </span>
            </div>
            <div className="p-3 rounded bg-surface-container-low border border-outline-variant/30">
              <span className="text-[10px] uppercase text-outline font-semibold block">
                {isHindi ? "नक्षत्र मिलान" : "Nakshatras"}
              </span>
              <span className="font-bold text-secondary text-sm">
                {result.boyNakshatra} / {result.girlNakshatra}
              </span>
            </div>
          </div>

          {/* 8 Kootas Table */}
          <div>
            <h3 className="font-serif text-sm font-bold text-secondary mb-2">
              {isHindi ? "अष्टकूट गुण विवरण (८ कूट)" : "Ashtakoot Breakdown (8 Pillars)"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-outline-variant/40">
                <thead className="bg-surface-container text-secondary font-bold">
                  <tr>
                    <th className="p-2.5 text-left">Koota</th>
                    <th className="p-2.5 text-left">Significance</th>
                    <th className="p-2.5 text-center">Score</th>
                    <th className="p-2.5 text-center">Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {result.kootas.map((koota) => (
                    <tr key={koota.name} className="hover:bg-surface-container-low">
                      <td className="p-2.5 font-bold text-on-surface">
                        {isHindi ? koota.nameHi : koota.name} ({koota.name})
                      </td>
                      <td className="p-2.5 text-on-surface-variant">{koota.description}</td>
                      <td className="p-2.5 text-center font-bold text-secondary">{koota.score}</td>
                      <td className="p-2.5 text-center text-outline">{koota.maxScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upsell / Review actions */}
          <div className="pt-4 border-t border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-[11px] text-on-surface-variant">
              * {result.sampleDisclaimer}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/booking?service=kundli-matching&name=${encodeURIComponent(
                  boyName
                )}&dob=${boyDob}&tob=${boyTob}&pob=${encodeURIComponent(
                  boyPob
                )}&partnerName=${encodeURIComponent(
                  girlName
                )}&partnerDob=${girlDob}&partnerTob=${girlTob}&partnerPob=${encodeURIComponent(girlPob)}`}
                className="min-h-[44px] px-6 py-2.5 bg-[#e8751a] hover:bg-[#d06410] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 text-center"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isHindi ? "विस्तृत मेलापक परामर्श लें" : "Order Detailed Kendra Team Analysis"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                disabled={submittingOrder || Boolean(orderCreated)}
                onClick={handleSaveAsOrder}
                className="min-h-[44px] px-4 py-2.5 border border-secondary text-secondary hover:bg-secondary/10 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span>
                  {submittingOrder
                    ? isHindi
                      ? "पंजीकरण जारी..."
                      : "Submitting..."
                    : isHindi
                    ? "नि:शुल्क समीक्षा अनुरोध भेजें"
                    : "Submit Free Review Request"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
