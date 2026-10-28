import { bookedSeatsByPackage, computeAvailability } from "@/lib/booking/packageAvailability";
import { activePlanWhere } from "@/lib/content/packages";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL, absoluteUrl, localizedPath, pageAlternates } from "@/lib/seo";
import { ServiceDetailView, ServiceDetailDTO } from "@/features/services/components/ServiceDetailView";

export const dynamic = "force-dynamic";

interface ServiceDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata(props: ServiceDetailPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale,
    slug
  } = params;

  const service = await prisma.service
    .findUnique({ where: { slug } })
    .catch(() => null);
  if (!service || !service.isActive) return {};

  const isHindi = locale === "hi";
  const title = isHindi ? service.titleHi : service.titleEn;
  const summary = (isHindi ? service.taglineHi : service.taglineEn) || (isHindi ? service.descriptionHi : service.descriptionEn);
  return {
    title: `${title} | ${isHindi ? "महर्षि कणाद ज्योतिष केंद्र" : "Maharshi Kanad Jyotish Kendra"}`,
    description: summary.length > 160 ? `${summary.slice(0, 157)}...` : summary,
    alternates: pageAlternates(locale, `/services/${slug}`),
    openGraph: service.imageUrl ? { images: [service.imageUrl] } : undefined,
  };
}

export default async function ServiceDetailPage(props: ServiceDetailPageProps) {
  const params = await props.params;

  const {
    locale,
    slug
  } = params;

  // Query service and active plans from DB
  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      plans: {
        where: activePlanWhere,
        orderBy: { orderIndex: "asc" },
      },
      packages: {
        where: { isActive: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (service) {
    // Plans of a package that is switched off are not offered
    const activePackageIds = new Set(service.packages.map((k) => k.id));
    service.plans = service.plans.filter((p) => !p.packageId || activePackageIds.has(p.packageId));
  }

  if (!service || !service.isActive) {
    notFound();
  }

  const booked = await bookedSeatsByPackage(service.packages.map((k) => k.id));

  // Find next active service for universal Next button (#45)
  const nextService = await prisma.service.findFirst({
    where: {
      isActive: true,
      orderIndex: { gt: service.orderIndex },
    },
    orderBy: { orderIndex: "asc" },
    select: { slug: true, titleEn: true, titleHi: true },
  });

  const isHindi = locale === "hi";

  const serviceDto: ServiceDetailDTO = {
    id: service.id,
    slug: service.slug,
    titleEn: service.titleEn,
    titleHi: service.titleHi,
    taglineEn: service.taglineEn,
    taglineHi: service.taglineHi,
    descriptionEn: service.descriptionEn,
    descriptionHi: service.descriptionHi,
    highlightsEn: service.highlightsEn,
    highlightsHi: service.highlightsHi,
    notesEn: service.notesEn,
    notesHi: service.notesHi,
    icon: service.icon,
    imageUrl: service.imageUrl,
    itineraryEn: service.itineraryEn,
    itineraryHi: service.itineraryHi,
    samagriEn: service.samagriEn,
    samagriHi: service.samagriHi,
    youtubeUrl: service.youtubeUrl,
    additionalLinks: service.additionalLinks,
    packages: service.packages.map((k) => ({
      id: k.id,
      titleEn: k.titleEn,
      titleHi: k.titleHi,
      descriptionEn: k.descriptionEn,
      descriptionHi: k.descriptionHi,
      numberOfDays: k.numberOfDays,
      startDate: k.startDate ? k.startDate.toISOString() : null,
      endDate: k.endDate ? k.endDate.toISOString() : null,
      itineraryDays: k.itineraryDays,
      inclusionsEn: k.inclusionsEn,
      inclusionsHi: k.inclusionsHi,
      exclusionsEn: k.exclusionsEn,
      exclusionsHi: k.exclusionsHi,
      materialsEn: k.materialsEn,
      materialsHi: k.materialsHi,
      youtubeUrl: k.youtubeUrl,
      imageUrl: k.imageUrl,
      additionalLinks: k.additionalLinks,
      availability: computeAvailability(k, booked[k.id] ?? 0),
    })),
    plans: service.plans.map((p) => ({
      id: p.id,
      packageId: p.packageId,
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
      programEn: p.programEn,
      programHi: p.programHi,
      preparationEn: p.preparationEn,
      preparationHi: p.preparationHi,
      samagriEn: p.samagriEn,
      samagriHi: p.samagriHi,
      itineraryEn: p.itineraryEn,
      itineraryHi: p.itineraryHi,
      isPopular: p.isPopular,
      orderIndex: p.orderIndex,
      imageUrl: p.imageUrl,
      youtubeUrl: p.youtubeUrl,
      additionalLinks: p.additionalLinks,
    })),
  };

  const prices = service.plans.map((p) => p.pricePaise / 100);
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: isHindi ? service.titleHi : service.titleEn,
    description: isHindi ? service.descriptionHi : service.descriptionEn,
    url: absoluteUrl(localizedPath(locale, `/services/${service.slug}`)),
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: "IN",
    ...(service.imageUrl ? { image: service.imageUrl } : {}),
    ...(prices.length
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "INR",
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
            offerCount: prices.length,
          },
        }
      : {}),
  };

  return (
    <>
      <JsonLd data={serviceJsonLd} />
      <ServiceDetailView
        service={serviceDto}
        nextService={
          nextService
            ? {
                slug: nextService.slug,
                title: isHindi ? nextService.titleHi : nextService.titleEn,
              }
            : null
        }
        locale={locale}
      />
     </>
  );
}
