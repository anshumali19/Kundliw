import { AppointmentStatus, OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { attachReferralToOrder, cancelCommission } from "@/lib/associates/service";
import { calculateGst } from "@/lib/billing/gst";
import { getGstSettings } from "@/lib/billing/gstSettings";
import { getNextOrderNumber } from "@/lib/booking/service";

export class SelfServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "SelfServiceError";
    this.status = status;
  }
}

/** A package with a start date can be cancelled up to this long before it starts. */
export const PACKAGE_CANCEL_CUTOFF_HOURS = 48;

interface Rulable {
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  appointmentStatus: AppointmentStatus | null;
}

/** Why a customer cannot cancel this order by themselves, or null when they can. */
export function cancelBlockReason(order: Rulable, packageStart: Date | null, now = new Date()): { en: string; hi: string } | null {
  if (order.paymentStatus === PaymentStatus.REFUNDED || order.paymentStatus === PaymentStatus.FAILED) {
    return { en: "This order is already cancelled.", hi: "यह ऑर्डर पहले ही रद्द हो चुका है।" };
  }
  if (order.status !== OrderStatus.ORDER_RECEIVED) {
    return {
      en: "Work on this order has started, so it can no longer be cancelled here. Please raise a support ticket.",
      hi: "इस ऑर्डर पर काम शुरू हो चुका है, इसलिए यहाँ से रद्द नहीं हो सकता। कृपया सपोर्ट टिकट बनाएँ।",
    };
  }
  if (order.appointmentStatus === AppointmentStatus.APPROVED || order.appointmentStatus === AppointmentStatus.COMPLETED) {
    return {
      en: "Your call is already scheduled, so it can no longer be cancelled here. Please raise a support ticket.",
      hi: "आपकी कॉल तय हो चुकी है, इसलिए यहाँ से रद्द नहीं हो सकता। कृपया सपोर्ट टिकट बनाएँ।",
    };
  }
  if (packageStart && packageStart.getTime() - now.getTime() < PACKAGE_CANCEL_CUTOFF_HOURS * 3600 * 1000) {
    return {
      en: `This package starts within ${PACKAGE_CANCEL_CUTOFF_HOURS} hours (or has started), so it can no longer be cancelled here. Please raise a support ticket.`,
      hi: `यह पैकेज ${PACKAGE_CANCEL_CUTOFF_HOURS} घंटे के भीतर शुरू हो रहा है (या शुरू हो चुका है), इसलिए यहाँ से रद्द नहीं हो सकता। कृपया सपोर्ट टिकट बनाएँ।`,
    };
  }
  return null;
}

/** Why a customer cannot upgrade this order, or null when they can. */
export function upgradeBlockReason(order: Rulable & { extraPlanIds: string[] }): { en: string; hi: string } | null {
  if (order.paymentStatus !== PaymentStatus.PAID) {
    return { en: "Only a paid order can be upgraded.", hi: "केवल भुगतान हो चुका ऑर्डर अपग्रेड हो सकता है।" };
  }
  if (order.status !== OrderStatus.ORDER_RECEIVED || order.appointmentStatus === AppointmentStatus.COMPLETED) {
    return { en: "Work on this order has started, so it cannot be upgraded here. Please raise a support ticket.", hi: "इस ऑर्डर पर काम शुरू हो चुका है, इसलिए यहाँ अपग्रेड नहीं हो सकता। कृपया सपोर्ट टिकट बनाएँ।" };
  }
  if (order.extraPlanIds.length > 0) {
    return { en: "An order with several plans cannot be upgraded here. Please raise a support ticket.", hi: "एक से अधिक प्लान वाला ऑर्डर यहाँ अपग्रेड नहीं हो सकता। कृपया सपोर्ट टिकट बनाएँ।" };
  }
  return null;
}

export type RefundMode = "REQUEST" | "SENT";

/**
 * Cancels an order and gives back everything it was holding: the appointment slot, the coupon use
 * and the associate commission. Money is refunded by the admin from the payment account, so the
 * order carries a refund status (REQUESTED until the admin marks it SENT).
 */
