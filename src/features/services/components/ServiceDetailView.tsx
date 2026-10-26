"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { formatPaiseToInr } from "@/lib/billing/gst";
import { PlanSelectorInteractive, PlanDTO } from "./PlanSelectorInteractive";
import { SubPageNav } from "@/components/layout/SubPageNav";
import { ServiceEnquiryModal } from "./ServiceEnquiryModal";
import { LinkList, YouTubeEmbed } from "@/components/content/MediaView";
import { isSafeImageSrc, normalizeLinks } from "@/lib/content/media";
import {
  CheckCircle2,
  Clock,
  PhoneCall,
  FileText,
  Layers,
  Sparkles,
  HelpCircle,
  Video,
  ExternalLink,
  BookOpen,
  Package,
  Calendar,
  ListOrdered,
} from "lucide-react";

export interface ServiceDetailDTO {
  id: string;
  slug: string;
  titleEn: string;
  titleHi: string;
  taglineEn?: string | null;
  taglineHi?: string | null;
  descriptionEn: string;
  descriptionHi: string;
  highlightsEn: string[];
  highlightsHi: string[];
  notesEn?: string | null;
  notesHi?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  itineraryEn?: string | null;
  itineraryHi?: string | null;
  samagriEn?: string | null;
  samagriHi?: string | null;
  youtubeUrl?: string | null;
  additionalLinks?: unknown;
  plans: Array<{
    id: string;
    slug: string;
    titleEn: string;
    titleHi: string;
    descriptionEn: string;
    descriptionHi: string;
    pricePaise: number;
    originalPricePaise?: number | null;
    deliveryDays: number;
    pages?: number | null;
    hasCall: boolean;
    callDurationMinutes?: number | null;
    featuresEn: string[];
    featuresHi: string[];
    programEn?: string | null;
    programHi?: string | null;
    preparationEn?: string | null;
    preparationHi?: string | null;
    samagriEn?: string | null;
    samagriHi?: string | null;
    itineraryEn?: string | null;
    itineraryHi?: string | null;
    isPopular: boolean;
    orderIndex: number;
    imageUrl?: string | null;
    youtubeUrl?: string | null;
    additionalLinks?: unknown;
  }>;
}

export interface ServiceDetailViewProps {
  service: ServiceDetailDTO;
  nextService?: { slug: string; title: string } | null;
  locale: string;
}

