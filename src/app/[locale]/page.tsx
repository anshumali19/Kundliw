import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getDailyPanchang } from "@/lib/astro/panchangService";
import { PanchangWidget } from "@/features/astro/components/PanchangWidget";
import { LiveClockEphemeris } from "@/components/home/LiveClockEphemeris";
import { BannerSlot } from "@/components/banners/BannerSlot";
import { prisma } from "@/lib/prisma";
import { pageAlternates } from "@/lib/seo";
import { ArrowRight, Calendar, Compass, HeartHandshake, HelpCircle, ScrollText, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isHindi = locale === "hi";
  return {
    title: isHindi
      ? "वैदिक ज्योतिष परामर्श, कुंडली एवं गुण मिलान | महर्षि कणाद ज्योतिष केंद्र"
      : "Vedic Astrology Consultation, Kundli and Matching | Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "कुंडली, कुंडली मिलान और प्रश्न कुंडली सेवाएँ चुनें, ऑनलाइन बुकिंग करें और ऑर्डर की प्रगति देखें। हिंदी और अंग्रेज़ी में उपलब्ध।"
      : "Choose Kundli, Kundli matching and Prashna Kundli services, book online and track your order. Available in Hindi and English.",
    alternates: pageAlternates(locale, ""),
  };
}

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params?.locale || "hi";
  const isHindi = locale === "hi";
  const t = await getTranslations("home");

  const [panchang, leftBanners, rightBanners, services, testimonials] = await Promise.all([
    getDailyPanchang(),
    prisma.banner
      .findMany({ where: { isActive: true, position: "LEFT" }, orderBy: { orderIndex: "asc" } })
      .catch(() => []),
    prisma.banner
      .findMany({ where: { isActive: true, position: "RIGHT" }, orderBy: { orderIndex: "asc" } })
      .catch(() => []),
    prisma.service
      .findMany({
        where: { isActive: true },
        orderBy: { orderIndex: "asc" },
        take: 4,
        include: {
          plans: { where: { isActive: true }, orderBy: { pricePaise: "asc" }, take: 1 },
        },
      })
      .catch(() => []),
    prisma.testimonial
      .findMany({
        where: { isActive: true, isVerified: true },
        orderBy: { orderIndex: "asc" },
        take: 3,
      })
      .catch(() => []),
  ]);

  const tools = [
    { href: "/kundli", icon: ScrollText, title: t("toolKundli"), desc: t("toolKundliDesc") },
    { href: "/kundli/matching", icon: HeartHandshake, title: t("toolMatching"), desc: t("toolMatchingDesc") },
    { href: "/kundli/prashna", icon: HelpCircle, title: t("toolPrashna"), desc: t("toolPrashnaDesc") },
    { href: "/track", icon: Compass, title: t("toolTrack"), desc: t("toolTrackDesc") },
  ];

  const steps = [
    { title: t("step1Title"), desc: t("step1Desc") },
    { title: t("step2Title"), desc: t("step2Desc") },
    { title: t("step3Title"), desc: t("step3Desc") },
    { title: t("step4Title"), desc: t("step4Desc") },
  ];

  return (
    <div className="flex flex-col w-full text-on-surface">
      <PanchangWidget panchang={panchang} locale={locale} />

      {/* Hero */}
      <section className="w-full bg-surface border-b border-outline-variant/40">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 text-left">
              <LiveClockEphemeris tithi={panchang?.tithi} />
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                {t("heroEyebrow")}
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary tracking-tight leading-tight mb-4">
                {t("heroTitle")}
              </h1>
              <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed mb-6">
                {t("heroLead")}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container hover:bg-primary text-on-primary text-sm uppercase tracking-wider rounded font-bold transition-colors border border-primary min-h-[44px]"
                >
                  <Calendar className="w-4 h-4" />
                  {t("ctaBook")}
                </Link>
                <Link
                  href="/kundli"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-surface hover:bg-surface-container-high text-secondary text-sm uppercase tracking-wider rounded font-bold transition-colors border border-secondary min-h-[44px]"
                >
                  {t("ctaKundli")}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-surface-container-low p-5 rounded border border-secondary/30 text-left">
              <h2 className="font-serif text-lg font-bold text-secondary pb-2 mb-2 border-b border-outline-variant/50">
                {t("toolsTitle")}
              </h2>
              <ul className="divide-y divide-outline-variant/40">
                {tools.map(({ href, icon: Icon, title, desc }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex items-center gap-3 py-3 group min-h-[44px]"
                    >
                      <span className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-secondary shrink-0 border border-outline-variant/60">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-bold text-secondary group-hover:text-primary transition-colors">
                          {title}
                        </span>
                        <span className="block text-xs text-on-surface-variant">{desc}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-outline shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Admin-managed promotional banners (left / right) */}
      {(leftBanners.length > 0 || rightBanners.length > 0) && (
        <section className="w-full bg-surface-container-low/40 border-b border-outline-variant/30 py-6">
          <div className="w-full px-4 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {leftBanners.length > 0 ? (
                <BannerSlot position="LEFT" initialBanners={leftBanners} className="h-full" />
              ) : (
                <div />
              )}
              {rightBanners.length > 0 ? (
                <BannerSlot position="RIGHT" initialBanners={rightBanners} className="h-full" />
              ) : (
                <div />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Services (from the catalogue managed in the admin panel) */}
      {services.length > 0 && (
        <section className="w-full bg-surface-container-low/70 py-12 border-b border-secondary/20">
          <div className="w-full px-4 sm:px-8 lg:px-12 text-left">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl text-secondary font-bold">
                  {t("servicesTitle")}
                </h2>
                <p className="text-sm sm:text-base text-on-surface-variant mt-1">{t("servicesLead")}</p>
              </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary uppercase tracking-wider hover:underline min-h-[44px]"
              >
                {t("viewAll")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {services.map((service) => {
                const title = isHindi ? service.titleHi : service.titleEn;
                const summary =
                  (isHindi ? service.taglineHi : service.taglineEn) ||
                  (isHindi ? service.descriptionHi : service.descriptionEn);
                const startingPrice = service.plans[0]?.pricePaise;
                return (
                  <Link
                    key={service.id}
                    href={`/services/${service.slug}`}
                    className="bg-surface p-5 rounded border border-secondary/40 hover:border-secondary flex flex-col gap-2 transition-colors"
                  >
                    <h3 className="font-serif text-lg font-bold text-secondary">{title}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                      {summary}
                    </p>
                    <div className="mt-auto pt-3 flex items-center justify-between text-sm">
                      {startingPrice ? (
                        <span className="font-bold text-secondary">
                          {t("from")} {formatRupees(startingPrice)}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="inline-flex items-center gap-1 font-bold text-primary uppercase tracking-wider">
                        {t("viewDetails")}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Booking steps */}
      <section className="w-full bg-surface-container py-12 border-b border-outline-variant/50">
        <div className="w-full px-4 sm:px-8 lg:px-12 text-left">
          <h2 className="font-serif text-2xl sm:text-3xl text-secondary font-bold mb-8">
            {t("stepsTitle")}
          </h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="bg-surface p-4 sm:p-5 rounded border border-secondary/30 flex gap-3 sm:block"
              >
                <span className="w-8 h-8 shrink-0 rounded-full bg-secondary text-on-secondary text-sm font-bold flex items-center justify-center sm:mb-3">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-serif text-base font-bold text-secondary mb-1">{step.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Verified client feedback only; hidden until real testimonials are published */}
      {testimonials.length > 0 && (
        <section className="w-full bg-surface py-12 border-b border-secondary/20">
          <div className="w-full px-4 sm:px-8 lg:px-12 text-left">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
              <h2 className="font-serif text-2xl sm:text-3xl text-secondary font-bold">
                {t("testimonialsTitle")}
              </h2>
              <Link
                href="/testimonials"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary uppercase tracking-wider hover:underline min-h-[44px]"
              >
                {t("viewAllTestimonials")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((item) => (
                <figure
                  key={item.id}
                  className="bg-surface-container-low p-5 rounded border border-secondary/30 flex flex-col gap-3"
                >
                  <div className="flex text-tertiary" aria-label={`${item.rating} / 5`}>
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-sm sm:text-base text-on-surface leading-relaxed">
                    {isHindi ? item.quoteHi : item.quoteEn}
                  </blockquote>
                  <figcaption className="mt-auto text-sm">
                    <span className="font-bold text-secondary">
                      {isHindi ? item.authorNameHi : item.authorNameEn}
                    </span>
                    <span className="text-on-surface-variant">
                      , {isHindi ? item.cityHi : item.cityEn}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
