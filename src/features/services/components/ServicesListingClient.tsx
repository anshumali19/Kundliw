"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { formatPaiseToInr } from "@/lib/billing/gst";
import {
  LayoutGrid,
  List,
  Clock,
  Compass,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Video,
} from "lucide-react";
import { SubPageNav } from "@/components/layout/SubPageNav";
import { ServiceEnquiryModal } from "./ServiceEnquiryModal";

export interface SerializedPackage {
  id: string;
  slug: string;
  titleEn: string;
  titleHi: string;
  descriptionEn?: string | null;
  descriptionHi?: string | null;
}

export interface SerializedPlan {
  packageId?: string | null;
  id: string;
  slug: string;
  titleEn: string;
  titleHi: string;
  pricePaise: number;
  originalPricePaise?: number | null;
  deliveryDays: number;
  pages?: number | null;
  hasCall: boolean;
  callDurationMinutes?: number | null;
  featuresEn: string[];
  featuresHi: string[];
  isPopular: boolean;
}

export interface SerializedService {
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
  icon?: string | null;
  imageUrl?: string | null;
  itineraryEn?: string | null;
  itineraryHi?: string | null;
  samagriEn?: string | null;
  samagriHi?: string | null;
  youtubeUrl?: string | null;
  plans: SerializedPlan[];
  packages?: SerializedPackage[];
}

export interface ServicesListingClientProps {
  services: SerializedService[];
  locale: string;
  eyebrow: string;
  heading: string;
  subheading: string;
}

