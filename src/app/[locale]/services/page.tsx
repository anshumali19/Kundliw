import { activePlanWhere } from "@/lib/content/packages";
import { bookedSeatsByPackage, computeAvailability } from "@/lib/booking/packageAvailability";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pageAlternates } from "@/lib/seo";
import { ServicesListingClient } from "@/features/services/components/ServicesListingClient";

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
      ? "ज्योतिष सेवाएँ एवं प्लान | महर्षि कणाद ज्योतिष केंद्र"
      : "Astrology Services and Plans | Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "कुंडली, कुंडली मिलान, प्रश्न कुंडली और परामर्श सेवाएँ देखें, अपना प्लान चुनें और ऑनलाइन बुकिंग करें।"
      : "Browse Kundli, Kundli matching, Prashna Kundli and consultation services, choose a plan and book online.",
    alternates: pageAlternates(locale, "/services"),
  };
}

export default async function ServicesListingPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const tServices = await getTranslations("servicesSection");

  // Query only active services and their active plans
  const services = await prisma.service.findMany({
    where: { isActive: true },
    include: {
      plans: {
        where: activePlanWhere,
        orderBy: { orderIndex: "asc" },
      },
      packages: {
        where: { isActive: true },
        orderBy: { orderIndex: "asc" },
        select: { id: true, slug: true, titleEn: true, titleHi: true, descriptionEn: true, descriptionHi: true, imageUrl: true, numberOfDays: true, startDate: true, endDate: true, seats: true },
      },
    },
    orderBy: { orderIndex: "asc" },
  });

  const seatsHeld = await bookedSeatsByPackage(services.flatMap((s) => s.packages.map((k) => k.id))).catch(() => ({} as Record<string, number>));

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
    packages: s.packages
      .filter((k) => s.plans.some((p) => p.packageId === k.id))
      .map((k) => {
        const a = computeAvailability(k, seatsHeld[k.id] ?? 0);
        return {
          id: k.id,
          slug: k.slug,
          titleEn: k.titleEn,
          titleHi: k.titleHi,
          descriptionEn: k.descriptionEn,
          descriptionHi: k.descriptionHi,
          imageUrl: k.imageUrl,
          numberOfDays: k.numberOfDays,
          startDate: k.startDate ? k.startDate.toISOString().slice(0, 10) : null,
          endDate: k.endDate ? k.endDate.toISOString().slice(0, 10) : null,
          seatsLeft: a.seatsLeft,
          status: a.status,
          reason: a.reason ?? null,
        };
      }),
    plans: s.plans.map((p) => ({
      packageId: p.packageId,
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
