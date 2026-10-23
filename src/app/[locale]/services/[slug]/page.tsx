import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { PlanSelectorInteractive, PlanDTO } from "@/features/services/components/PlanSelectorInteractive";
import {
  Compass,
  BookOpen,
  Award,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Feather,
} from "lucide-react";

export const revalidate = 60;

interface ServiceDetailPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export default async function ServiceDetailPage({
  params: { locale, slug },
}: ServiceDetailPageProps) {
  const isHindi = locale === "hi";

  // Query service and active plans
  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      plans: {
        where: { isActive: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  // Call notFound() if service does not exist or is marked inactive
  if (!service || !service.isActive) {
    notFound();
  }

  const title = isHindi ? service.titleHi : service.titleEn;
  const tagline = isHindi ? service.taglineHi : service.taglineEn;
  const description = isHindi ? service.descriptionHi : service.descriptionEn;

  // Convert plans to PlanDTO
  const plansDto: PlanDTO[] = service.plans.map((p) => ({
    id: p.id,
    slug: p.slug,
    titleEn: p.titleEn,
    titleHi: p.titleHi,
    descriptionEn: p.descriptionEn,
    descriptionHi: p.descriptionHi,
    pricePaise: p.pricePaise,
    originalPricePaise: p.originalPricePaise,
    deliveryDays: p.deliveryDays,
    pages: p.pages,
    hasCall: p.hasCall,
    callDurationMinutes: p.callDurationMinutes,
    featuresEn: p.featuresEn,
    featuresHi: p.featuresHi,
    isPopular: p.isPopular,
    orderIndex: p.orderIndex,
  }));

  return (
    <div className="w-full flex flex-col text-on-surface text-left">
      {/* 1. Breadcrumbs Strip */}
      <section className="w-full bg-surface-container-low border-b border-secondary/20 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-on-surface-variant font-medium">
            <Link href="/" className="hover:text-primary transition-colors">
              {isHindi ? "मुख्य पृष्ठ" : "Home"}
            </Link>
            <span>/</span>
            <Link href="/services" className="hover:text-primary transition-colors">
              {isHindi ? "वैदिक सेवाएँ" : "Vedic Services"}
            </Link>
            <span>/</span>
            <span className="text-secondary font-bold">{title}</span>
          </div>

          <div className="flex items-center gap-2 bg-surface px-3 py-1 rounded border border-outline-variant/50 text-xs text-on-surface-variant">
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span>
              {isHindi
                ? "काशी विद्वत्परिषद् प्रामाणिक मानदण्ड"
                : "Varanasi Ephemeris Astronomical Standard"}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Asymmetric Showcase (70% Left Pane / 30% Right Spotlight) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-12 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Pane (70% ~ 8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-6 text-left">
            {/* Authenticity Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-container text-xs font-bold tracking-widest uppercase border border-secondary/30">
                <BookOpen className="w-3.5 h-3.5 mr-1 text-secondary" />
                {isHindi
                  ? "सिद्धांत ज्योतिष सम्मत • Authentic Parashari Jyotish"
                  : "Authentic Parashari & Jaimini Siddhanta"}
              </span>
              <span className="text-outline-variant">•</span>
              <span className="text-xs text-tertiary font-bold uppercase tracking-wider">
                {isHindi ? "दृग्गणित शुद्ध गणना" : "Drik-Ganita High Precision"}
              </span>
            </div>

            {/* Headline & Tagline */}
            <div className="space-y-1 text-left">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary tracking-tight">
                {title}
              </h1>
              {tagline && (
                <div className="text-base sm:text-lg text-primary font-medium">
                  {tagline}
                </div>
              )}
            </div>

            {/* Classical Sanskrit Quote Card */}
            <div className="p-5 bg-surface-container-low rounded border-l-4 border-l-secondary border border-outline-variant/40 text-left">
              <div className="font-serif text-lg italic text-secondary font-bold">
                ॥ ग्रहाधीनं जगत्सर्वं ग्रहाधीनाः नराधिपाः ॥
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                “The entire universe is governed by cosmic celestial forces; even monarchs and sovereigns are subject to planetary laws.”
                <span className="text-xs text-primary font-bold uppercase ml-2 tracking-wider">
                  — बृहत्पाराशर होराशास्त्रम् (BPHS 1.4)
                </span>
              </p>
            </div>

            {/* Detailed Description */}
            <div className="text-sm sm:text-base text-on-surface leading-relaxed text-left whitespace-pre-line">
              {description}
            </div>

            {/* 4 Analytical Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-left">
              <div className="p-4 rounded bg-surface-container-low/60 border border-outline-variant/40 flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-surface flex items-center justify-center shrink-0 border border-secondary/30 text-secondary">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-serif text-sm font-bold text-secondary">
                    {isHindi ? "षोडशवर्ग सूक्ष्म विश्लेषण" : "Shodashvarga Chart Scrutiny"}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                    {isHindi
                      ? "डी१ लग्न से लेकर डी९ नवांश तथा डी६० षष्ट्यंश सूक्ष्म कर्मफलों का परिकलन।"
                      : "Detailed scrutiny across divisional harmonics from D1 Lagna up to D60 subtle karmic matrices."}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded bg-surface-container-low/60 border border-outline-variant/40 flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-surface flex items-center justify-center shrink-0 border border-secondary/30 text-secondary">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-serif text-sm font-bold text-secondary">
                    {isHindi ? "विंशोत्तरी दशा व गोचर" : "Vimshottari Dasha & Transits"}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                    {isHindi
                      ? "महादशा-अंतर्दशा क्रम तथा शनि, गुरु एवं राहु गोचर का जीवन की दिशा पर प्रभाव।"
                      : "Granular dasha transitions, retrogression impacts, and Sade Sati mitigation windows."}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded bg-surface-container-low/60 border border-outline-variant/40 flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-surface flex items-center justify-center shrink-0 border border-secondary/30 text-secondary">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-serif text-sm font-bold text-secondary">
                    {isHindi ? "दोष निर्णय व परिहार" : "Dosha & Affliction Verdict"}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                    {isHindi
                      ? "मांगलिक, कालसर्प, पितृ अथवा ग्रहण दोषों की शास्त्रीय निवृत्ति और उपाय।"
                      : "Definitive calculations for Kuja Manglik, Kalsarpa, and planetary combustion rules."}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded bg-surface-container-low/60 border border-outline-variant/40 flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-surface flex items-center justify-center shrink-0 border border-secondary/30 text-secondary">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-serif text-sm font-bold text-secondary">
                    {isHindi ? "शास्त्रसम्मत वैदिक उपाय" : "Authentic Vedic Remedies"}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                    {isHindi
                      ? "ग्रह गायत्री मन्त्र जप, सिद्ध प्राकृतिक रत्न अनुशंसा तथा संकल्प दान विधान।"
                      : "Scriptural remedies: specific Gayatri mantras, certified gemstones, and Daivajna protocols."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Spotlight Card (30% ~ 4 cols): Vedic Pothi Craftsmanship */}
          <div className="lg:col-span-4 bg-surface-container-low rounded-lg border-2 border-secondary/30 p-6 flex flex-col space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-outline-variant/50 pb-3">
              <div className="text-xs uppercase tracking-wider text-secondary font-bold flex items-center gap-1.5">
                <Feather className="w-4 h-4 text-primary" />
                <span>{isHindi ? "पाण्डुलिपि निर्माण शिल्प" : "Manuscript Craftsmanship"}</span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed">
                {isHindi ? "हस्तनिर्मित" : "Handcrafted"}
              </span>
            </div>

            {/* Visual Manuscript Card */}
            <div className="p-4 rounded border border-secondary/30 bg-surface text-left space-y-2">
              <div className="flex items-center gap-2 text-secondary font-serif font-bold text-sm">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>{isHindi ? "दशाश्वमेध शोध पीठ संस्तुत" : "Dashashwamedh Peeth Lineage"}</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isHindi
                  ? "काशी के वरिष्ठ दैवज्ञों द्वारा प्रत्येक कुण्डली का व्यक्तिगत परीक्षण। शुद्ध अयनांश एवं त्रिकोणमितीय गणित।"
                  : "Verified independently using Lahiri Ayanamsha and Kashi ephemeris planetary tables."}
              </p>
            </div>

            {/* Craftsmanship Points */}
            <div className="space-y-3 text-xs text-on-surface-variant text-left">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                <span>
                  <strong>{isHindi ? "शास्त्रीय प्रामाणिकता:" : "Scriptural Fidelity:"}</strong>{" "}
                  {isHindi
                    ? "बृहत्पाराशर होराशास्त्र एवं फलदीपिका के मूल सूत्रों पर आधारित।"
                    : "Strictly aligned with classical Brihat Parashara and Phaladeepika sutras."}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                <span>
                  <strong>{isHindi ? "हस्त-परीक्षित चक्र:" : "Manual Chart Audit:"}</strong>{" "}
                  {isHindi
                    ? "संगणक द्वारा गणना के उपरांत आचार्य द्वारा हस्त-परीक्षण।"
                    : "Every planetary degree manually verified by experienced Jyotish Acharyas."}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                <span>
                  <strong>{isHindi ? "स्थायी सुरक्षा:" : "Archival Durability:"}</strong>{" "}
                  {isHindi
                    ? "अभिलेखीय गुणवत्ता वाले पत्र एवं दीर्घकालिक डिजिटल तिजोरी संरक्षण।"
                    : "Long-term archival storage with private digital vault access."}
                </span>
              </div>
            </div>

            {/* Seal Box */}
            <div className="p-3.5 bg-surface rounded border border-outline-variant/60 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold font-serif text-lg shrink-0">
                क
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-secondary">
                  {isHindi ? "काशी विद्वत् परिषद्" : "Varanasi Jyotish Parishad"}
                </div>
                <div className="text-[11px] text-on-surface-variant leading-tight">
                  {isHindi
                    ? "प्रामाणिक वैदिक ज्योतिष अनुसंधान परंपरा।"
                    : "Canonical Vedic astrological research lineage."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Plan Selector & Sticky Bar */}
      <section className="w-full bg-surface-container-low/60 border-t border-secondary/20 py-12 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <PlanSelectorInteractive
            plans={plansDto}
            serviceSlug={service.slug}
            serviceTitle={title}
            locale={locale}
          />
        </div>
      </section>
    </div>
  );
}
