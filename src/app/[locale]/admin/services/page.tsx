import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { bookedSeatsByPackage } from "@/lib/booking/packageAvailability";
import { AdminServicesManager, AdminServiceItem } from "@/features/admin/services/AdminServicesManager";

interface AdminServicesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminServicesPage(props: AdminServicesPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  // Enforce DB-verified admin check
  await requireAdmin("/admin/services", locale);

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

  return <AdminServicesManager initialServices={servicesData} locale={locale} />;
}
