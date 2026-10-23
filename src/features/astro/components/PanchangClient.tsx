"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { PanchangResult } from "@/lib/astro/types";
import {
  Calendar,
  Sun,
  Moon,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Flame,
} from "lucide-react";

interface PanchangClientProps {
  initialPanchang: PanchangResult | null;
  locale: string;
}

export function PanchangClient({ initialPanchang, locale }: PanchangClientProps) {
  const isHindi = locale === "hi";

  const [date, setDate] = useState(
    initialPanchang?.date || new Date().toISOString().slice(0, 10)
  );
  const [panchang, setPanchang] = useState<PanchangResult | null>(initialPanchang);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = async (newDate: string) => {
    setDate(newDate);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/astro/panchang?date=${newDate}`);
      const data = await res.json();
      if (res.ok && data.panchang) {
        setPanchang(data.panchang);
      } else {
        setError(data.error || "Panchang details unavailable for this date");
      }
    } catch {
      setError("Network error fetching Panchang details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 text-left space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {isHindi ? "दैनिक दृग्गणित पंचांग" : "Canonical Vedic Ephemeris"}
          </span>
          {panchang?.isDemo && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
              Demo
            </span>
          )}
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary mt-1">
          {isHindi ? "काशी दैनिक पंचांग एवं कालनिर्णय" : "Varanasi Vedic Daily Almanac (Panchang)"}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          {isHindi
            ? "सूर्य सिद्धान्त एवं दृग्गणित पर आधारित तिथि, नक्षत्र, योग, करण एवं शुभ-अशुभ मुहूर्त।"
            : "Mathematical planetary ephemeris computed for Varanasi (Dashashwamedh Ghat coordinates)."}
        </p>
      </div>

      {/* Date & City Selector Bar */}
      <div className="bg-surface rounded-lg p-4 sm:p-6 border border-outline-variant/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-surface-container text-secondary">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-outline block">
              {isHindi ? "पंचांग तिथि चयन" : "Select Date"}
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="min-h-[44px] px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded text-xs font-medium focus:border-secondary focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <span>Varanasi, UP (25.3176° N, 82.9739° E) • IST (UTC+05:30)</span>
        </div>
      </div>

      {loading && (
        <div className="p-6 text-center text-xs text-outline">
          {isHindi ? "पंचांग गणना की जा रही है..." : "Computing Vedic ephemeris..."}
        </div>
      )}

      {error && (
        <div className="p-4 rounded bg-error-container/20 border border-error text-error text-xs">
          {error}
        </div>
      )}

      {panchang && !loading && (
        <div className="space-y-6">
          {/* Top Summary Banner */}
          <div className="p-6 rounded-lg bg-surface border-2 border-secondary/30 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/30">
              <div>
                <span className="text-[10px] font-mono text-outline block">
                  {panchang.date} • {panchang.vaar}
                </span>
                <h2 className="font-serif text-xl font-bold text-secondary mt-0.5">
                  {panchang.samvat}
                </h2>
              </div>
              {panchang.isDemo && (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded text-xs font-bold uppercase tracking-wider self-start sm:self-auto">
                  Demo Ephemeris
                </span>
              )}
            </div>

            {/* Panchang 5 Limbs (पंच-अंग) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded bg-surface-container-low border border-outline-variant/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-outline block">
                  १. {isHindi ? "तिथि" : "Tithi"}
                </span>
                <span className="font-bold text-secondary text-sm block">{panchang.tithi}</span>
                <span className="text-[10px] text-on-surface-variant">
                  {isHindi ? "समाप्ति:" : "Ends:"} {panchang.tithiEndTime}
                </span>
              </div>

              <div className="p-3 rounded bg-surface-container-low border border-outline-variant/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-outline block">
                  २. {isHindi ? "वार (दिवस)" : "Vaar (Day)"}
                </span>
                <span className="font-bold text-secondary text-sm block">{panchang.vaar}</span>
                <span className="text-[10px] text-on-surface-variant">{panchang.paksha}</span>
              </div>

              <div className="p-3 rounded bg-surface-container-low border border-outline-variant/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-outline block">
                  ३. {isHindi ? "नक्षत्र" : "Nakshatra"}
                </span>
                <span className="font-bold text-secondary text-sm block">{panchang.nakshatra}</span>
                <span className="text-[10px] text-on-surface-variant">सूर्य सिद्धान्त</span>
              </div>

              <div className="p-3 rounded bg-surface-container-low border border-outline-variant/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-outline block">
                  ४. {isHindi ? "योग" : "Yoga"}
                </span>
                <span className="font-bold text-secondary text-sm block">{panchang.yoga}</span>
                <span className="text-[10px] text-emerald-700 font-semibold">शुभ योग</span>
              </div>

              <div className="p-3 rounded bg-surface-container-low border border-outline-variant/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-outline block">
                  ५. {isHindi ? "करण" : "Karana"}
                </span>
                <span className="font-bold text-secondary text-sm block">{panchang.karana}</span>
                <span className="text-[10px] text-on-surface-variant">चतुष्पाद</span>
              </div>
            </div>
          </div>

          {/* Muhurats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auspicious Muhurats */}
            <div className="bg-surface rounded-lg p-6 border border-emerald-300 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-emerald-200">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif text-base font-bold text-emerald-950">
                  {isHindi ? "शुभ मुहूर्त विचार" : "Auspicious Timings (Shubh Muhurat)"}
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-900 block">
                      {isHindi ? "अभिजित मुहूर्त" : "Abhijit Muhurat"}
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      {isHindi ? "सर्व कार्य सिद्धिदायक" : "Universal Auspicious Window"}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-emerald-950">
                    {panchang.abhijitMuhurat}
                  </span>
                </div>

                <div className="p-3 rounded bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-900 block">
                      {isHindi ? "सूर्योदय काल" : "Sunrise (Suryodaya)"}
                    </span>
                    <span className="text-[11px] text-emerald-800">Varanasi Local Time</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-emerald-950">
                    {panchang.sunrise}
                  </span>
                </div>
              </div>
            </div>

            {/* Inauspicious Periods */}
            <div className="bg-surface rounded-lg p-6 border border-amber-300 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif text-base font-bold text-amber-950">
                  {isHindi ? "अशुभ काल (वर्जित समय)" : "Inauspicious Windows (Varjya)"}
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-900 block">
                      {isHindi ? "राहु काल" : "Rahu Kaal"}
                    </span>
                    <span className="text-[11px] text-amber-800">
                      {isHindi ? "नवीन कार्य शुभारंभ वर्जित" : "Avoid starting major ventures"}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-amber-950">
                    {panchang.rahuKaal}
                  </span>
                </div>

                <div className="p-3 rounded bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-900 block">
                      {isHindi ? "सूर्यास्त काल" : "Sunset (Suryasta)"}
                    </span>
                    <span className="text-[11px] text-amber-800">Sandhya Sandhi</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-amber-950">
                    {panchang.sunset}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Upsell to Book Muhurat / Consultation */}
          <div className="p-6 rounded-lg bg-surface border-2 border-secondary/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest block">
                {isHindi ? "विशेष मुहूर्त चयन" : "Personalized Muhurat Consultation"}
              </span>
              <h3 className="font-serif text-lg font-bold text-secondary">
                {isHindi
                  ? "विवाह, गृह प्रवेश अथवा व्यापार उद्घाटन हेतु शुद्ध लग्न शोधन"
                  : "Calculate Exact Auspicious Lagna for Marriage, Griha Pravesh or Business"}
              </h3>
              <p className="text-xs text-on-surface-variant">
                {isHindi
                  ? "वरिष्ठ दैवज्ञ आपकी व्यक्तिगत कुण्डली के अनुसार त्रिबल शुद्धि विचार करेंगे।"
                  : "Senior Acharyas evaluate Tribala Shuddhi according to your natal chart coordinates."}
              </p>
            </div>

            <Link
              href="/booking?service=complete-janampatri"
              className="min-h-[44px] px-6 py-2.5 bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isHindi ? "मुहूर्त परामर्श बुक करें" : "Book Muhurat Session"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
