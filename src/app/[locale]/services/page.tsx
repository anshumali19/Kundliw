import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pageAlternates } from "@/lib/seo";
import { ServicesListingClient } from "@/features/services/components/ServicesListingClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isHindi = locale === "hi";
  return {
    title: isHindi
      ? "ज्योतिष सेवाएँ एवं प्लान | महर्षि कणाद ज्योतिष केंद्र"
      : "Astrology Services and Plans | Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "कुंडली, कुंडली मिलान, प्रश्न कुंडली और परामर्श सेवाएँ देखें, अपना प्लान चुनें और ऑनलाइन बुकिंग करें।"
      : "Browse Kundli, Kundli matching, Prashna Kundli and consultation services, choose a plan and book online.",
    alternates: pageAlternates(locale, "/services"),
  };
}

export default async function ServicesListingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const tServices = await getTranslations("servicesSection");

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

  const serialized = services.map((s) => ({
    id: s.id,
    slug: s.slug,
    titleEn: s.titleEn,
    titleHi: s.titleHi,
    taglineEn: s.taglineEn,
    taglineHi: s.taglineHi,
    descriptionEn: s.descriptionEn,
    descriptionHi: s.descriptionHi,
    highlightsEn: s.highlightsEn,
    highlightsHi: s.highlightsHi,
    icon: s.icon,
    imageUrl: s.imageUrl,
    itineraryEn: s.itineraryEn,
    itineraryHi: s.itineraryHi,
    samagriEn: s.samagriEn,
    samagriHi: s.samagriHi,
    youtubeUrl: s.youtubeUrl,
    plans: s.plans.map((p) => ({
      id: p.id,
      slug: p.slug,
      titleEn: p.titleEn,
      titleHi: p.titleHi,
      pricePaise: p.pricePaise,
      originalPricePaise: p.originalPricePaise,
      deliveryDays: p.deliveryDays,
      pages: p.pages,
      hasCall: p.hasCall,
      callDurationMinutes: p.callDurationMinutes,
      featuresEn: p.featuresEn,
      featuresHi: p.featuresHi,
      isPopular: p.isPopular,
    })),
  }));

  return (
    <ServicesListingClient
      services={serialized}
      locale={locale}
      eyebrow={tServices("eyebrow")}
      heading={tServices("heading")}
      subheading={tServices("subheading")}
    />
  );
}
