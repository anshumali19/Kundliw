"use client";

import React, { useState } from "react";
import { KundliResult } from "@/lib/astro/types";
import { Link } from "@/i18n/routing";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  BookOpen,
  Info,
  PenLine,
  Compass,
  LayoutGrid,
  RefreshCw,
  Target,
  Users,
  ShieldCheck,
  Star,
  Activity,
  User,
} from "lucide-react";

interface KundliCalculatorClientProps {
  locale: string;
}

export function KundliCalculatorClient({ locale }: KundliCalculatorClientProps) {
  const isHindi = locale === "hi";

  const [name, setName] = useState("");
  const [gender, setGender] = useState("MALE");
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [pob, setPob] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<KundliResult | null>(null);

  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderCreated, setOrderCreated] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/astro/kundli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, gender, dob, tob, pob }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Calculation failed");
      }

      setResult(data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error calculating kundli";
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
          requestType: "KUNDLI_REQUEST",
          jatakaDetails: { name, gender, dob, tob, pob },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      setOrderCreated(data.orderNumber);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record request";
      setError(msg);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const featuresWhatYouGet = [
    {
      titleEn: "Planetary Positions",
      titleHi: "ग्रह स्पष्ट एवं स्थिति",
      descEn: "Longitude, sign and house placement of all 9 planets",
      descHi: "सभी ९ ग्रहों के भोगांश, राशि एवं भाव स्थिति",
      icon: Compass,
    },
    {
      titleEn: "Ascendant (Lagna)",
      titleHi: "लग्न स्पष्ट विचार",
      descEn: "Rising sign and its details",
      descHi: "उदय लग्न, अंश एवं विस्तृत विश्लेषण",
      icon: Activity,
    },
    {
      titleEn: "Vimshottari Mahadasha",
      titleHi: "विंशोत्तरी महादशा",
      descEn: "Current and upcoming dasha periods",
      descHi: "वर्तमान एवं आगामी दशा-अन्तर्दशा चक्र",
      icon: Clock,
    },
    {
      titleEn: "Rashi & Navamsa Charts",
      titleHi: "राशि एवं नवांश चक्र",
      descEn: "North Indian and South Indian chart styles",
      descHi: "पारम्परिक उत्तर एवं दक्षिण भारतीय चक्र स्वरूप",
      icon: LayoutGrid,
    },
    {
      titleEn: "Detailed Chart Report",
      titleHi: "विस्तृत जन्मपत्रिका प्रतिवेदन",
      descEn: "Download or view your complete Janampatri",
      descHi: "सम्पूर्ण जन्मपत्रिका देखें अथवा सुरक्षित करें",
      icon: FileText,
    },
  ];

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-10 text-left space-y-8">
      {/* Top Header */}
      <div className="space-y-1.5 max-w-4xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {isHindi ? "विशुद्ध गणितीय कुण्डली" : "VEDIC EPHEMERIS COMPUTATION"}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            Demo
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary tracking-tight">
          {isHindi ? "वैदिक जन्मपत्रिका एवं ग्रह स्पष्ट गणना" : "Vedic Janampatri & Chart Computation"}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          {isHindi
            ? "सूर्य सिद्धान्त एवं दृग्गणित पर आधारित शुद्ध लग्न, राशि, नक्षत्र, ग्रह स्पष्ट एवं विंशोत्तरी महादशा गणना।"
            : "Generate an accurate Vedic birth chart (Janampatri) with planetary positions, ascendant and Vimshottari Mahadasha based on authentic mathematical tables and classical Jyotish principles."}
        </p>
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Enter Birth Details */}
        <div className="lg:col-span-8 space-y-6 bg-surface rounded-xl border border-outline-variant/60 p-6 sm:p-8 text-left">
          <div className="space-y-1 border-b border-outline-variant/40 pb-4">
            <div className="flex items-center gap-2">
              <PenLine className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-lg sm:text-xl font-bold text-secondary">
                {isHindi ? "जन्म विवरण दर्ज करें" : "Enter Birth Details"}
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {isHindi
                ? "अपनी जन्मपत्रिका एवं ग्रह स्पष्ट चक्र निर्मित करने हेतु सटीक जन्म विवरण प्रदान करें।"
                : "Provide accurate birth information to generate your Vedic Janampatri and planetary chart."}
            </p>
          </div>

          <form onSubmit={handleCalculate} className="space-y-5">
            {/* Row 1: 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "जातक नाम *" : "FULL NAME *"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aditya Sharma"
                    className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "लिंग *" : "GENDER *"}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none font-medium"
                >
                  <option value="MALE">{isHindi ? "पुरुष (Male)" : "Male"}</option>
                  <option value="FEMALE">{isHindi ? "महिला (Female)" : "Female"}</option>
                  <option value="OTHER">{isHindi ? "अन्य (Other)" : "Other"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "जन्म तिथि *" : "DATE OF BIRTH *"}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "जन्म समय (HH:MM) *" : "TIME OF BIRTH (HH:MM) *"}
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    type="time"
                    required
                    value={tob}
                    onChange={(e) => setTob(e.target.value)}
                    className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "जन्म स्थान (शहर, राज्य) *" : "BIRTH PLACE (CITY, COUNTRY) *"}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    type="text"
                    required
                    value={pob}
                    onChange={(e) => setPob(e.target.value)}
                    placeholder="Varanasi, UP"
                    className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-surface-container-low/40 border border-outline-variant rounded-lg text-xs focus:border-secondary focus:bg-surface focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Button + Notice Side-by-Side */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
              <div className="sm:col-span-5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[48px] px-6 py-3 bg-[#e8751a] hover:bg-[#d06410] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {loading
                      ? isHindi
                        ? "गणना जारी..."
                        : "COMPUTING..."
                      : isHindi
                      ? "जन्मपत्रिका गणना करें"
                      : "COMPUTE JANAMPATRI"}
                  </span>
                </button>
              </div>

              <div className="sm:col-span-7">
                <div className="p-3 rounded-lg bg-sky-50/80 border border-sky-200 text-sky-900 text-xs flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-sky-600 shrink-0" />
                  <p className="leading-tight text-[11px]">
                    {isHindi
                      ? "कृपया सुनिश्चित करें कि जन्म समय एवं स्थान सटीक हैं। सूक्ष्म समय भेद से लग्न व ग्रह स्थिति में परिवर्तन हो सकता है।"
                      : "Please ensure the date, time and place are accurate. Even a small difference in time can change the ascendant and planetary positions."}
                  </p>
                </div>
              </div>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-error-container/20 border border-error text-error text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success State for Registered Kundli Request */}
          {orderCreated && (
            <div className="p-6 rounded-lg bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{isHindi ? "जन्मपत्रिका समीक्षा अनुरोध दर्ज" : "Kundli Request Registered"}</span>
              </div>
              <p className="text-xs">
                {isHindi ? "आदेश संदर्भ संख्या:" : "Tracking Token:"}{" "}
                <strong className="font-mono text-emerald-900 text-base">{orderCreated}</strong>
              </p>
              <p className="text-xs text-emerald-800">
                {isHindi
                  ? "आपकी जन्मपत्रिका विवरण केंद्र के वरिष्ठ दैवज्ञ के संज्ञान में दर्ज कर ली गई है।"
                  : "Your birth coordinates have been registered for full Janampatri preparation."}
              </p>
              <div className="pt-2">
                <Link
                  href="/track"
                  className="inline-flex items-center justify-center min-h-[44px] px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors"
                >
                  {isHindi ? "आदेश स्थिति ट्रैक करें →" : "Track Order Status →"}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): What You Will Get */}
        <div className="lg:col-span-4 space-y-4 bg-surface rounded-xl border border-outline-variant/60 p-5 sm:p-6 text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2 className="font-serif text-base font-bold text-secondary">
                {isHindi ? "आपको क्या प्राप्त होगा" : "What You Will Get"}
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {isHindi
                ? "आपकी जन्मपत्रिका विशुद्ध वैदिक दृग्गणित एवं सूर्य सिद्धान्त आधारित गणितीय तालिकाओं से तैयार की जाएगी।"
                : "Your Janampatri will be generated using precise Vedic ephemeris and traditional calculation methods."}
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-outline-variant/40">
            {featuresWhatYouGet.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.titleEn}
                  className="p-2.5 rounded-lg bg-surface-container-low/40 border border-outline-variant/30 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-secondary">
                        {isHindi ? item.titleHi : item.titleEn}
                      </div>
                      <p className="text-[11px] text-on-surface-variant truncate">
                        {isHindi ? item.descHi : item.descEn}
                      </p>
                    </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Feature Card: Why Use Our Chart Computation? */}
      <div className="bg-surface rounded-xl border border-outline-variant/50 p-6 sm:p-7 space-y-5 text-left">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-base sm:text-lg font-bold text-secondary">
            {isHindi ? "हमारी कुण्डली गणना क्यों चुनें?" : "Why Use Our Chart Computation?"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Feature 1 */}
          <div className="p-3.5 rounded-lg bg-surface-container-low/40 border border-outline-variant/30 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-secondary">
                {isHindi ? "प्रामाणिक वैदिक तालिकाएं" : "Authentic Vedic Tables"}
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                {isHindi
                  ? "शास्त्रीय खगोलीय सिद्धान्त एवं पंचांग तालिकाओं पर आधारित"
                  : "Based on classical astronomical ephemeris and siddhanta."}
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-3.5 rounded-lg bg-surface-container-low/40 border border-outline-variant/30 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-secondary">
                {isHindi ? "सटीक गणितीय गणना" : "Accurate Calculations"}
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                {isHindi
                  ? "ग्रहों के सूक्ष्म भोगांश एवं शुद्ध लग्न निर्धारण"
                  : "Precise planetary positions and ascendant determination."}
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-3.5 rounded-lg bg-surface-container-low/40 border border-outline-variant/30 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-secondary">
                {isHindi ? "पारम्परिक चक्र स्वरूप" : "Traditional Formats"}
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                {isHindi
                  ? "वैदिक परम्परा अनुसार लग्न, नवांश एवं षोडशवर्ग चक्र"
                  : "Rashi, Navamsa and divisional charts as per Vedic tradition."}
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-3.5 rounded-lg bg-surface-container-low/40 border border-outline-variant/30 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-secondary">
                {isHindi ? "दैवज्ञों द्वारा विश्वसनीय" : "Trusted by Astrologers"}
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                {isHindi
                  ? "शोध एवं फलादेश हेतु दैवज्ञों द्वारा प्रयुक्त प्रामाणिक पद्धति"
                  : "Used by professionals for research and consultations."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Display (Appears when calculated) */}
      {result && (
        <div className="bg-surface rounded-xl p-6 sm:p-8 border-2 border-secondary/30 space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/40">
            <div>
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest block">
                {isHindi ? "गणित गणना परिणाम" : "Computed Vedic Ephemeris"}
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-secondary mt-0.5">
                {name || (isHindi ? "जातक कुण्डली" : "Jataka Horoscope")}
              </h2>
            </div>
            <div className="flex flex-col sm:items-end gap-1">
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded text-xs font-bold uppercase tracking-wider self-start sm:self-auto">
                Demo
              </span>
              <span className="text-[11px] font-medium text-amber-900">
                Sample output, not a real calculation • नमूना परिणाम, वास्तविक गणना नहीं
              </span>
            </div>
          </div>

          {/* Fundamental Astrological Elements */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
              <span className="text-[10px] uppercase text-outline font-semibold block">
                {isHindi ? "लग्न (Ascendant)" : "Ascendant (Lagna)"}
              </span>
              <span className="font-serif font-bold text-secondary text-base">
                {result.ascendant}
              </span>
              <span className="text-outline text-[11px] block">Lord: {result.ascendantLord}</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
              <span className="text-[10px] uppercase text-outline font-semibold block">
                {isHindi ? "चन्द्र राशि (Moon Sign)" : "Moon Sign (Rashi)"}
              </span>
              <span className="font-serif font-bold text-secondary text-base">
                {result.moonRashi}
              </span>
              <span className="text-outline text-[11px] block">Sun: {result.sunSign}</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
              <span className="text-[10px] uppercase text-outline font-semibold block">
                {isHindi ? "जन्म नक्षत्र (Nakshatra)" : "Birth Star"}
              </span>
              <span className="font-serif font-bold text-secondary text-base">
                {result.nakshatra}
              </span>
              <span className="text-outline text-[11px] block">Pada / चरण: {result.charan}</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
              <span className="text-[10px] uppercase text-outline font-semibold block">
                {isHindi ? "वर्तमान महादशा" : "Current Mahadasha"}
              </span>
              <span className="font-serif font-bold text-primary text-base">
                {result.vimshottariDasha.currentMahadasha}
              </span>
              <span className="text-outline text-[11px] block">Ends: {result.vimshottariDasha.endsAt}</span>
            </div>
          </div>

          {/* Planetary Longitudes Table */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-bold text-secondary">
              {isHindi ? "नवग्रह स्पष्ट भोगांश (९ ग्रह)" : "Planetary Degrees & House Placements"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-outline-variant/40">
                <thead className="bg-surface-container text-secondary font-bold">
                  <tr>
                    <th className="p-2.5 text-left">Graha (Planet)</th>
                    <th className="p-2.5 text-left">Rashi (Sign)</th>
                    <th className="p-2.5 text-left">Degrees</th>
                    <th className="p-2.5 text-center">House</th>
                    <th className="p-2.5 text-center">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {result.planetaryPositions.map((planet) => (
                    <tr key={planet.planet} className="hover:bg-surface-container-low">
                      <td className="p-2.5 font-bold text-on-surface">
                        {planet.planet}
                      </td>
                      <td className="p-2.5 text-secondary font-semibold">{planet.rashi}</td>
                      <td className="p-2.5 font-mono text-outline">{planet.degree}</td>
                      <td className="p-2.5 text-center font-bold text-secondary">{planet.house}</td>
                      <td className="p-2.5 text-center">
                        {planet.isRetrograde ? (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] font-bold">
                            वक्र (R)
                          </span>
                        ) : (
                          <span className="text-outline text-[10px]">मार्गी (Direct)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order / Full Analysis Callout */}
          <div className="pt-4 border-t border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-[11px] text-on-surface-variant max-w-md">
              * {result.sampleDisclaimer}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/booking?service=complete-janampatri&name=${encodeURIComponent(
                  name
                )}&dob=${dob}&tob=${tob}&pob=${encodeURIComponent(pob)}`}
                className="min-h-[44px] px-6 py-2.5 bg-[#e8751a] hover:bg-[#d06410] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 text-center shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isHindi ? "सम्पूर्ण जन्मपत्रिका मँगवाएं" : "Order Full Janampatri"}</span>
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