export async function cancelOrderTx(
  tx: Prisma.TransactionClient,
  orderId: string,
  opts: { by: "USER" | "ADMIN"; actorId: string; reason: string; refundMode: RefundMode; userId?: string; releaseCoupon?: boolean },
): Promise<{ orderNumber: string; refundPaise: number }> {
  const order = await tx.order.findUnique({ where: { id: orderId }, include: { plan: { include: { package: true } } } });
  if (!order || (opts.userId && order.userId !== opts.userId)) throw new SelfServiceError("Order not found.", 404);

  if (opts.by === "USER") {
    const block = cancelBlockReason(order, order.plan?.package?.startDate ?? null);
    if (block) throw new SelfServiceError(block.en, 409);
  } else if (order.paymentStatus === PaymentStatus.REFUNDED) {
    throw new SelfServiceError("This order is already cancelled.", 409);
  }

  const paid = order.paymentStatus === PaymentStatus.PAID || order.paymentStatus === PaymentStatus.AWAITING_VERIFICATION;
  const now = new Date();
  const claimed = await tx.order.updateMany({
    where: { id: orderId, paymentStatus: order.paymentStatus },
    data: {
      paymentStatus: paid ? PaymentStatus.REFUNDED : PaymentStatus.FAILED,
      cancelledAt: now,
      cancelReason: opts.reason,
      cancelledBy: opts.by,
      refundStatus: paid ? opts.refundMode : null,
      refundAmountPaise: paid ? order.netAmountPaise : null,
      refundedAt: paid && opts.refundMode === "SENT" ? now : null,
    },
  });
  if (claimed.count === 0) throw new SelfServiceError("This order just changed. Please refresh and try again.", 409);

  if (order.slotId) {
    await tx.slot.updateMany({ where: { id: order.slotId, bookedCount: { gt: 0 } }, data: { bookedCount: { decrement: 1 } } });
  }
  if (order.offerId && opts.releaseCoupon !== false) {
    await tx.offer.updateMany({ where: { id: order.offerId, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } });
  }
  await cancelCommission(tx, orderId);

  // An upgrade that was started but not paid is no longer valid
  const pendingUpgrades = await tx.order.findMany({
    where: { upgradeFromOrderId: orderId, paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.AWAITING_VERIFICATION] } },
    select: { id: true },
  });
  for (const u of pendingUpgrades) {
    await tx.order.update({ where: { id: u.id }, data: { paymentStatus: PaymentStatus.FAILED } });
    await cancelCommission(tx, u.id);
  }

  await tx.orderStatusEvent.create({
    data: {
      orderId,
      status: order.status,
      note: `Cancelled by ${opts.by === "USER" ? "customer" : "admin"}. Reason: ${opts.reason}${paid ? ` Refund: ${opts.refundMode === "SENT" ? "sent" : "to be sent by the Kendra"}.` : ""}`,
      changedById: opts.actorId,
    },
  });
  return { orderNumber: order.orderNumber, refundPaise: paid ? order.netAmountPaise : 0 };
}

export async function cancelOrderByUser(orderId: string, userId: string, reason: string) {
  return prisma.$transaction((tx) => cancelOrderTx(tx, orderId, { by: "USER", actorId: userId, userId, reason, refundMode: "REQUEST" }));
}

/** Higher plans of the same package that this paid order can be upgraded to. */
export async function upgradeChoices(order: { id: string; serviceId: string | null; planId: string | null }) {
  if (!order.planId || !order.serviceId) return [];
  const current = await prisma.plan.findUnique({ where: { id: order.planId }, select: { pricePaise: true, packageId: true } });
  if (!current) return [];
  const pending = await prisma.order.findFirst({
    where: { upgradeFromOrderId: order.id, paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.AWAITING_VERIFICATION] }, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    select: { id: true },
  });
  if (pending) return [];
  return prisma.plan.findMany({
    where: { serviceId: order.serviceId, packageId: current.packageId, isActive: true, pricePaise: { gt: current.pricePaise } },
    orderBy: { pricePaise: "asc" },
  });
}

/**
 * Starts an upgrade: creates a new unpaid order for the higher plan, with what the customer already
 * paid taken off. The old order is cancelled only when the new one is paid (see settleUpgrade).
 */
