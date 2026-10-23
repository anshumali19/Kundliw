"use client";

import React, { useState } from "react";
import { KundliResult } from "@/lib/astro/types";
import { Link } from "@/i18n/routing";
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
} from "lucide-react";

interface KundliCalculatorClientProps {
  locale: string;
}

export function KundliCalculatorClient({ locale }: KundliCalculatorClientProps) {
  const isHindi = locale === "hi";

  const [name, setName] = useState("");
  const [gender, setGender] = useState("MALE");
  const [dob, setDob] = useState("1995-05-14");
  const [tob, setTob] = useState("08:30");
  const [pob, setPob] = useState("Varanasi, UP");

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

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 text-left space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {isHindi ? "विशुद्ध गणितीय कुण्डली" : "Vedic Ephemeris Computation"}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            Demo
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary mt-1">
          {isHindi ? "जन्मपत्रिका एवं ग्रह स्पष्ट गणना" : "Vedic Janampatri & Chart Computation"}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          {isHindi
            ? "सूर्य सिद्धान्त एवं दृग्गणित पर आधारित शुद्ध लग्न, राशि, नक्षत्र एवं ग्रह-स्थिति विचार।"
            : "Planetary degrees, ascendant, and Vimshottari Mahadasha based on authentic mathematical tables."}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-surface rounded-lg p-6 sm:p-8 border-2 border-secondary/30 shadow-sm space-y-4">
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                {isHindi ? "जातक नाम *" : "Full Name *"}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aditya Sharma"
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                {isHindi ? "लिंग *" : "Gender *"}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              >
                <option value="MALE">{isHindi ? "पुरुष (Male)" : "Male"}</option>
                <option value="FEMALE">{isHindi ? "महिला (Female)" : "Female"}</option>
                <option value="OTHER">{isHindi ? "अन्य (Other)" : "Other"}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                {isHindi ? "जन्म तिथि *" : "Date of Birth *"}
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                {isHindi ? "जन्म समय (२४ घंटे) *" : "Time of Birth (HH:mm) *"}
              </label>
              <input
                type="time"
                required
                value={tob}
                onChange={(e) => setTob(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                {isHindi ? "जन्म स्थान (शहर / राज्य) *" : "Birth Place (City, Country) *"}
              </label>
              <input
                type="text"
                required
                value={pob}
                onChange={(e) => setPob(e.target.value)}
                placeholder="e.g. Varanasi, Uttar Pradesh"
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] px-6 py-2.5 bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? (isHindi ? "गणना जारी..." : "Computing...") : (isHindi ? "कुण्डली गणना करें" : "Compute Janampatri")}</span>
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
            <span>{isHindi ? "आदेश सफलतापूर्वक दर्ज" : "Order Request Registered"}</span>
          </div>
          <p className="text-xs">
            {isHindi ? "आदेश संदर्भ संख्या:" : "Tracking Token:"}{" "}
            <strong className="font-mono text-emerald-900">{orderCreated}</strong>
          </p>
          <p className="text-xs text-emerald-800">
            {isHindi
              ? "आपकी कुण्डली निर्माण का अनुरोध दैवज्ञ समीक्षा हेतु केंद्र ट्रैकर में दर्ज कर लिया गया है।"
              : "Your request has been filed in the Kendra order tracker. Pandits will examine your natal chart."}
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

      {/* Results Display with Demo Chip */}
      {result && (
        <div className="bg-surface rounded-lg p-6 sm:p-8 border-2 border-secondary/30 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/40">
            <div>
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest block">
                {isHindi ? "गणना परिणाम" : "Ephemeris Output"}
              </span>
              <h2 className="font-serif text-xl font-bold text-secondary mt-0.5">
                {name} • {result.ascendant}
              </h2>
            </div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded text-xs font-bold uppercase tracking-wider self-start sm:self-auto">
              Demo Calculation
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded bg-surface-container-low border border-outline-variant/30">
              <span className="text-[10px] uppercase text-outline font-semibold block">
                {isHindi ? "लग्न (Ascendant)" : "Ascendant"}
              </span>
              <span className="font-bold text-secondary text-sm">{result.ascendant}</span>
            </div>
            <div className="p-3 rounded bg-surface-container-low border border-outline-variant/30">
              <span className="text-[10px] uppercase text-outline font-semibold block">
                {isHindi ? "चन्द्र राशि (Moon Sign)" : "Moon Sign"}
              </span>
              <span className="font-bold text-secondary text-sm">{result.moonRashi}</span>
            </div>
            <div className="p-3 rounded bg-surface-container-low border border-outline-variant/30">
              <span className="text-[10px] uppercase text-outline font-semibold block">
                {isHindi ? "नक्षत्र (Nakshatra)" : "Nakshatra"}
              </span>
              <span className="font-bold text-secondary text-sm">{result.nakshatra} (पाद {result.charan})</span>
            </div>
            <div className="p-3 rounded bg-surface-container-low border border-outline-variant/30">
              <span className="text-[10px] uppercase text-outline font-semibold block">
                {isHindi ? "वर्तमान महादशा" : "Vimshottari Dasha"}
              </span>
              <span className="font-bold text-primary text-sm">{result.vimshottariDasha.currentMahadasha}</span>
            </div>
          </div>

          {/* Planetary Table */}
          <div>
            <h3 className="font-serif text-sm font-bold text-secondary mb-2">
              {isHindi ? "ग्रह स्पष्ट तालिका (Planetary Degrees)" : "Planetary Positions & Houses"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-outline-variant/40">
                <thead className="bg-surface-container text-secondary font-bold">
                  <tr>
                    <th className="p-2.5 text-left">Planet</th>
                    <th className="p-2.5 text-left">Rashi</th>
                    <th className="p-2.5 text-left">Lord</th>
                    <th className="p-2.5 text-left">Degrees</th>
                    <th className="p-2.5 text-center">House (भाव)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {result.planetaryPositions.map((pos) => (
                    <tr key={pos.planet} className="hover:bg-surface-container-low">
                      <td className="p-2.5 font-bold text-on-surface">{pos.planet}</td>
                      <td className="p-2.5">{pos.rashi}</td>
                      <td className="p-2.5 text-on-surface-variant">{pos.rashiLord}</td>
                      <td className="p-2.5 font-mono">{pos.degree}</td>
                      <td className="p-2.5 text-center font-bold text-primary">{pos.house}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action to convert into official Pandit Order */}
          <div className="pt-4 border-t border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-[11px] text-on-surface-variant">
              * {result.sampleDisclaimer}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/booking?service=kundli-dossier&name=${encodeURIComponent(name)}&gender=${gender}&dob=${dob}&tob=${tob}&pob=${encodeURIComponent(pob)}`}
                className="min-h-[44px] px-6 py-2.5 bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isHindi ? "विस्तृत दैवज्ञ कुण्डली विश्लेषण परामर्श लें" : "Order Detailed Acharya Analysis"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                disabled={submittingOrder || Boolean(orderCreated)}
                onClick={handleSaveAsOrder}
                className="min-h-[44px] px-4 py-2.5 border border-secondary text-secondary hover:bg-secondary/10 font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span>{submittingOrder ? (isHindi ? "पंजीकरण जारी..." : "Submitting...") : (isHindi ? "नि:शुल्क समीक्षा अनुरोध भेजें" : "Submit Free Review Request")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
