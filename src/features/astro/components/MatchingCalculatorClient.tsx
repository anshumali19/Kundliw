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
  AlertTriangle,
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

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 text-left space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {isHindi ? "अष्टकूट गुण मिलान" : "Vedic Ashtakoot Gun Milan"}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            Demo
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary mt-1">
          {isHindi ? "विवाह कुण्डली एवं मेलापक विचार" : "Matrimonial Compatibility & Horoscope Milan"}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          {isHindi
            ? "वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट एवं नाड़ी के ३६ गुणों पर आधारित शास्त्रीय मिलान।"
            : "Complete 36-Guna Ashtakoot mathematical compatibility assessment including Manglik and Nadi Dosha review."}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-surface rounded-lg p-6 sm:p-8 border-2 border-secondary/30 shadow-sm space-y-6">
        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Boy Side */}
            <div className="space-y-4 p-4 rounded-lg bg-surface-container-low/50 border border-outline-variant/30">
              <div className="border-b border-outline-variant/30 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {isHindi ? "वर विवरण (Boy Details)" : "Groom / Boy Details"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "वर का नाम *" : "Boy's Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={boyName}
                  onChange={(e) => setBoyName(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                    {isHindi ? "जन्म तिथि *" : "Date of Birth *"}
                  </label>
                  <input
                    type="date"
                    required
                    value={boyDob}
                    onChange={(e) => setBoyDob(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                    {isHindi ? "जन्म समय *" : "Time of Birth *"}
                  </label>
                  <input
                    type="time"
                    required
                    value={boyTob}
                    onChange={(e) => setBoyTob(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "जन्म स्थान *" : "Birth Place *"}
                </label>
                <input
                  type="text"
                  required
                  value={boyPob}
                  onChange={(e) => setBoyPob(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                />
              </div>
            </div>

            {/* Girl Side */}
            <div className="space-y-4 p-4 rounded-lg bg-surface-container-low/50 border border-outline-variant/30">
              <div className="border-b border-outline-variant/30 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {isHindi ? "कन्या विवरण (Girl Details)" : "Bride / Girl Details"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "कन्या का नाम *" : "Girl's Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={girlName}
                  onChange={(e) => setGirlName(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                    {isHindi ? "जन्म तिथि *" : "Date of Birth *"}
                  </label>
                  <input
                    type="date"
                    required
                    value={girlDob}
                    onChange={(e) => setGirlDob(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                    {isHindi ? "जन्म समय *" : "Time of Birth *"}
                  </label>
                  <input
                    type="time"
                    required
                    value={girlTob}
                    onChange={(e) => setGirlTob(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  {isHindi ? "जन्म स्थान *" : "Birth Place *"}
                </label>
                <input
                  type="text"
                  required
                  value={girlPob}
                  onChange={(e) => setGirlPob(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] px-6 py-2.5 bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>
              {loading
                ? isHindi
                  ? "गुण मिलान जारी..."
                  : "Calculating Matching..."
                : isHindi
                ? "अष्टकूट गुण मिलान करें"
                : "Calculate Ashtakoot Gun Milan"}
            </span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded bg-error-container/20 border border-error text-error text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

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
              : "Your matrimonial match request has been filed for senior Daivajna review."}
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
        <div className="bg-surface rounded-lg p-6 sm:p-8 border-2 border-secondary/30 shadow-sm space-y-6">
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
                  <span className="text-xs text-on-surface-variant block">{isHindi ? "कुल प्राप्त गुण" : "Total Score"}</span>
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
                {result.nadiDosha ? (isHindi ? "दोष उपस्थित" : "Dosha Present") : (isHindi ? "दोष रहित (शुभ)" : "Nadi Shuddha (Safe)")}
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

          {/* Upsell / Pandit Review actions */}
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
                className="min-h-[44px] px-6 py-2.5 bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isHindi ? "विस्तृत मेलापक परामर्श लें" : "Order Detailed Kendra Team Analysis"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                disabled={submittingOrder || Boolean(orderCreated)}
                onClick={handleSaveAsOrder}
                className="min-h-[44px] px-4 py-2.5 border border-secondary text-secondary hover:bg-secondary/10 font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
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
