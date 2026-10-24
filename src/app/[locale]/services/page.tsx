import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { formatPaiseToInr } from "@/lib/billing/gst";
import {
  Compass,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const revalidate = 60; // ISR cache revalidation every minute

export default async function ServicesListingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const tCommon = await getTranslations("common");
  const tServices = await getTranslations("servicesSection");

  const isHindi = locale === "hi";

  // Query only active services and their active plans
  const services = await prisma.service.findMany({
    where: { isActive: true },
    include: {
      plans: {
        where: { isActive: true },
        orderBy: { orderIndex: "asc" },
      },
    },
    orderBy: { orderIndex: "asc" },
  });

  return (
    <div className="w-full flex flex-col text-on-surface text-left">
      {/* 1. Header Breadcrumb & Category Bar */}
      <section className="w-full bg-surface-container-low border-b border-secondary/20 py-4">
        <div className="w-full px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-on-surface-variant font-medium">
            <Link href="/" className="hover:text-primary transition-colors">
              {isHindi ? "मुख्य पृष्ठ" : "Home"}
            </Link>
            <span>/</span>
            <span className="text-secondary font-bold">
              {isHindi ? "वैदिक सेवाएँ" : "Vedic Services"}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-surface px-3 py-1 rounded border border-outline-variant/50 text-xs text-on-surface-variant">
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span>{isHindi ? "सूर्य सिद्धान्त सम्मत शास्त्रीय परामर्श" : "Surya Siddhanta Canonical Astrological Advisory"}</span>
          </div>
        </div>
      </section>

      {/* 2. Hero Headline Area */}
      <section className="w-full bg-surface border-b border-outline-variant/30 py-10">
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest text-primary font-bold">
              {tServices("eyebrow")}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-secondary font-bold mt-1 tracking-tight">
              {tServices("heading")}
            </h1>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              {tServices("subheading")}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Services Grid */}
      <section className="w-full py-12 bg-surface-container-low/40">
        <div className="w-full px-4 sm:px-8 lg:px-12">
          {services.length === 0 ? (
            <div className="p-12 text-center bg-surface rounded border border-outline-variant/60 flex flex-col items-center justify-center">
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
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {services.map((service, index) => {
                const title = isHindi ? service.titleHi : service.titleEn;
                const tagline = isHindi ? service.taglineHi : service.taglineEn;
                const description = isHindi ? service.descriptionHi : service.descriptionEn;

                // Lowest starting price among active plans
                const startingPlan = service.plans[0];
                const startingPriceFormatted = startingPlan
                  ? formatPaiseToInr(startingPlan.pricePaise)
                  : null;

                return (
                  <div
                    key={service.id}
                    className="bg-surface p-6 rounded border border-secondary/40 flex flex-col justify-between hover:border-secondary transition-colors"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-secondary font-serif font-bold text-base">
                            {index + 1}
                          </span>
                          <div>
                            <h2 className="font-serif text-lg font-bold text-secondary">
                              {title}
                            </h2>
                            {tagline && (
                              <div className="text-xs text-primary font-semibold">
                                {tagline}
                              </div>
                            )}
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded bg-surface-container-high text-secondary text-[11px] font-semibold tracking-wider">
                          {service.plans.length} {isHindi ? "संस्करण" : "Tiers"}
                        </span>
                      </div>

                      {/* Editorial Description */}
                      <p className="text-xs sm:text-sm text-on-surface mb-4 leading-relaxed mt-2">
                        {description}
                      </p>

                      {/* Available Plans Micro-Pills */}
                      <div className="border-t border-b border-outline-variant/40 py-3 mb-5 space-y-2">
                        <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold block">
                          {isHindi ? "उपलब्ध परामर्श संस्करण:" : "Available Consultation Editions:"}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {service.plans.map((plan) => (
                            <span
                              key={plan.id}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border ${
                                plan.isPopular
                                  ? "bg-tertiary-fixed text-on-tertiary-fixed border-tertiary/40 font-bold"
                                  : "bg-surface-container text-on-surface border-outline-variant/60"
                              }`}
                            >
                              {plan.isPopular && <Sparkles className="w-3 h-3 text-primary" />}
                              <span>{isHindi ? plan.titleHi : plan.titleEn}</span>
                              <span className="font-bold">
                                ({formatPaiseToInr(plan.pricePaise)})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                          {isHindi ? "प्रारंभिक दक्षिणा" : "Starting Dakshina"}
                        </div>
                        <div className="font-serif text-lg text-secondary font-bold">
                          {startingPriceFormatted ? (
                            <>
                              {isHindi ? "मात्र " : "From "}
                              {startingPriceFormatted}
                            </>
                          ) : (
                            isHindi ? "परामर्श उपलब्ध" : "Consultation Available"
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/services/${service.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-secondary hover:bg-secondary/90 text-on-secondary text-xs uppercase tracking-wider rounded font-bold transition-colors min-h-[44px]"
                      >
                        <span>{isHindi ? "संस्करण चुनें व विवरण" : "Select Edition & Book"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
