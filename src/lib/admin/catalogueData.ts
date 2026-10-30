import { prisma } from "@/lib/prisma";
import { bookedSeatsByPackage } from "@/lib/booking/packageAvailability";
import type { AdminServiceItem, AdminOfferRef } from "@/features/admin/services/AdminServicesManager";

/** Everything the Services, Packages and Plans admin pages show, in one read. */
export async function loadAdminCatalogue(): Promise<{ servicesData: AdminServiceItem[]; offerRefs: AdminOfferRef[] }> {
  // Fetch all services with plans and historical order count
  const services = await prisma.service.findMany({
    include: {
      plans: {
        orderBy: { orderIndex: "asc" },
      },
      packages: {
        orderBy: { orderIndex: "asc" },
      },
      _count: {
        select: { orders: true },
      },
    },
    orderBy: { orderIndex: "asc" },
  });

  const booked = await bookedSeatsByPackage(services.flatMap((s) => s.packages.map((k) => k.id)));

  const servicesData: AdminServiceItem[] = services.map((s) => ({
    id: s.id,
    slug: s.slug,
    titleEn: s.titleEn,
    titleHi: s.titleHi,
    taglineEn: s.taglineEn,
    taglineHi: s.taglineHi,
    descriptionEn: s.descriptionEn,
    descriptionHi: s.descriptionHi,
    highlightsEn: s.highlightsEn || [],
    highlightsHi: s.highlightsHi || [],
    notesEn: s.notesEn,
    notesHi: s.notesHi,
    icon: s.icon,
    imageUrl: s.imageUrl,
    youtubeUrl: s.youtubeUrl,
    additionalLinks: s.additionalLinks,
    itineraryEn: s.itineraryEn,
    itineraryHi: s.itineraryHi,
    samagriEn: s.samagriEn,
    samagriHi: s.samagriHi,
    orderIndex: s.orderIndex,
    isActive: s.isActive,
    packages: s.packages.map((k) => ({
      id: k.id,
      slug: k.slug,
      titleEn: k.titleEn,
      titleHi: k.titleHi,
      descriptionEn: k.descriptionEn,
      descriptionHi: k.descriptionHi,
      numberOfDays: k.numberOfDays,
      startDate: k.startDate ? k.startDate.toISOString() : null,
      endDate: k.endDate ? k.endDate.toISOString() : null,
      seats: k.seats,
      booked: booked[k.id] ?? 0,
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
      orderIndex: k.orderIndex,
      isActive: k.isActive,
    })),
    plans: s.plans.map((p) => ({
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
      isPopular: p.isPopular,
      orderIndex: p.orderIndex,
      isActive: p.isActive,
    })),
    _count: s._count,
  }));


  const offers = await prisma.offer.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, code: true, titleEn: true, titleHi: true, serviceSlugs: true, planIds: true, isActive: true } });
  return { servicesData, offerRefs: offers };
}
