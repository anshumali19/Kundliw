import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { AdminOffersManager, AdminOfferItem } from "@/features/admin/offers/AdminOffersManager";

interface AdminOffersPageProps {
  params: {
    locale: string;
  };
}

export const dynamic = "force-dynamic";

export default async function AdminOffersPage({
  params: { locale },
}: AdminOffersPageProps) {
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
    usedCount: o.usedCount,
    validFrom: o.validFrom.toISOString(),
    validUntil: o.validUntil ? o.validUntil.toISOString() : null,
    isActive: o.isActive,
    _count: o._count,
  }));

  return <AdminOffersManager initialOffers={offersData} locale={locale} />;
}
