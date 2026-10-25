import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import {
  AdminOrdersManager,
  SerializedOrder,
} from "@/features/admin/components/AdminOrdersManager";
import { CanonicalOrderStatus } from "@/lib/orders/status";

interface AdminOrdersPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage(props: AdminOrdersPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  await requireAdmin("/admin/orders", locale);
  const isHindi = locale === "hi";

  const rawOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      service: true,
      plan: true,
      user: true,
      statusEvents: {
        orderBy: { createdAt: "desc" },
        include: {
          changedBy: {
            select: { name: true, email: true },
          },
        },
      },
    },
    take: 100,
  });

  const orders: SerializedOrder[] = rawOrders.map((o) => {
    const j = (o.jatakaDetails as Record<string, unknown>) || {};
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      createdAt: o.createdAt.toISOString(),
      status: o.status as CanonicalOrderStatus,
      paymentMode: o.paymentMode,
      paymentStatus: o.paymentStatus,
      manualPaymentRef: o.manualPaymentRef,
      manualPaymentProof: o.manualPaymentProof,
      baseAmountPaise: o.baseAmountPaise,
      discountAmountPaise: o.discountAmountPaise,
      netAmountPaise: o.netAmountPaise,
      invoiceNumber: o.invoiceNumber,
      courierName: o.courierName,
      trackingNumber: o.trackingNumber,
      jatakaName: String(j.name || o.user?.name || "Customer"),
      jatakaPhone: String(j.phone || o.user?.phone || ""),
      serviceTitle: isHindi
        ? o.service?.titleHi || "Vedic Service"
        : o.service?.titleEn || "Vedic Service",
      planTitle: isHindi
        ? o.plan?.titleHi || "Standard"
        : o.plan?.titleEn || "Standard",
      statusEvents: o.statusEvents.map((e) => ({
        id: e.id,
        status: e.status,
        note: e.note,
        createdAt: e.createdAt.toISOString(),
        changedByName: e.changedBy?.name || e.changedBy?.email || null,
      })),
    };
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          {isHindi ? "प्रशासनिक नियंत्रण" : "Administrative Console"}
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary mt-1">
          {isHindi ? "आदेश एवं दक्षिणा प्रबंधन" : "Order & Payment Administration"}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          {isHindi
            ? "समस्त वैदिक परामर्श आदेशों की ट्रैकिंग, मैनुअल भुगतान सत्यापन एवं शास्त्रीय गणना स्थिति का प्रबंधन।"
            : "Monitor and manage customer Vedic consultations, verify manual payments, and advance astrological status."}
        </p>
      </div>

      <AdminOrdersManager orders={orders} locale={locale} />
    </div>
  );
}