export function ServicesListingClient({
  services,
  locale,
  eyebrow,
  heading,
  subheading,
}: ServicesListingClientProps) {
  const isHindi = locale === "hi";

  // Persistent view preference ("grid" | "list")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMounted, setIsMounted] = useState(false);

  // Enquiry modal state
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [selectedServiceTitle, setSelectedServiceTitle] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("kanad_service_view_pref");
    if (saved === "grid" || saved === "list") {
      setViewMode(saved);
    }
  }, []);

  const handleToggleView = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("kanad_service_view_pref", mode);
  };

  const handleOpenEnquiry = (title: string) => {
    setSelectedServiceTitle(title);
    setEnquiryModalOpen(true);
  };

  return (
    <div className="w-full flex flex-col text-on-surface text-left">
      {/* 1. Universal Back/Next Navigation Bar (#45) */}
      <SubPageNav
        breadcrumbs={[{ label: isHindi ? "वैदिक सेवाएँ" : "Vedic Services" }]}
        backHref="/"
        backLabel={isHindi ? "मुख्य पृष्ठ" : "Home"}
        nextHref="/other-services"
        nextLabel={isHindi ? "अन्य सेवाएँ" : "Other Services"}
        locale={locale}
      />

      {/* 2. Hero Headline Area with View Mode Toggle */}
      <section className="w-full bg-surface border-b border-outline-variant/30 py-8 px-4 sm:px-8 lg:px-12">
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest text-primary font-bold">
              {eyebrow}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-secondary font-bold mt-1 tracking-tight">
              {heading}
            </h1>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              {subheading}
            </p>
          </div>

          {/* View Mode Toggle Switch (#36) */}
          <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 self-start md:self-end shrink-0">
            <span className="text-[11px] font-semibold text-on-surface-variant px-2 hidden sm:inline">
              {isHindi ? "दृश्य प्रारूप:" : "View:"}
            </span>
            <button
              type="button"
              onClick={() => handleToggleView("grid")}
              className={`p-2 min-w-[44px] min-h-[44px] justify-center rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
                viewMode === "grid"
                  ? "bg-brand text-on-brand shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              title={isHindi ? "ग्रिड दृश्य (Grid View)" : "Grid View"}
              aria-label="Grid View"
              aria-pressed={viewMode === "grid"}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">{isHindi ? "ग्रिड" : "Grid"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleView("list")}
              className={`p-2 min-w-[44px] min-h-[44px] justify-center rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-brand text-on-brand shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              title={isHindi ? "सूची दृश्य (List View)" : "List View"}
              aria-label="List View"
              aria-pressed={viewMode === "list"}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">{isHindi ? "सूची" : "List"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Services Listing (Grid or List View) */}
      <section className="w-full py-10 bg-surface-container-low/40 px-4 sm:px-8 lg:px-12">
        {services.length === 0 ? (
          <div className="p-12 text-center bg-surface rounded-2xl border border-outline-variant/60 flex flex-col items-center justify-center">
            <AlertCircle className="w-10 h-10 text-outline mb-2" />
            <h3 className="font-serif text-lg font-bold text-secondary">
              {isHindi ? "वर्तमान में कोई सेवा उपलब्ध नहीं है" : "No services currently available"}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              {isHindi
                ? "कृपया कुछ समय पश्चात पुनः प्रयास करें।"
                : "Please check back shortly or contact our helpline."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const title = isHindi ? service.titleHi : service.titleEn;
              const tagline = isHindi ? service.taglineHi : service.taglineEn;
              const description = isHindi ? service.descriptionHi : service.descriptionEn;
              const highlights = isHindi ? service.highlightsHi : service.highlightsEn;

              const lowestPrice =
                service.plans.length > 0
                  ? Math.min(...service.plans.map((p) => p.pricePaise))
                  : null;

              return (
                <div
                  key={service.id}
                  className="bg-surface rounded-2xl border border-outline-variant/50 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Top Accent & Image/Icon */}
                    {service.imageUrl ? (
                      <div className="h-44 w-full overflow-hidden bg-surface-container">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={service.imageUrl}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-28 w-full bg-gradient-to-r from-secondary/10 via-primary/5 to-surface-container flex items-center justify-center border-b border-outline-variant/20">
                        <span className="w-14 h-14 rounded-2xl bg-surface border border-secondary/20 flex items-center justify-center font-serif text-2xl text-secondary shadow-xs font-bold">
                          ॐ
                        </span>
                      </div>
                    )}

                    <div className="p-6 space-y-4">
                      <div>
                        {tagline && (
                          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                            {tagline}
                          </span>
                        )}
                        <h2 className="font-serif text-xl font-bold text-secondary mt-1 group-hover:text-primary transition-colors">
                          <Link href={`/services/${service.slug}`}>{title}</Link>
                        </h2>
                      </div>

                      <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                        {description}
                      </p>

                      {/* Highlights */}
                      {highlights && highlights.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-outline-variant/30">
                          {highlights.slice(0, 3).map((h, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-on-surface">
                              <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{h}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Price starting from */}
                      {lowestPrice !== null && (
                        <div className="pt-3 border-t border-outline-variant/30 flex items-baseline justify-between">
                          <span className="text-xs text-on-surface-variant">
                            {isHindi ? "प्रारंभिक दक्षिणा:" : "Starting from:"}
                          </span>
                          <span className="font-serif text-lg font-bold text-secondary">
                            {formatPaiseToInr(lowestPrice)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 bg-surface-container-low/60 border-t border-outline-variant/30 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEnquiry(title)}
                      className="flex-1 py-2 px-3 rounded-xl border border-outline-variant bg-surface text-secondary hover:bg-brand-hover hover:text-on-brand transition-colors text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{isHindi ? "पूछताछ करें" : "Enquire"}</span>
                    </button>
                    <Link
                      href={`/services/${service.slug}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-brand text-on-brand hover:bg-brand-hover transition-colors text-xs font-semibold flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span>{isHindi ? "विवरण देखें" : "View Plans"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View Mode (#36) */
          <div className="space-y-4">
            {services.map((service) => {
              const title = isHindi ? service.titleHi : service.titleEn;
              const tagline = isHindi ? service.taglineHi : service.taglineEn;
              const description = isHindi ? service.descriptionHi : service.descriptionEn;
              const highlights = isHindi ? service.highlightsHi : service.highlightsEn;

              const lowestPrice =
                service.plans.length > 0
                  ? Math.min(...service.plans.map((p) => p.pricePaise))
                  : null;

              return (
                <div
                  key={service.id}
                  className="p-6 rounded-2xl bg-surface border border-outline-variant/50 hover:border-primary/50 transition-all duration-300 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
                    {/* Icon or Thumbnail */}
                    {service.imageUrl ? (
                      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={service.imageUrl}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-surface-container-low border border-secondary/20 flex items-center justify-center shrink-0 font-serif text-2xl text-secondary font-bold">
                        ॐ
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {tagline && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand/10 text-primary">
                            {tagline}
                          </span>
                        )}
                        <h2 className="font-serif text-xl font-bold text-secondary hover:text-primary transition-colors">
                          <Link href={`/services/${service.slug}`}>{title}</Link>
                        </h2>
                      </div>

                      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed max-w-3xl">
                        {description}
                      </p>

                      {/* Highlight Chips */}
                      {highlights && highlights.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          {highlights.slice(0, 4).map((h, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface"
                            >
                              <CheckCircle2 className="w-3 h-3 text-secondary" />
                              <span>{h}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Pricing & CTAs */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 w-full lg:w-auto shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-outline-variant/30">
                    {lowestPrice !== null && (
                      <div className="text-left lg:text-right">
                        <span className="text-[11px] text-on-surface-variant block">
                          {isHindi ? "प्रारंभिक दक्षिणा" : "Starting from"}
                        </span>
                        <span className="font-serif text-2xl font-bold text-secondary">
                          {formatPaiseToInr(lowestPrice)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleOpenEnquiry(title)}
                        className="py-2.5 px-4 rounded-xl border border-outline-variant text-secondary hover:bg-brand-hover hover:text-on-brand transition-colors text-xs font-semibold flex items-center gap-1 shadow-xs"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{isHindi ? "पूछताछ" : "Enquire"}</span>
                      </button>

                      <Link
                        href={`/services/${service.slug}`}
                        className="py-2.5 px-5 rounded-xl bg-brand text-on-brand hover:bg-brand-hover transition-colors text-xs font-semibold flex items-center gap-1 shadow-xs"
                      >
                        <span>{isHindi ? "संस्करण चुनें" : "View Plans"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* All plans, grouped by service (target of the "Plans" menu item) */}
      <section id="plans" className="scroll-mt-32 w-full px-4 sm:px-8 lg:px-12 pb-16">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary font-bold">{isHindi ? "सभी प्लान" : "All plans"}</div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-secondary mt-1">
              {isHindi ? "सभी सेवाओं के प्लान और दक्षिणा" : "Plans and prices for every service"}
            </h2>
          </div>
          {services.filter((s) => s.plans.length > 0).length === 0 && (
            <p className="text-sm text-on-surface-variant">{isHindi ? "अभी कोई प्लान उपलब्ध नहीं है।" : "No plans are available right now."}</p>
          )}
          {services
            .filter((s) => s.plans.length > 0)
            .map((s) => (
              <div key={s.id} className="rounded-xl border border-outline-variant/50 bg-surface overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-surface-container-low border-b border-outline-variant/40">
                  <h3 className="font-serif text-lg font-bold text-secondary">{isHindi ? s.titleHi : s.titleEn}</h3>
                  <Link href={`/services/${s.slug}`} className="text-xs font-bold text-primary hover:underline">
                    {isHindi ? "विवरण देखें →" : "View details →"}
                  </Link>
                </div>
                <ul className="divide-y divide-outline-variant/30">
                  {s.plans.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-on-surface text-sm">
                          {isHindi ? p.titleHi : p.titleEn}
                          {p.isPopular && (
                            <span className="ml-2 text-[10px] font-bold uppercase bg-brand text-on-brand rounded-full px-2 py-0.5">{isHindi ? "लोकप्रिय" : "Popular"}</span>
                          )}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          {p.deliveryDays} {isHindi ? "कार्यदिवस" : "working days"}
                          {p.hasCall && p.callDurationMinutes ? ` · ${p.callDurationMinutes} ${isHindi ? "मिनट परामर्श" : "min call"}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-lg font-bold text-secondary">{formatPaiseToInr(p.pricePaise)}</span>
                        <Link
                          href={`/booking?service=${encodeURIComponent(s.slug)}&plan=${encodeURIComponent(p.slug)}`}
                          className="min-h-[40px] inline-flex items-center px-4 rounded bg-brand text-on-brand hover:bg-brand-hover text-xs font-bold"
                        >
                          {isHindi ? "बुक करें" : "Book"}
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </section>

      {/* All packages, grouped by service (target of the "Packages" menu item) */}
      <section id="packages" className="scroll-mt-32 w-full px-4 sm:px-8 lg:px-12 pb-16">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary font-bold">{isHindi ? "सभी पैकेज" : "All packages"}</div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-secondary mt-1">
              {isHindi ? "हर सेवा के पैकेज" : "Packages for every service"}
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              {isHindi ? "सेवा → पैकेज → प्लान। पैकेज चुनकर उसके प्लान देखें।" : "Service → Package → Plan. Pick a package to see its plans."}
            </p>
          </div>
          {services.filter((s) => (s.packages ?? []).length > 0).length === 0 && (
            <p className="text-sm text-on-surface-variant">{isHindi ? "अभी कोई पैकेज उपलब्ध नहीं है।" : "No packages are available right now."}</p>
          )}
          {services
            .filter((s) => (s.packages ?? []).length > 0)
            .map((s) => (
              <div key={s.id} className="rounded-xl border border-outline-variant/50 bg-surface overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-surface-container-low border-b border-outline-variant/40">
                  <h3 className="font-serif text-lg font-bold text-secondary">{isHindi ? s.titleHi : s.titleEn}</h3>
                  <Link href={`/services/${s.slug}`} className="text-xs font-bold text-primary hover:underline">
                    {isHindi ? "सेवा देखें →" : "View service →"}
                  </Link>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                  {(s.packages ?? []).map((k) => {
                    const inPkg = s.plans.filter((p) => p.packageId === k.id);
                    const from = inPkg.length ? Math.min(...inPkg.map((p) => p.pricePaise)) : null;
                    const desc = isHindi ? k.descriptionHi || k.descriptionEn : k.descriptionEn || k.descriptionHi;
                    return (
                      <li key={k.id}>
                        <Link
                          href={`/services/${s.slug}?package=${encodeURIComponent(k.id)}`}
                          className="block h-full rounded-lg border border-outline-variant/60 bg-surface-container-low/60 p-4 hover:bg-gold/20 hover:border-saffron/60 transition-colors min-h-[44px]"
                        >
                          <div className="font-serif font-bold text-secondary">{isHindi ? k.titleHi : k.titleEn}</div>
                          {desc && <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{desc}</p>}
                          <div className="mt-2 text-xs text-on-surface-variant">
                            {inPkg.length} {isHindi ? "प्लान" : inPkg.length === 1 ? "plan" : "plans"}
                            {from !== null ? ` · ${isHindi ? "शुरू" : "from"} ${formatPaiseToInr(from)}` : ""}
                          </div>
                          <div className="mt-2 text-xs font-bold text-primary">{isHindi ? "प्लान देखें →" : "See plans →"}</div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
        </div>
      </section>

      {/* Service Enquiry Modal (#35) */}
      <ServiceEnquiryModal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        serviceTitle={selectedServiceTitle}
        locale={locale}
      />
    </div>
  );
}
