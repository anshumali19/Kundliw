import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SubPageNav } from "@/components/layout/SubPageNav";
import { Link } from "@/i18n/routing";
import {
  Compass,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Calculator,
  Layers,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const isHindi = locale === "hi";
  return {
    title: isHindi
      ? "एस्ट्रोसेज फ्री कुण्डली सॉफ्टवेयर • महर्षि कणाद ज्योतिष केंद्र"
      : "AstroSage Free Kundli Software • Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "एस्ट्रोसेज निःशुल्क वैदिक कुण्डली सॉफ्टवेयर एवं ग्रह गणना संदर्भ।"
      : "Free AstroSage Vedic Kundli software integration and astronomical ephemeris reference.",
  };
}

export default async function AstroSagePage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const isHindi = locale === "hi";

  const settings = await prisma.adminSettings
    .findUnique({ where: { id: "default" } })
    .catch(() => null);

  const embedUrl =
    settings?.astrosageEmbedUrl || "https://www.astrosage.com/freekundli/";

  return (
    <div className="w-full flex flex-col text-on-surface text-left">
      {/* 1. Universal Back/Next Navigation Bar (#45) */}
      <SubPageNav
        breadcrumbs={[
          { label: isHindi ? "कुण्डली सेवाएँ" : "Kundli Tools", href: "/kundli" },
          { label: isHindi ? "एस्ट्रोसेज कुण्डली सॉफ्टवेयर" : "AstroSage Software" },
        ]}
        backHref="/kundli"
        backLabel={isHindi ? "इन-हाउस कुण्डली" : "In-House Kundli"}
        nextHref="/kundli/matching"
        nextLabel={isHindi ? "कुण्डली मिलान" : "Kundli Matching"}
        locale={locale}
      />

      {/* 2. Top Header & Explanatory Guidance */}
      <section className="w-full bg-surface border-b border-outline-variant/30 py-8 px-4 sm:px-8 lg:px-12 text-left">
        <div className="max-w-4xl space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold">
            <Compass className="w-4 h-4" />
            <span>{isHindi ? "निःशुल्क वैदिक सॉफ्टवेयर एकीकरण (#28)" : "Free Vedic Software Integration (#28)"}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
            {isHindi ? "एस्ट्रोसेज निःशुल्क कुण्डली सॉफ्टवेयर" : "AstroSage Free Kundli Software"}
          </h1>

          <p className="text-sm text-on-surface-variant leading-relaxed">
            {isHindi
              ? "यह अनुभाग जातकों एवं विद्यार्थियों के संदर्भ हेतु प्रसिद्ध एस्ट्रोसेज निःशुल्क कुण्डली सॉफ्टवेयर को प्रस्तुत करता है। यह सुविधा बिना किसी सशुल्क एपीआई अथवा सदस्यता के पूर्णतः पारदर्शी रूप से उपलब्ध कराई गई है।"
              : "This module integrates the public AstroSage Free Kundli software for visitor and student reference. It operates without paid API subscriptions, offering immediate access to classical Vedic planetary positions and horoscopes."}
          </p>

          {/* Fallback Notice & Direct Action Buttons */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-on-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
            <div className="space-y-1">
              <div className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>{isHindi ? "सुरक्षित संदर्भ एवं लिंक-आउट सूचना" : "Safe Link-Out & Iframe Notice"}</span>
              </div>
              <p className="text-on-surface-variant text-[11px] leading-relaxed">
                {isHindi
                  ? "यदि आपके ब्राउज़र में सुरक्षा नीतियों के कारण एम्बेडेड फ्रेम लोड न हो, तो नीचे दिए गए बटन द्वारा सीधे नए विंडो में खोलें।"
                  : "If browser cross-origin frame policies prevent embedding on your device, use the direct portal link below."}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors font-semibold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <span>{isHindi ? "एस्ट्रोसेज पोर्टल पर खोलें" : "Open in AstroSage Portal"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <Link
                href="/kundli"
                className="px-3 py-2 rounded-xl border border-outline-variant bg-surface text-secondary hover:bg-surface-container transition-colors font-semibold text-xs flex items-center gap-1"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{isHindi ? "केंद्र कैलकुलेटर" : "Kendra Tool"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Embedded Iframe Container with Link-Out Fallback */}
      <section className="w-full py-8 px-4 sm:px-8 lg:px-12 bg-surface-container-low/40">
        <div className="w-full max-w-7xl mx-auto rounded-2xl border border-outline-variant/50 bg-surface shadow-sm overflow-hidden flex flex-col">
          {/* Iframe Frame Header */}
          <div className="bg-surface-container px-4 py-3 border-b border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span className="truncate max-w-xs sm:max-w-md">{embedUrl}</span>
            </div>

            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-semibold flex items-center gap-1 shrink-0"
            >
              <span>{isHindi ? "पूर्ण स्क्रीन पर खोलें" : "Open Full Screen"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* The Embed Frame */}
          <div className="relative w-full h-[700px] sm:h-[800px] bg-surface">
            <iframe
              src={embedUrl}
              title="AstroSage Free Kundli Software"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              loading="lazy"
            />
          </div>

          {/* Iframe Frame Footer */}
          <div className="bg-surface-container-low px-4 py-3 border-t border-outline-variant/30 text-center text-xs text-on-surface-variant">
            <p>
              {isHindi
                ? "© एस्ट्रोसेज (AstroSage) सर्वाधिकार सुरक्षित। महर्षि कणाद ज्योतिष केंद्र इस निःशुल्क साधन को केवल जनसुविधा हेतु प्रस्तुत करता है।"
                : "© AstroSage - All rights reserved. Maharshi Kanad Jyotish Kendra provides this embed solely for visitor convenience."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
