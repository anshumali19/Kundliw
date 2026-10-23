import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { AdminServicesManager, AdminServiceItem } from "@/features/admin/services/AdminServicesManager";

interface AdminServicesPageProps {
  params: {
    locale: string;
  };
}

export const dynamic = "force-dynamic";

export default async function AdminServicesPage({
  params: { locale },
}: AdminServicesPageProps) {
  // Enforce DB-verified admin check
  await requireAdmin("/admin/services", locale);

  // Fetch all services with plans and historical order count
  const services = await prisma.service.findMany({
    include: {
      plans: {
        orderBy: { orderIndex: "asc" },
      },
      _count: {
        select: { orders: true },
      },
    },
    orderBy: { orderIndex: "asc" },
  });

  const servicesData: AdminServiceItem[] = services.map((s) => ({
    id: s.id,
    slug: s.slug,
    titleEn: s.titleEn,
    titleHi: s.titleHi,
    taglineEn: s.taglineEn,
    taglineHi: s.taglineHi,
    descriptionEn: s.descriptionEn,
    descriptionHi: s.descriptionHi,
    icon: s.icon,
    orderIndex: s.orderIndex,
    isActive: s.isActive,
    plans: s.plans.map((p) => ({
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
      isPopular: p.isPopular,
      orderIndex: p.orderIndex,
      isActive: p.isActive,
    })),
    _count: s._count,
  }));

  return <AdminServicesManager initialServices={servicesData} locale={locale} />;
}