export function ServiceDetailView({
  service,
  nextService,
  locale,
}: ServiceDetailViewProps) {
  const isHindi = locale === "hi";
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);

  const title = isHindi ? service.titleHi : service.titleEn;
  const tagline = isHindi ? service.taglineHi : service.taglineEn;
  const description = isHindi ? service.descriptionHi : service.descriptionEn;
  const notes = isHindi ? service.notesHi : service.notesEn;
  const highlights = isHindi ? service.highlightsHi : service.highlightsEn;
  const itinerary = isHindi ? service.itineraryHi || service.itineraryEn : service.itineraryEn;
  const samagri = isHindi ? service.samagriHi || service.samagriEn : service.samagriEn;

  const plansDto: PlanDTO[] = service.plans.map((p) => ({
    id: p.id,
    slug: p.slug,
    titleEn: p.titleEn,
    titleHi: p.titleHi,
    descriptionEn: p.descriptionEn,
    descriptionHi: p.descriptionHi,
    pricePaise: p.pricePaise,
    originalPricePaise: p.originalPricePaise ?? null,
    deliveryDays: p.deliveryDays,
    pages: p.pages ?? null,
    hasCall: p.hasCall,
    callDurationMinutes: p.callDurationMinutes ?? null,
    featuresEn: p.featuresEn,
    featuresHi: p.featuresHi,
    isPopular: p.isPopular,
    orderIndex: p.orderIndex,
  }));

  const lowestPrice =
    service.plans.length > 0
      ? Math.min(...service.plans.map((p) => p.pricePaise))
      : null;

  return (
    <div className="w-full flex flex-col text-on-surface text-left">
      {/* 1. Universal Back/Next Breadcrumbs Navigation Strip (#45) */}
      <SubPageNav
        breadcrumbs={[
          { label: isHindi ? "वैदिक सेवाएँ" : "Vedic Services", href: "/services" },
          { label: title },
        ]}
        backHref="/services"
        backLabel={isHindi ? "सभी सेवाएँ" : "All Services"}
        nextHref={nextService ? `/services/${nextService.slug}` : undefined}
        nextLabel={nextService ? `${isHindi ? "अगली सेवा: " : "Next: "}${nextService.title}` : undefined}
        locale={locale}
      />

      {/* 2. Main Two-Column Showcase Area */}
      <section className="w-full px-4 sm:px-8 lg:px-12 pt-8 pb-12 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Pane (70% ~ 8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-8 text-left">
            {/* Headline, Tagline, & Quick Enquiry Action */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-outline-variant/30">
              <div className="space-y-1">
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary tracking-tight">
                  {title}
                </h1>
                {tagline && (
                  <div className="text-base sm:text-lg text-primary font-medium">
                    {tagline}
                  </div>
                )}
              </div>

              {/* Service Quick Enquiry Button (#35) */}
              <button
                type="button"
                onClick={() => setEnquiryModalOpen(true)}
                className="self-start px-4 py-2 rounded-xl border border-secondary text-secondary hover:bg-brand-hover hover:text-on-brand transition-colors text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{isHindi ? "सेवा पूछताछ करें" : "Quick Enquiry"}</span>
              </button>
            </div>

            {/* Optional Editorial Notes */}
            {notes && (
              <div className="p-5 bg-surface-container-low rounded-xl border-l-4 border-l-secondary border border-outline-variant/40 text-left">
                <p className="text-xs sm:text-sm text-secondary font-medium leading-relaxed whitespace-pre-line">
                  {notes}
                </p>
              </div>
            )}

            {/* Service Main Description */}
            <div className="text-sm sm:text-base text-on-surface leading-relaxed text-left whitespace-pre-line">
              {description}
            </div>

            {/* Service Highlights */}
            {highlights && highlights.length > 0 && (
              <div className="pt-2 text-left space-y-3">
                <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>{isHindi ? "मुख्य सेवा विशेषताएँ" : "Key Service Inclusions"}</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlights.map((highlight, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/40 flex items-start gap-2.5 text-xs text-on-surface"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="leading-snug">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Itinerary Section (#12, #17) */}
            {itinerary && (
              <div className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-3 shadow-xs">
                <h2 className="font-serif text-base font-bold text-secondary flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-primary" />
                  <span>{isHindi ? "परामर्श एवं अनुष्ठान कार्ययोजना (Itinerary)" : "Service Execution Itinerary"}</span>
                </h2>
                <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {itinerary}
                </p>
              </div>
            )}

            {/* Sacred Puja Samagri List Section (#12, #17) */}
            {samagri && (
              <div className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-3 shadow-xs">
                <h2 className="font-serif text-base font-bold text-secondary flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span>{isHindi ? "आवश्यक शास्त्रसम्मत पूजन सामग्री (Sacred Samagri)" : "Sacred Puja Samagri & Requirements"}</span>
                </h2>
                <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {samagri}
                </p>
              </div>
            )}

            {/* YouTube Video Discourse Embed (#12, #47) */}
            {service.youtubeUrl && (
              <div className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-3 shadow-xs">
                <h2 className="font-serif text-base font-bold text-secondary flex items-center gap-2">
                  <Video className="w-4 h-4 text-primary" />
                  <span>{isHindi ? "सेवा संबंधी व्याख्यान / वीडियो" : "Video Discourse & Explanation"}</span>
                </h2>
                <YouTubeEmbed url={service.youtubeUrl} title="Service Video" isHindi={isHindi} />
              </div>
            )}

            {/* Additional Links & References (#12, #47) */}
            {normalizeLinks(service.additionalLinks).length > 0 && (
              <div className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-3 shadow-xs">
                <LinkList
                  links={normalizeLinks(service.additionalLinks)}
                  isHindi={isHindi}
                  heading={isHindi ? "अतिरिक्त संदर्भ एवं सहयोगी लिंक" : "Additional References & Links"}
                />
              </div>
            )}

            {/* Plan images, videos and links */}
            {service.plans
              .filter((p) => p.imageUrl || p.youtubeUrl || normalizeLinks(p.additionalLinks).length > 0)
              .map((p) => (
                <div key={p.id} className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-3 shadow-xs">
                  <h2 className="font-serif text-base font-bold text-secondary">
                    {isHindi ? p.titleHi : p.titleEn}
                  </h2>
                  {isSafeImageSrc(p.imageUrl) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={isHindi ? p.titleHi : p.titleEn}
                      loading="lazy"
                      className="w-full max-h-[420px] object-cover rounded-xl border border-outline-variant/40"
                    />
                  )}
                  <YouTubeEmbed url={p.youtubeUrl} title={isHindi ? p.titleHi : p.titleEn} isHindi={isHindi} />
                  <LinkList links={normalizeLinks(p.additionalLinks)} isHindi={isHindi} />
                </div>
              ))}
          </div>

          {/* Right Pane (30% ~ 4 cols): Overview Data */}
          <div className="lg:col-span-4 bg-surface-container-low rounded-2xl border border-secondary/30 p-6 flex flex-col space-y-5 text-left shadow-sm">
            <div className="border-b border-outline-variant/50 pb-3">
              <div className="text-xs uppercase tracking-wider text-secondary font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-primary" />
                <span>{isHindi ? "संस्करण एवं परामर्श विवरण" : "Consultation Overview"}</span>
              </div>
            </div>

            {/* Starting Dakshina */}
            {lowestPrice !== null && (
              <div className="p-4 rounded-xl border border-outline-variant/50 bg-surface text-left">
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

            {/* Available Plans List */}
            <div className="space-y-3 text-xs text-on-surface-variant text-left">
              <div className="font-bold uppercase tracking-wider text-secondary text-[11px]">
                {isHindi ? "उपलब्ध परामर्श प्रारूप" : "Available Consultation Formats"}
              </div>

              {service.plans.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 bg-surface rounded-xl border border-outline-variant/40 text-left space-y-2"
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

                  {/* Plan Program or Preparation snippets (#17) */}
                  {(p.programEn || p.programHi) && (
                    <div className="text-[11px] text-on-surface-variant/90 border-t border-outline-variant/20 pt-1.5">
                      <span className="font-semibold text-secondary">
                        {isHindi ? "विधान: " : "Program: "}
                      </span>
                      <span>{isHindi ? p.programHi || p.programEn : p.programEn}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Consultation CTA */}
            <button
              type="button"
              onClick={() => setEnquiryModalOpen(true)}
              className="w-full py-3 rounded-xl border border-secondary text-secondary hover:bg-brand-hover hover:text-on-brand transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{isHindi ? "विशेष परामर्श पूछताछ" : "Ask About This Service"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Interactive Plan Selector & Sticky Bar */}
      <section className="w-full bg-surface-container-low/60 border-t border-secondary/20 py-12 text-left">
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <PlanSelectorInteractive
            plans={plansDto}
            serviceSlug={service.slug}
            serviceTitle={title}
            locale={locale}
          />
        </div>
      </section>

      {/* Service Enquiry Modal (#35) */}
      <ServiceEnquiryModal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        serviceTitle={title}
        locale={locale}
      />
    </div>
  );
}
