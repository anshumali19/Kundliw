"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export interface DateStripData {
  tithiEn: string;
  tithiHi: string;
  pakshaEn: string;
  pakshaHi: string;
  masaEn: string;
  masaHi: string;
  samvat: number;
}

const DAYS_HI = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_HI = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
const DAYS_SHORT_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const pad = (n: number) => String(n).padStart(2, "0");

/** India time (IST) from any clock, without depending on the visitor's time zone. */
function istParts(now: Date) {
  const t = new Date(now.getTime() + 330 * 60000);
  const h = t.getUTCHours();
  return {
    h12: h % 12 || 12,
    m: t.getUTCMinutes(),
    s: t.getUTCSeconds(),
    ap: h >= 12 ? "PM" : "AM",
    weekday: t.getUTCDay(),
    day: t.getUTCDate(),
    month: t.getUTCMonth(),
    year: t.getUTCFullYear(),
  };
}

/**
 * One line with everything: time, day, date, month, paksha, tithi and Vikram Samvat.
 * Dark maroon background with cream text keeps it clear on every screen.
 */
export function DateStrip({ data, isHindi }: { data: DateStripData | null; isHindi: boolean }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const first = setTimeout(() => setNow(new Date()), 0);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const p = now ? istParts(now) : null;
  const sep = <span aria-hidden="true" className="text-gold/60">|</span>;

  return (
    <div
      className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto whitespace-nowrap min-w-0 text-[11px] sm:text-xs font-semibold text-on-maroon [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label={isHindi ? "आज की तिथि और समय" : "Today's date and time"}
    >
      <span className="inline-flex items-center gap-1 tabular-nums shrink-0">
        <Clock className="w-3 h-3 text-gold" aria-hidden="true" />
        {p ? `${pad(p.h12)}:${pad(p.m)}:${pad(p.s)} ${p.ap}` : "--:--:--"}
      </span>
      {sep}
      <span className="shrink-0">
        {p ? (isHindi ? DAYS_HI[p.weekday] : <><span className="sm:hidden">{DAYS_SHORT_EN[p.weekday]}</span><span className="hidden sm:inline">{DAYS_EN[p.weekday]}</span></>) : ""}
      </span>
      <span className="shrink-0">
        {p ? (isHindi ? `${p.day} ${MONTHS_HI[p.month]} ${p.year}` : <><span className="sm:hidden">{`${p.day} ${MONTHS_SHORT_EN[p.month]} ${p.year}`}</span><span className="hidden sm:inline">{`${p.day} ${MONTHS_EN[p.month]} ${p.year}`}</span></>) : ""}
      </span>
      {data && (
        <>
          {sep}
          <span className="shrink-0">{isHindi ? data.pakshaHi : data.pakshaEn}</span>
          <span className="shrink-0 text-gold">{isHindi ? data.tithiHi : data.tithiEn}</span>
          <span className="shrink-0">{isHindi ? data.masaHi : data.masaEn}</span>
          {sep}
          <span className="shrink-0">
            {isHindi ? `विक्रम संवत ${data.samvat}` : `Vikram Samvat ${data.samvat}`}
          </span>
        </>
      )}
    </div>
  );
}
