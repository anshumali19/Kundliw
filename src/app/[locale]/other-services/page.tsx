import { setRequestLocale } from "next-intl/server";
import { RichText } from "@/components/content/RichText";
import { pageAlternates } from "@/lib/seo";
import { LinkList, YouTubeEmbed } from "@/components/content/MediaView";
import { isSafeImageSrc, normalizeLinks } from "@/lib/content/media";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SubPageNav } from "@/components/layout/SubPageNav";
import {
  Compass,
  ExternalLink,
  Video,
  Sparkles,
  MapPin,
  Heart,
  Youtube,
  Globe,
  ArrowRight,
} from "lucide-react";


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
    alternates: pageAlternates(locale, "/other-services"),
    title: isHindi
      ? "अन्य धार्मिक एवं आध्यात्मिक सेवाएँ • महर्षि कणाद ज्योतिष केंद्र"
      : "Other Vedic & Allied Services • Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "भारत दर्शन तीर्थ यात्रा, वैदिक विवाह संस्कार एवं धार्मिक वीडियो प्रवचन।"
      : "Bharat Darshan Teerth Yatra, Vedic Matrimonial Services, and Astrological Video Discourses.",
  };
}

export default async function OtherServicesPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;
  setRequestLocale(params.locale);

  const {
    locale
  } = params;

  const isHindi = locale === "hi";

  const dbItems = await prisma.otherService
    .findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
    })
    .catch(() => []);

  const items = dbItems;

  return (
    <div className="w-full flex flex-col text-on-surface text-left">
      {/* 1. Universal Back/Next Navigation Bar (#45) */}
      <SubPageNav
        breadcrumbs={[{ label: isHindi ? "अन्य सेवाएँ" : "Other Services" }]}
        backHref="/services"
        backLabel={isHindi ? "मुख्य सेवाएँ" : "Main Services"}
        nextHref="/kundli/astrosage"
        nextLabel={isHindi ? "एस्ट्रोसेज सॉफ्टवेयर" : "AstroSage Tool"}
        locale={locale}
      />

      {/* 2. Page Header */}
      <section className="w-full bg-surface border-b border-outline-variant/30 py-8 px-4 sm:px-8 lg:px-12 text-left">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold">
            <Sparkles className="w-4 h-4" />
            <span>{isHindi ? "संबद्ध आध्यात्मिक प्रकल्प" : "Allied Spiritual Initiatives"}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
            {isHindi ? "अन्य सेवाएँ एवं सहयोगी प्रकल्प" : "Other Services & Allied Projects"}
          </h1>

          <p className="text-sm text-on-surface-variant leading-relaxed">
            {isHindi
              ? "महर्षि कणाद ज्योतिष केंद्र के अंतर्गत संचालित तीर्थ यात्रा, वैवाहिक संस्कार मंच एवं धार्मिक व्याख्यान चैनल।"
              : "Explore our pilgrimage services, matrimonial alliances portal, and authenticated spiritual discourse channels."}
          </p>
        </div>
      </section>

      {/* 3. Items Cards & Video Grid */}
      <section className="w-full py-10 px-4 sm:px-8 lg:px-12 bg-surface-container-low/40">
        <div className="space-y-8 max-w-7xl mx-auto">
          {items.map((item, idx) => {
            const title = isHindi ? item.titleHi : item.titleEn;
            const tagline = isHindi ? item.taglineHi : item.taglineEn;
            const description = isHindi ? item.descriptionHi : item.descriptionEn;
            const actionText = isHindi ? item.actionTextHi : item.actionTextEn;

            return (
              <div
                key={item.id || idx}
                className="bg-surface rounded-2xl border border-outline-variant/50 p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row gap-8 items-start"
              >
                {/* Left/Main Column: Text & Outbound CTA */}
                <div className="flex-1 space-y-4 text-left">
                  <div className="space-y-1">
                    {tagline && (
                      <span className="text-xs uppercase tracking-wider text-primary font-bold">
                        {tagline}
                      </span>
                    )}
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">
                      {title}
                    </h2>
                  </div>

                  <div className="text-sm text-on-surface-variant leading-relaxed space-y-2">
                    <RichText text={description} />
                  </div>

                  {item.actionUrl && (
                    <div className="pt-2">
                      <a
                        href={item.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-on-brand hover:bg-brand-hover transition-colors font-semibold text-xs shadow-sm"
                      >
                        <span>{actionText || (isHindi ? "पोर्टल पर जाएं" : "Visit Portal")}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Right Column: image, YouTube video and extra links (#13, #47) */}
                <div className="w-full lg:w-96 shrink-0 space-y-3">
                  {isSafeImageSrc(item.imageUrl) && (
                    <div className="rounded-xl overflow-hidden border border-outline-variant/40 aspect-video bg-surface-container shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={title} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <YouTubeEmbed url={item.youtubeUrl} title={title} isHindi={isHindi} />
                  {!isSafeImageSrc(item.imageUrl) && !item.youtubeUrl && (
                    <div className="rounded-xl border border-secondary/20 bg-surface-container-low aspect-video flex items-center justify-center font-serif text-3xl text-secondary font-bold">
                      ॐ
                    </div>
                  )}
                  <LinkList links={normalizeLinks(item.additionalLinks)} isHindi={isHindi} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
