"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, Sparkles } from "lucide-react";

interface LiveClockEphemerisProps {
  tithi?: string | null;
}

export function LiveClockEphemeris({ tithi }: LiveClockEphemerisProps) {
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  const [dayStr, setDayStr] = useState<string>("");

  useEffect(() => {
    function updateClock() {
      const now = new Date();

      // Time in Indian Standard Time (IST)
      const istTime = now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      // Date formatted in Indian locale
      const istDate = now.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // Day of week (Dual English / Hindi)
      const dayEn = now.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
      });

      const dayHindiMap: Record<string, string> = {
        Sunday: "रविवार",
        Monday: "सोमवार",
        Tuesday: "मंगलवार",
        Wednesday: "बुधवार",
        Thursday: "गुरुवार",
        Friday: "शुक्रवार",
        Saturday: "शनिवार",
      };

      const dayHi = dayHindiMap[dayEn] || dayEn;

      setTimeStr(`${istTime} IST`);
      setDateStr(istDate);
      setDayStr(`${dayEn} • ${dayHi}`);
    }

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      aria-label="Live Vedic Ephemeris Clock"
      className="inline-flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-3.5 py-2 bg-surface-container-high rounded border border-secondary/30 text-xs text-on-surface-variant font-medium mb-4 self-start max-w-full overflow-hidden"
    >
      {/* Live IST Clock */}
      <div className="flex items-center gap-1.5 text-secondary font-bold font-mono">
        <Clock className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />
        <span>{timeStr || "--:--:-- IST"}</span>
      </div>

      <span className="hidden sm:inline-block w-px h-3.5 bg-outline-variant/60"></span>

      {/* Date & Day of Week */}
      <div className="flex items-center gap-1.5 text-on-surface">
        <Calendar className="w-3.5 h-3.5 text-secondary shrink-0" />
        <span className="font-semibold">{dayStr}</span>
        {dateStr && <span className="text-outline hidden md:inline">({dateStr})</span>}
      </div>

      {/* Tithi from Astro Adapter (Hidden if unavailable or null) */}
      {tithi && (
        <>
          <span className="hidden sm:inline-block w-px h-3.5 bg-outline-variant/60"></span>
          <div className="flex items-center gap-1.5 text-primary font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-tertiary shrink-0" />
            <span>तिथि: {tithi}</span>
          </div>
        </>
      )}
    </div>
  );
}
