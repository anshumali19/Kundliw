import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Megaphone, ArrowRight } from "lucide-react";

interface MarqueeStripProps {
  items?: Array<{
    id: string;
    textEn: string;
    textHi: string;
    speedSec?: number;
    fontSize?: number;
    bgColor?: string;
    textColor?: string;
  }>;
  position?: "TOP" | "BOTTOM";
}

export function MarqueeStrip({ items, position = "BOTTOM" }: MarqueeStripProps) {
  const tMarquee = useTranslations("marquee");
  const locale = useLocale();

  // Default fallback announcements from design if database items aren't passed
  const defaultItems = [
    {
      id: "1",
      textEn: "Special Notice: Registration open for Guru-Shani transit Maha-Yajna at Dashashwamedh Ghat",
      textHi: "विशेष सूचना: गुरु-शनि राशि परिवर्तन पर विशेष महायज्ञ पंजीकरण प्रारंभ, दशाश्वमेध घाट काशी",
    },
    {
      id: "2",
      textEn: "Surya Siddhanta Vivah & Griha Pravesh Muhurat Tables published for Samvat 2081",
      textHi: "शुद्ध सूर्य सिद्धान्त सम्मत ज्येष्ठ मास विवाह एवं गृह प्रवेश शुभ मुहूर्त तालिका प्रकाशित",
    },
    {
      id: "3",
      textEn: "Authentic Kashi Vishwanath Ephemeris daily ephemeris bulletin available",
      textHi: "दृग्गणित पंचांग आधारित दैनिक कालनिर्णय बुलेटिन उपलब्ध",
    },
  ];

  const displayList = items && items.length > 0 ? items : defaultItems;

  return (
    <div
      className={`w-full bg-secondary text-on-secondary py-2.5 overflow-hidden border-t border-primary/40 ${
        position === "TOP" ? "border-b border-t-0" : ""
      }`}
      role="region"
      aria-label="Auspicious Announcements"
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-3">
        {/* Badge */}
        <div className="flex items-center gap-1.5 shrink-0 bg-primary-container px-2.5 py-1 rounded text-on-primary text-[11px] font-bold uppercase tracking-wider">
          <Megaphone className="w-3.5 h-3.5" />
          <span>{tMarquee("badge")}</span>
        </div>

        {/* Ticker scroller */}
        <div className="relative overflow-hidden w-full flex items-center min-w-0 flex-1">
          <div className="whitespace-nowrap animate-marquee flex items-center gap-8 text-xs tracking-wide">
            {displayList.map((item, index) => {
              const text = locale === "hi" ? item.textHi : item.textEn;
              return (
                <span key={`${item.id}-${index}`} className="flex items-center gap-8">
                  <span>{text}</span>
                  <span className="text-tertiary-fixed font-bold">•</span>
                </span>
              );
            })}
            {/* Repeated for smooth infinite ticker */}
            {displayList.map((item, index) => {
              const text = locale === "hi" ? item.textHi : item.textEn;
              return (
                <span key={`${item.id}-repeat-${index}`} className="flex items-center gap-8" aria-hidden="true">
                  <span>{text}</span>
                  <span className="text-tertiary-fixed font-bold">•</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* CTA link */}
        <Link
          href="/services"
          className="shrink-0 hidden md:inline-flex items-center gap-1 text-xs uppercase tracking-wider text-tertiary-fixed hover:underline font-bold"
        >
          <span>{tMarquee("cta")}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
