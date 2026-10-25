import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServiceDetailView, ServiceDetailDTO } from "@/features/services/components/ServiceDetailView";

export const dynamic = "force-dynamic";

interface ServiceDetailPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export default async function ServiceDetailPage({
  params: { locale, slug },
}: ServiceDetailPageProps) {
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

  if (!service || !service.isActive) {
    notFound();
  }

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
    additionalLinks: service.additionalLinks as any,
    plans: service.plans.map((p) => ({
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
    })),
  };

  return (
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
  );
}
