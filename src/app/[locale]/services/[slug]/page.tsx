import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { PlanSelectorInteractive, PlanDTO } from "@/features/services/components/PlanSelectorInteractive";
import { formatPaiseToInr } from "@/lib/billing/gst";
import {
  Compass,
  CheckCircle2,
  Clock,
  PhoneCall,
  FileText,
  Layers,
  Sparkles,
  Info,
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

  // Query service and active plans from DB
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
  const notes = isHindi ? service.notesHi : service.notesEn;
  const highlights = isHindi ? service.highlightsHi : service.highlightsEn;

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

  // Lowest starting price among plans
  const lowestPrice =
    service.plans.length > 0
      ? Math.min(...service.plans.map((p) => p.pricePaise))
      : null;

  return (
    <div className="w-full flex flex-col text-on-surface text-left">
      {/* 1. Breadcrumbs Strip */}
      <section className="w-full bg-surface-container-low border-b border-secondary/20 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 text-left">
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
        </div>
      </section>

      {/* 2. Asymmetric Showcase (70% Left Editorial / 30% Right Data Pane) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-12 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Pane (70% ~ 8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-6 text-left">
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

            {/* Optional Editorial / Scriptural Notes Block entered by Admin in DB */}
            {notes && (
              <div className="p-5 bg-surface-container-low rounded border-l-4 border-l-secondary border border-outline-variant/40 text-left">
                <p className="text-xs sm:text-sm text-secondary font-medium leading-relaxed whitespace-pre-line">
                  {notes}
                </p>
              </div>
            )}

            {/* Service Description from Database */}
            <div className="text-sm sm:text-base text-on-surface leading-relaxed text-left whitespace-pre-line">
              {description}
            </div>

            {/* Service Highlights from Database (Only rendered if admin entered highlights) */}
            {highlights && highlights.length > 0 && (
              <div className="pt-2 text-left">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-secondary mb-3">
                  {isHindi ? "मुख्य सेवा विशेषताएँ" : "Key Service Inclusions"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlights.map((highlight, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded bg-surface-container-low/60 border border-outline-variant/40 flex items-start gap-2.5 text-xs text-on-surface"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="leading-snug">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Pane (30% ~ 4 cols): Pure Data from Service & Plan Records */}
          <div className="lg:col-span-4 bg-surface-container-low rounded-lg border border-secondary/30 p-6 flex flex-col space-y-5 text-left">
            <div className="border-b border-outline-variant/50 pb-3">
              <div className="text-xs uppercase tracking-wider text-secondary font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-primary" />
                <span>{isHindi ? "संस्करण एवं परामर्श विवरण" : "Consultation Overview"}</span>
              </div>
            </div>

            {/* Starting Dakshina */}
            {lowestPrice !== null && (
              <div className="p-4 rounded border border-outline-variant/50 bg-surface text-left">
                <div className="text-xs uppercase tracking-wider text-on-surface-variant">
                  {isHindi ? "प्रारंभिक दक्षिणा दर" : "Dakshina Starting From"}
                </div>
                <div className="font-serif text-2xl font-bold text-secondary mt-1">
                  {formatPaiseToInr(lowestPrice)}
                </div>
                <div className="text-[11px] text-on-surface-variant mt-1">
                  {service.plans.length} {isHindi ? "संस्करण योजनाएँ उपलब्ध" : "active consultation tiers available"}
                </div>
              </div>
            )}

            {/* List of Available Plans & Inclusions strictly from DB */}
            <div className="space-y-3 text-xs text-on-surface-variant text-left">
              <div className="font-bold uppercase tracking-wider text-secondary text-[11px]">
                {isHindi ? "उपलब्ध परामर्श प्रारूप" : "Available Consultation Formats"}
              </div>

              {service.plans.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-surface rounded border border-outline-variant/40 text-left space-y-1"
                >
                  <div className="flex items-center justify-between font-serif font-bold text-secondary text-xs">
                    <span>{isHindi ? p.titleHi : p.titleEn}</span>
                    <span>{formatPaiseToInr(p.pricePaise)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-secondary" />
                      {p.deliveryDays} {isHindi ? "कार्यदिवस" : "days"}
                    </span>
                    {p.pages && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-secondary" />
                        {p.pages} {isHindi ? "पृष्ठ" : "pages"}
                      </span>
                    )}
                    {p.hasCall && p.callDurationMinutes && (
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <PhoneCall className="w-3 h-3" />
                        {p.callDurationMinutes} {isHindi ? "मिनट" : "mins"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
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
