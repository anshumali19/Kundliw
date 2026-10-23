import React from "react";
import { Link } from "@/i18n/routing";
import { PanchangResult } from "@/lib/astro/types";
import { Calendar, Clock, Sun, Moon, ArrowRight, MapPin } from "lucide-react";

interface PanchangWidgetProps {
  panchang: PanchangResult | null;
  locale: string;
}

export function PanchangWidget({ panchang, locale }: PanchangWidgetProps) {
  const isHindi = locale === "hi";

  if (!panchang) {
    // Neutral fallback when provider is not configured or unavailable
    return (
      <div className="w-full bg-surface-container-high border-b border-secondary/20 py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-on-surface-variant text-left">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-serif font-bold text-secondary">
              {isHindi ? "दैनिक पंचांग" : "Daily Almanac"}
            </span>
            <span className="text-outline-variant">•</span>
            <span>{new Date().toLocaleDateString(isHindi ? "hi-IN" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-1.5 text-outline">
            <MapPin className="w-3 h-3 text-primary" />
            <span>Varanasi (25.3176° N, 82.9739° E)</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface-container-high border-b border-secondary/30 py-2 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
        {/* Left: Tithi & Nakshatra */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-secondary font-serif">
            <Sun className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{panchang.vaar}</span>
          </div>

          <span className="text-outline-variant">•</span>

          <span className="font-medium text-on-surface">
            {panchang.tithi}
          </span>

          <span className="text-outline-variant">•</span>

          <span className="text-on-surface-variant">
            {panchang.nakshatra}
          </span>

          {panchang.isDemo && (
            <span className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                Demo
              </span>
              <span className="text-[10px] font-medium text-amber-900 hidden lg:inline">
                Sample output, not a real calculation • नमूना परिणाम, वास्तविक गणना नहीं
              </span>
            </span>
          )}
        </div>

        {/* Right: Abhijit & Link */}
        <div className="flex items-center gap-4 text-xs shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <Clock className="w-3 h-3 text-emerald-600" />
            <span className="font-semibold text-[11px]">
              {isHindi ? "अभिजित मुहूर्त:" : "Abhijit:"} {panchang.abhijitMuhurat}
            </span>
          </div>

          <Link
            href="/panchang"
            className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-bold text-[11px] uppercase tracking-wider"
          >
            <span>{isHindi ? "सम्पूर्ण पंचांग" : "Full Almanac"}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