export async function startUpgrade(orderId: string, userId: string, newPlanId: string): Promise<{ orderId: string; netAmountPaise: number }> {
  return prisma.$transaction(async (tx) => {
    const old = await tx.order.findUnique({ where: { id: orderId } });
    if (!old || old.userId !== userId) throw new SelfServiceError("Order not found.", 404);
    const block = upgradeBlockReason(old);
    if (block) throw new SelfServiceError(block.en, 409);

    const choices = await upgradeChoices(old);
    const target = choices.find((p) => p.id === newPlanId);
    if (!target) throw new SelfServiceError("This plan is not available as an upgrade for your order.", 409);

    const gst = await getGstSettings(tx);
    // What the customer already paid (before tax) is taken off the new plan's price
    const billing = calculateGst({ baseAmountPaise: target.pricePaise, discountAmountPaise: old.taxableAmountPaise, gstRateBasisPoints: gst.rateBasisPoints });
    const orderNumber = await getNextOrderNumber(tx);
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId,
        serviceId: old.serviceId,
        planId: target.id,
        extraPlanIds: [],
        requestType: old.requestType,
        status: OrderStatus.ORDER_RECEIVED,
        paymentStatus: PaymentStatus.PENDING,
        paymentMode: old.paymentMode,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        jatakaDetails: old.jatakaDetails as Prisma.InputJsonValue,
        baseAmountPaise: billing.baseAmountPaise,
        discountAmountPaise: billing.discountAmountPaise,
        taxableAmountPaise: billing.taxableAmountPaise,
        gstRateBasisPoints: billing.gstRateBasisPoints,
        gstAmountPaise: billing.gstAmountPaise,
        netAmountPaise: billing.netAmountPaise,
        gstin: gst.gstin,
        upgradeFromOrderId: old.id,
        adminNotes: `Upgrade of ${old.orderNumber}. The amount already paid was taken off.`,
      },
    });
    await tx.orderStatusEvent.create({
      data: { orderId: created.id, status: OrderStatus.ORDER_RECEIVED, note: `Upgrade of ${old.orderNumber} created. Awaiting payment of the difference.`, changedById: userId },
    });
    await tx.orderStatusEvent.create({
      data: { orderId: old.id, status: old.status, note: `Customer started an upgrade (${created.orderNumber}). This order is cancelled when that one is paid.`, changedById: userId },
    });
    if (old.associateId) {
      await attachReferralToOrder(tx, created, old.associateId).catch(() => undefined);
    }
    return { orderId: created.id, netAmountPaise: created.netAmountPaise };
  });
}

/**
 * Call inside the same transaction that marks an order PAID. If the order is an upgrade, the old
 * order is cancelled (its payment is credited to the new one) and the call slot moves across.
 */
export async function settleUpgrade(tx: Prisma.TransactionClient, newOrderId: string): Promise<void> {
  const fresh = await tx.order.findUnique({ where: { id: newOrderId }, select: { upgradeFromOrderId: true } });
  if (!fresh?.upgradeFromOrderId) return;
  const old = await tx.order.findUnique({ where: { id: fresh.upgradeFromOrderId } });
  if (!old || old.paymentStatus !== PaymentStatus.PAID) return;

  const now = new Date();
  await tx.order.update({
    where: { id: old.id },
    data: {
      paymentStatus: PaymentStatus.REFUNDED,
      cancelledAt: now,
      cancelledBy: "UPGRADE",
      cancelReason: "Upgraded to a higher plan. The amount paid was credited to the new order.",
      refundStatus: "CREDITED",
      refundAmountPaise: old.netAmountPaise,
      refundedAt: now,
      slotId: null,
    },
  });
  if (old.slotId) {
    await tx.order.update({ where: { id: newOrderId }, data: { slotId: old.slotId, appointmentStatus: old.appointmentStatus } });
  }
  await cancelCommission(tx, old.id);
  await tx.orderStatusEvent.create({
    data: { orderId: old.id, status: old.status, note: "Upgraded to a higher plan; the amount paid was credited to the new order." },
  });
}
