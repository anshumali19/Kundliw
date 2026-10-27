import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { isDemoMode } from "@/lib/config/demo";
import { razorpayConfigured } from "@/lib/payments/gateway";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, Role } from "@prisma/client";
import { CheckoutClient } from "@/features/booking/components/CheckoutClient";

interface CheckoutPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
  searchParams?: Promise<{ pay?: string }>;
}

export const dynamic = "force-dynamic";

export default async function CheckoutPage(props: CheckoutPageProps) {
  const params = await props.params;
  const query = (await props.searchParams) ?? {};

  const {
    locale,
    id
  } = params;

  const user = await requireUser(`/booking/checkout/${id}`, locale);
  const isHindi = locale === "hi";

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      service: true,
      plan: true,
      slot: true,
      offer: true,
    },
  });

  if (!order) {
    notFound();
  }

  const isOwner = order.userId === user.id;
  const isAdmin = user.role === Role.ADMIN;
  if (!isOwner && !isAdmin) {
    notFound();
  }

  // If already paid, proceed to confirmation
  if (order.paymentStatus === PaymentStatus.PAID) {
    redirect(`/${locale}/booking/success/${id}`);
  }

  const adminSettings = (await prisma.adminSettings.findUnique({
    where: { id: "default" },
  })) || {};

  const jataka = (order.jatakaDetails as Record<string, unknown>) || {};
  const jatakaName = String(jataka.name || "Customer");

  let slotTime: string | null = null;
  if (order.slot) {
    const d = new Date(order.slot.date);
    const dateFormatted = d.toLocaleDateString(isHindi ? "hi-IN" : "en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    slotTime = `${dateFormatted} (${order.slot.startTime} - ${order.slot.endTime} IST)`;
  }

  const orderData = {
    id: order.id,
    orderNumber: order.orderNumber,
    baseAmountPaise: order.baseAmountPaise,
    discountAmountPaise: order.discountAmountPaise,
    gstAmountPaise: order.gstAmountPaise,
    gstRateBasisPoints: order.gstRateBasisPoints,
    netAmountPaise: order.netAmountPaise,
    offerCode: order.offerCode,
    serviceTitle: isHindi ? order.service?.titleHi || "" : order.service?.titleEn || "",
    planTitle: isHindi ? order.plan?.titleHi || "" : order.plan?.titleEn || "",
    jatakaName,
    rejectionReason: order.rejectionReason,
    slotTime,
  };

  return (
    <CheckoutClient
      order={orderData}
      adminSettings={adminSettings}
      locale={locale}
      initialMethod={query.pay === "GATEWAY" || query.pay === "UPI" || query.pay === "BANK" ? query.pay : undefined}
      gatewayMode={razorpayConfigured() ? "razorpay" : isDemoMode() && process.env.NODE_ENV !== "production" ? "demo" : "off"}
    />
  );
}
