import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { AdminOffersManager, AdminOfferItem } from "@/features/admin/offers/AdminOffersManager";

interface AdminOffersPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminOffersPage(props: AdminOffersPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  // Enforce DB-verified admin check
  await requireAdmin("/admin/offers", locale);

  const offers = await prisma.offer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { orders: true },
      },
    },
  });

  const offersData: AdminOfferItem[] = offers.map((o) => ({
    id: o.id,
    code: o.code,
    titleEn: o.titleEn,
    titleHi: o.titleHi,
    discountType: o.discountType,
    discountValuePaise: o.discountValuePaise,
    maxDiscountPaise: o.maxDiscountPaise,
    minOrderValuePaise: o.minOrderValuePaise,
    usageLimit: o.usageLimit,
    perUserLimit: o.perUserLimit,
    serviceSlugs: o.serviceSlugs,
    planIds: o.planIds,
    showOnPlan: o.showOnPlan,
    autoApply: o.autoApply,
    showInPopup: o.showInPopup,
    usedCount: o.usedCount,
    validFrom: o.validFrom.toISOString(),
    validUntil: o.validUntil ? o.validUntil.toISOString() : null,
    isActive: o.isActive,
    _count: o._count,
  }));

  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: "asc" },
    select: { slug: true, titleEn: true, titleHi: true, plans: { where: { isActive: true }, orderBy: { orderIndex: "asc" }, select: { id: true, titleEn: true, titleHi: true } } },
  });

  return <AdminOffersManager initialOffers={offersData} services={services} locale={locale} />;
}
