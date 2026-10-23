import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getDailyPanchang } from "@/lib/astro/panchangService";
import { PanchangWidget } from "@/features/astro/components/PanchangWidget";
import {
  Calendar,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params?.locale || "hi";
  const panchang = await getDailyPanchang();
  const tCommon = await getTranslations("common");
  const tHero = await getTranslations("hero");
  const tTransit = await getTranslations("transitWidget");
  const tPromo = await getTranslations("annualPromotion");
  const tServices = await getTranslations("servicesSection");
  const tPipeline = await getTranslations("pipelineSection");
  const tTestimonials = await getTranslations("testimonialsSection");

  const coreServices = [
    {
      num: "१",
      slug: "complete-janampatri",
      titleEn: "Complete Janampatri & Lifetime Kundli",
      titleHi: "सम्पूर्ण जन्मपत्रिका एवं षोडशवर्ग चक्र",
      descEn:
        "Exhaustive 45-page astrological dossier mapping D1 Rashi down to D60 Shashtiamsa. In-depth analysis of Vimshottari Mahadasha-Antardasha cycles and lifelong health/wealth milestones.",
      badge: "सर्वाधिक लोकप्रिय (Most Popular)",
      badgeColor: "bg-tertiary-fixed text-on-tertiary-fixed",
      price: "₹1,100 - ₹5,100",
      timeline: "3–5 Working Days",
      highlights: [
        "Complete D1 to D60 Shodashvarga mathematical charts",
        "Lifetime Vimshottari & Ashtottari Dasha analysis",
        "Handcrafted archival bound manual + 1-on-1 Acharya session",
      ],
    },
    {
      num: "२",
      slug: "career-business-raj-yoga",
      titleEn: "Career, Business & Raj Yoga Consultation",
      titleHi: "कर्मभाव, व्यवसाय एवं राजयोग परीक्षण",
      descEn:
        "Specialized diagnosis of the 10th House (Karmasthana), Amatyakaraka, and Dashamsha (D10) chart. Pinpoints golden professional transits and Sade Sati mitigation.",
      badge: "उच्च पद योग (Leadership)",
      badgeColor: "bg-surface-container-high text-secondary",
      price: "₹1,500",
      timeline: "Slot in 48 Hours",
      highlights: [
        "10th House Karmabhava & Dashamsha (D10) analysis",
        "Detailed Sade Sati audit & Shani Shanti measures",
        "Direct 30-min one-on-one session with Senior Acharya",
      ],
    },
    {
      num: "३",
      slug: "kundli-matching",
      titleEn: "Kundli Milan & Marriage Harmony",
      titleHi: "अष्टकूट ३६ गुण मिलान एवं दाम्पत्य विचार",
      descEn:
        "Moving beyond superficial point systems: rigorous Ashtakoot 36-Guna assessment paired with Nadi Dosha cancellations, Bhakoot examination, and D9 Navamsha mutual compatibility.",
      badge: "दाम्पत्य सुख (Harmony)",
      badgeColor: "bg-surface-container-high text-secondary",
      price: "₹1,100",
      timeline: "Verdict in 24 Hours",
      highlights: [
        "Complete Ashtakoot 36 Guna Milapak score sheet",
        "Manglik dosha cancellation verdict (भौम दोष परिहार)",
        "Navamsha D9 cross-alignment for mental & progeny compatibility",
      ],
    },
    {
      num: "४",
      slug: "prashna-kundli",
      titleEn: "Prashna Kundli / Horary Astrology",
      titleHi: "तात्कालिक प्रश्न शास्त्र समाधान",
      descEn:
        "When exact birth time is missing or an urgent dilemma requires immediate resolution (litigation, missing objects, venture success). Cast strictly at the intake moment at Varanasi.",
      badge: "Same-Day Delivery",
      badgeColor: "bg-primary/10 text-primary",
      price: "₹850",
      timeline: "Same Day Response",
      highlights: [
        "Prashna Arudha and Tajik Itthasala yoga casting",
        "Direct Yes/No likelihood & definitive timeframe window",
        "Audio voice memo + written PDF response within 6 hours",
      ],
    },
  ];

  return (
    <div className="flex flex-col w-full text-on-surface">
      {/* 1. EPHEMERIS STRIP / PANCHANG WIDGET */}
      <PanchangWidget panchang={panchang} locale={locale} />

      {/* 2. ASYMMETRIC HERO SECTION (65 / 35 Split) */}
      <section className="w-full bg-surface border-b border-outline-variant/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (65% ~ 8 cols) */}
            <div className="lg:col-span-8 flex flex-col justify-start text-left">
              {/* Devanagari Invocation */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-surface-container border border-secondary/30 rounded text-secondary font-serif text-xs font-semibold italic">
                  {tCommon("sanskritInvocation")}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 rounded text-[11px] text-primary font-semibold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {tHero("badgeStandard")}
                </span>
              </div>

              {/* Seraphic Dual-Language Headline */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary tracking-tight mb-2 leading-[1.15]">
                {tHero("title")}
              </h1>
              <p className="font-serif text-lg sm:text-xl text-primary font-semibold mb-4">
                {tHero("subtitle")}
              </p>

              {/* Lineage Statement */}
              <p className="text-sm sm:text-base text-on-surface-variant max-w-3xl mb-6 leading-relaxed">
                {tHero("lineage")}
              </p>

              {/* Core Callouts & Starting Dakshina */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-surface-container-low rounded border border-outline-variant/60 mb-6 text-left">
                <div className="border-r border-outline-variant/50 pr-3">
                  <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    {tHero("stat1Title")}
                  </div>
                  <div className="font-serif text-xl sm:text-2xl text-secondary font-bold mt-0.5">
                    {tHero("stat1Value")}
                  </div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    {tHero("stat1Desc")}
                  </div>
                </div>
                <div className="sm:border-r border-outline-variant/50 px-2">
                  <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    {tHero("stat2Title")}
                  </div>
                  <div className="font-serif text-xl sm:text-2xl text-primary font-bold mt-0.5">
                    {tHero("stat2Value")}
                  </div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    {tHero("stat2Desc")}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1 pl-2 pt-2 sm:pt-0">
                  <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    {tHero("stat3Title")}
                  </div>
                  <div className="font-serif text-xl sm:text-2xl text-secondary font-bold mt-0.5">
                    {tHero("stat3Value")}
                  </div>
                  <div className="text-xs text-primary font-medium mt-0.5">
                    {tHero("stat3Desc")}
                  </div>
                </div>
              </div>

              {/* Action CTA Group */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container hover:bg-primary text-on-primary text-xs uppercase tracking-wider rounded font-bold transition-colors border border-primary min-h-[44px]"
                >
                  <Calendar className="w-4 h-4" />
                  {tHero("bookCta")}
                </Link>
                <Link
                  href="/panchang"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-surface hover:bg-surface-container-high text-secondary text-xs uppercase tracking-wider rounded font-bold transition-colors border border-secondary min-h-[44px]"
                >
                  <BookOpen className="w-4 h-4" />
                  {tHero("panchangCta")}
                </Link>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant pl-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                  <span>{tHero("slotsNotice")}</span>
                </div>
              </div>
            </div>

            {/* Right Column (35% ~ 4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4 text-left">
              {/* Varshaphala Promotion Card */}
              <div className="bg-surface-container-lowest p-5 rounded border-2 border-secondary relative overflow-hidden">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-outline-variant/60">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-serif text-base font-bold text-secondary">
                      {tPromo("title")}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed rounded text-[10px] font-bold uppercase tracking-wider">
                    {tPromo("tag")}
                  </span>
                </div>
                <p className="text-xs text-on-surface mb-3 leading-relaxed">
                  {tPromo("description")}
                </p>
                <div className="flex items-center justify-between text-xs mb-3.5 bg-surface-container-low p-2 rounded">
                  <span className="text-on-surface-variant font-medium">
                    {tPromo("binding")}
                  </span>
                  <span className="font-bold text-secondary">
                    {tPromo("price")}{" "}
                    <span className="line-through text-outline font-normal">
                      {tPromo("originalPrice")}
                    </span>
                  </span>
                </div>
                <Link
                  href="/services"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-secondary hover:bg-secondary/90 text-on-secondary text-xs uppercase tracking-wider rounded font-semibold transition-colors min-h-[44px]"
                >
                  <span>{tPromo("cta")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Graha Spashta Micro-Grid */}
              <div className="bg-surface-container-low p-4 rounded border border-secondary/30">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-outline-variant/50">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-secondary uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>{tTransit("title")}</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">
                    {tTransit("subtitle")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-1.5 bg-surface rounded border border-outline-variant/40 flex items-center justify-between">
                    <span className="font-semibold text-secondary">{tTransit("sun")}</span>
                    <span className="text-on-surface-variant font-medium">मकर 08°14&apos;</span>
                  </div>
                  <div className="p-1.5 bg-surface rounded border border-outline-variant/40 flex items-center justify-between">
                    <span className="font-semibold text-secondary">{tTransit("moon")}</span>
                    <span className="text-on-surface-variant font-medium">वृषभ 19°40&apos;</span>
                  </div>
                  <div className="p-1.5 bg-surface rounded border border-outline-variant/40 flex items-center justify-between">
                    <span className="font-semibold text-secondary">{tTransit("mars")}</span>
                    <span className="text-on-surface-variant font-medium">कर्क 02°11&apos; (R)</span>
                  </div>
                  <div className="p-1.5 bg-surface rounded border border-outline-variant/40 flex items-center justify-between">
                    <span className="font-semibold text-secondary">{tTransit("mercury")}</span>
                    <span className="text-on-surface-variant font-medium">धनु 28°55&apos;</span>
                  </div>
                  <div className="p-1.5 bg-surface rounded border border-outline-variant/40 flex items-center justify-between">
                    <span className="font-semibold text-secondary">{tTransit("jupiter")}</span>
                    <span className="text-on-surface-variant font-medium">वृषभ 17°22&apos;</span>
                  </div>
                  <div className="p-1.5 bg-surface rounded border border-outline-variant/40 flex items-center justify-between">
                    <span className="font-semibold text-secondary">{tTransit("venus")}</span>
                    <span className="text-on-surface-variant font-medium">कुम्भ 14°08&apos;</span>
                  </div>
                  <div className="p-1.5 bg-surface rounded border border-outline-variant/40 flex items-center justify-between">
                    <span className="font-semibold text-secondary">{tTransit("saturn")}</span>
                    <span className="text-on-surface-variant font-medium">कुम्भ 22°45&apos;</span>
                  </div>
                  <div className="p-1.5 bg-surface rounded border border-outline-variant/40 flex items-center justify-between">
                    <span className="font-semibold text-secondary">{tTransit("rahu")}</span>
                    <span className="text-on-surface-variant font-medium">मीन 11°32&apos; (R)</span>
                  </div>
                </div>

                <div className="text-[11px] text-on-surface-variant bg-surface-container p-2 rounded border border-outline-variant/40 leading-snug">
                  {tTransit("transitNote")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE SERVICES GRID (2-Column Ruled Editorial Split) */}
      <section className="w-full bg-surface-container-low/70 py-12 border-b border-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 mb-8 border-b-2 border-secondary/30">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest">
                <span>{tServices("eyebrow")}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-secondary font-bold mt-1">
                {tServices("heading")}
              </h2>
              <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
                {tServices("subheading")}
              </p>
            </div>
            <div className="shrink-0 text-xs">
              <span className="px-3 py-1 bg-surface rounded border border-outline-variant text-on-surface font-semibold">
                {tServices("badgeAvailable")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {coreServices.map((service) => (
              <div
                key={service.slug}
                className="bg-surface p-6 rounded border border-secondary/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-secondary font-serif font-bold text-base">
                        {service.num}
                      </span>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-secondary">
                          {service.titleEn}
                        </h3>
                        <div className="text-xs text-primary font-semibold">
                          {service.titleHi}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${service.badgeColor}`}>
                      {service.badge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-on-surface mb-4 leading-relaxed">
                    {service.descEn}
                  </p>

                  <div className="space-y-1.5 text-xs text-on-surface-variant mb-5 border-t border-b border-outline-variant/40 py-3">
                    {service.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                      {tServices("timelineLabel")}
                    </div>
                    <div className="font-serif text-lg text-secondary font-bold">
                      {service.price}{" "}
                      <span className="text-xs font-normal text-on-surface-variant">
                        / {service.timeline}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary hover:bg-secondary/90 text-on-secondary text-xs uppercase tracking-wider rounded font-semibold transition-colors min-h-[44px]"
                  >
                    <span>{tServices("viewCta")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 5-STAGE VEDIC PIPELINE STRIP */}
      <section className="w-full bg-surface-container py-12 border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
            <div>
              <span className="text-xs text-primary font-bold uppercase tracking-wider">
                {tPipeline("eyebrow")}
              </span>
              <h2 className="font-serif text-xl sm:text-2xl text-secondary font-bold mt-0.5">
                {tPipeline("heading")}
              </h2>
            </div>
            <div className="text-xs text-on-surface-variant bg-surface px-3 py-1.5 rounded border border-secondary/20 self-start sm:self-auto">
              {tPipeline("badgeCouncil")}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Stage 1 */}
            <div className="bg-surface p-4 rounded border border-secondary/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                    {tPipeline("stage1Num")}
                  </span>
                </div>
                <h4 className="font-serif text-sm font-bold text-secondary mb-0.5">
                  {tPipeline("stage1Title")}
                </h4>
                <div className="text-[11px] text-primary font-semibold mb-2">
                  {tPipeline("stage1Sub")}
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {tPipeline("stage1Desc")}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-outline-variant/30 text-[10px] text-on-surface-variant flex items-center gap-1">
                <Clock className="w-3 h-3 text-secondary" />
                <span>{tPipeline("stage1Time")}</span>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="bg-surface p-4 rounded border border-secondary/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                    {tPipeline("stage2Num")}
                  </span>
                </div>
                <h4 className="font-serif text-sm font-bold text-secondary mb-0.5">
                  {tPipeline("stage2Title")}
                </h4>
                <div className="text-[11px] text-primary font-semibold mb-2">
                  {tPipeline("stage2Sub")}
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {tPipeline("stage2Desc")}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-outline-variant/30 text-[10px] text-on-surface-variant flex items-center gap-1">
                <Clock className="w-3 h-3 text-secondary" />
                <span>{tPipeline("stage2Time")}</span>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="bg-surface p-4 rounded border-2 border-secondary flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                    {tPipeline("stage3Num")}
                  </span>
                </div>
                <h4 className="font-serif text-sm font-bold text-secondary mb-0.5">
                  {tPipeline("stage3Title")}
                </h4>
                <div className="text-[11px] text-primary font-semibold mb-2">
                  {tPipeline("stage3Sub")}
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {tPipeline("stage3Desc")}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-outline-variant/30 text-[10px] text-on-surface-variant flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-secondary" />
                <span>{tPipeline("stage3Time")}</span>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="bg-surface p-4 rounded border border-secondary/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                    {tPipeline("stage4Num")}
                  </span>
                </div>
                <h4 className="font-serif text-sm font-bold text-secondary mb-0.5">
                  {tPipeline("stage4Title")}
                </h4>
                <div className="text-[11px] text-primary font-semibold mb-2">
                  {tPipeline("stage4Sub")}
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {tPipeline("stage4Desc")}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-outline-variant/30 text-[10px] text-on-surface-variant flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-secondary" />
                <span>{tPipeline("stage4Time")}</span>
              </div>
            </div>

            {/* Stage 5 */}
            <div className="bg-surface p-4 rounded border border-secondary/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary text-xs font-bold flex items-center justify-center">
                    5
                  </span>
                  <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                    {tPipeline("stage5Num")}
                  </span>
                </div>
                <h4 className="font-serif text-sm font-bold text-secondary mb-0.5">
                  {tPipeline("stage5Title")}
                </h4>
                <div className="text-[11px] text-primary font-semibold mb-2">
                  {tPipeline("stage5Sub")}
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {tPipeline("stage5Desc")}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-outline-variant/30 text-[10px] text-on-surface-variant flex items-center gap-1">
                <MapPin className="w-3 h-3 text-secondary" />
                <span>{tPipeline("stage5Time")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CUSTOMER TESTIMONIALS (3-Column Asymmetric Row) */}
      <section className="w-full bg-surface py-12 border-b border-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {tTestimonials("eyebrow")}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-secondary font-bold mt-1">
                {tTestimonials("heading")}
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                {tTestimonials("subheading")}
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1.5 bg-surface-container rounded border border-outline-variant text-secondary self-start md:self-auto">
              {tTestimonials("ratingSummary")}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-low p-6 rounded border border-secondary/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 bg-surface rounded text-primary text-[11px] font-bold uppercase tracking-wider border border-outline-variant">
                    बेंगलुरु • Bengaluru
                  </span>
                  <div className="flex text-tertiary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-on-surface mb-4 italic leading-relaxed">
                  &ldquo;[Sample Feedback] Detailed analysis of natal charts and planetary periods provided clear perspective on vocational timing and karmic considerations.&rdquo;
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                <div>
                  <div className="font-serif text-sm font-bold text-secondary">
                    Sample Client
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    Career Consultation
                  </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-outline-variant shrink-0" />
              </div>
            </div>

            <div className="bg-surface-container-low p-6 rounded border border-secondary/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 bg-surface rounded text-primary text-[11px] font-bold uppercase tracking-wider border border-outline-variant">
                    लंदन • London, UK
                  </span>
                  <div className="flex text-tertiary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-on-surface mb-4 italic leading-relaxed">
                  &ldquo;[Sample Feedback] The mathematical rectification methodology provided structured and clear astrological milestones for past events.&rdquo;
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                <div>
                  <div className="font-serif text-sm font-bold text-secondary">
                    Sample Client
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    Birth-Time Rectification
                  </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-outline-variant shrink-0" />
              </div>
            </div>

            <div className="bg-surface-container-low p-6 rounded border border-secondary/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 bg-surface rounded text-primary text-[11px] font-bold uppercase tracking-wider border border-outline-variant">
                    वाराणसी • Varanasi
                  </span>
                  <div className="flex text-tertiary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-on-surface mb-4 italic leading-relaxed">
                  &ldquo;[नमूना अनुभव] अष्टकूट गुण मिलान में नाड़ी दोष के शास्त्रीय अपवादों व परिहार का स्पष्ट विवरण प्राप्त हुआ।&rdquo;
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                <div>
                  <div className="font-serif text-sm font-bold text-secondary">
                    परामर्शार्थी (ग्राहक)
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    अष्टकूट मिलान
                  </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-outline-variant shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
