import { prisma } from "@/lib/prisma";
import { CreateBookingOrderInput } from "@/features/booking/validation";
import { calculateGst } from "@/lib/billing/gst";
import { getGstSettings } from "@/lib/billing/gstSettings";
import { claimOfferInTransaction, pickBestAutoOffer } from "@/lib/offers/apply";
import { computeAvailability } from "@/lib/booking/packageAvailability";
import {
  attachReferralToOrder,
  cancelCommission,
  resolveApprovedReferral,
} from "@/lib/associates/service";
import {
  AppointmentStatus,
  OrderStatus,
  PaymentStatus,
  PaymentMode,
  RequestType,
  Prisma,
} from "@prisma/client";

export class BookingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingError";
  }
}

/**
 * Generates sequential order numbers (e.g. MKJK-2026-0001) using Counter model.
 * Atomic inside Prisma transaction.
 */
export async function getNextOrderNumber(
  tx: Prisma.TransactionClient
): Promise<string> {
  const currentYear = new Date().getFullYear();
  const counterId = `ORDER_${currentYear}`;

  const counter = await tx.counter.upsert({
    where: { id: counterId },
    update: { seq: { increment: 1 } },
    create: { id: counterId, seq: 1 },
  });

  const paddedSeq = counter.seq.toString().padStart(4, "0");
  return `MKJK-${currentYear}-${paddedSeq}`;
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  netAmountPaise: number;
}

/**
 * Creates an order inside a strict database transaction:
 * 1. Computes all prices from database records (ignoring any client-supplied amount).
 * 2. If plan includes a consultation call, atomically reserves the appointment slot (prevents overbooking).
 * 3. If an offer code is provided, atomically validates and claims the coupon (prevents usageLimit over-subscription).
 * 4. Snapshots prices, gstin, and offerCode.
 * 5. Creates Order record with initial status ORDER_RECEIVED and logs the initial OrderStatusEvent.
 */
export async function createBookingOrder(
  userId: string,
  input: CreateBookingOrderInput,
  referralCode?: string | null
): Promise<CreateOrderResult> {
  return await prisma.$transaction(async (tx) => {
    // 0. Idempotency Key check: if already processed, return existing order
    if (input.idempotencyKey && input.idempotencyKey.trim()) {
      const existing = await tx.order.findUnique({
        where: { idempotencyKey: input.idempotencyKey.trim() },
      });
      if (existing) {
        return {
          orderId: existing.id,
          orderNumber: existing.orderNumber,
          netAmountPaise: existing.netAmountPaise,
        };
      }
    }

    // 1. Fetch active service
    const service = await tx.service.findUnique({
      where: { slug: input.serviceSlug, isActive: true },
    });

    if (!service) {
      throw new BookingError("Requested Vedic service is unavailable or inactive.");
    }

    // 2. Fetch active plan directly from DB — never trust client price
    const plan = await tx.plan.findUnique({
      where: {
        serviceId_slug: {
          serviceId: service.id,
          slug: input.planSlug,
        },
      },
      include: { package: { select: { id: true, isActive: true, seats: true, startDate: true, endDate: true } } },
    });

    if (!plan || !plan.isActive || (plan.package && !plan.package.isActive)) {
      throw new BookingError("Requested consultation tier is unavailable or inactive.");
    }

    // Package availability: dates and seats. The package row is locked so two customers cannot take the last seat together.
    if (plan.package) {
      await tx.$queryRaw`SELECT "id" FROM "ServicePackage" WHERE "id" = ${plan.package.id} FOR UPDATE`;
      const held = await tx.order.count({
        where: { plan: { packageId: plan.package.id }, paymentStatus: { notIn: [PaymentStatus.FAILED, PaymentStatus.REFUNDED] } },
      });
      const availability = computeAvailability(plan.package, held);
      if (availability.status !== "open") {
        throw new BookingError(
          availability.reason === "full"
            ? "Sorry, all seats in this package are booked."
            : "Sorry, booking for this package is closed."
        );
      }
    }

    // 3. If plan includes live call, validate and reserve appointment slot
    let reservedSlotId: string | null = null;
    if (plan.hasCall) {
      if (!input.slotId) {
        throw new BookingError("An appointment slot is required for consultation calls.");
      }

      const slot = await tx.slot.findUnique({
        where: { id: input.slotId, isActive: true },
      });

      if (!slot) {
        throw new BookingError("Selected appointment slot does not exist.");
      }

      const todayUtc = new Date();
      todayUtc.setUTCHours(0, 0, 0, 0);
      if (slot.date < todayUtc) {
        throw new BookingError("Selected appointment slot is in the past. Please choose another time.");
      }

      // Atomic conditional reservation: increment only if bookedCount < capacity
      const reservationResult = await tx.slot.updateMany({
        where: {
          id: slot.id,
          isActive: true,
          bookedCount: { lt: slot.capacity },
        },
        data: { bookedCount: { increment: 1 } },
      });

      if (reservationResult.count === 0) {
        throw new BookingError("Selected appointment slot is fully booked. Please choose another time.");
      }

      reservedSlotId = slot.id;
    }

    // 4. If offer is provided, validate and claim inside transaction
    let discountPaise = 0;
    let claimedOfferId: string | null = null;
    let claimedOfferCode: string | null = null;

    // No code typed: an offer that applies by itself (admin: "Apply automatically") is used if there is one
    let offerCodeToClaim = input.offerCode?.trim() ? input.offerCode.trim().toUpperCase() : "";
    if (!offerCodeToClaim) {
      const autoOffers = await tx.offer.findMany({ where: { isActive: true, autoApply: true } });
      let userUsesByCode: Record<string, number> = {};
      if (autoOffers.length > 0) {
        const used = await tx.order.groupBy({
          by: ["offerCode"],
          where: { userId, offerCode: { in: autoOffers.map((o) => o.code) }, paymentStatus: { notIn: ["FAILED", "REFUNDED"] } },
          _count: { _all: true },
        });
        userUsesByCode = Object.fromEntries(used.map((u) => [u.offerCode ?? "", u._count._all]));
      }
      const eligible = autoOffers.filter((o) => !(o.perUserLimit > 0 && (userUsesByCode[o.code] ?? 0) >= o.perUserLimit));
      const best = pickBestAutoOffer(eligible, plan.pricePaise, new Date(), { serviceSlug: service.slug, planId: plan.id });
      if (best) offerCodeToClaim = best.offer.code;
    }

    if (offerCodeToClaim) {
      const cleanCode = offerCodeToClaim;
      const claimResult = await claimOfferInTransaction(
        tx,
        cleanCode,
        plan.pricePaise,
        new Date(),
        { serviceSlug: service.slug, planId: plan.id, userId }
      );

      discountPaise = claimResult.discountPaise;
      claimedOfferCode = cleanCode;

      const offerRecord = await tx.offer.findUnique({
        where: { code: cleanCode },
        select: { id: true },
      });
      if (offerRecord) {
        claimedOfferId = offerRecord.id;
      }
    }

    // 5. Fetch Kendra GSTIN and default tax rate from the shared settings helper
    const gst = await getGstSettings(tx);
    const gstinSnapshot = gst.gstin;

    // 6. Compute GST calculation strictly from database prices
    const billing = calculateGst({
      baseAmountPaise: plan.pricePaise,
      discountAmountPaise: discountPaise,
      gstRateBasisPoints: gst.rateBasisPoints,
    });

    // 7. Generate sequential order number
    const orderNumber = await getNextOrderNumber(tx);

    // 8. Determine request type based on service
    let requestType: RequestType = RequestType.SERVICE_BOOKING;
    if (service.slug === "kundli-matching") {
      requestType = RequestType.KUNDLI_MATCHING;
    } else if (service.slug === "prashna-kundli") {
      requestType = RequestType.PRASHNA_KUNDLI;
    }

    // 9. Create Order
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        serviceId: service.id,
        planId: plan.id,
        slotId: reservedSlotId,
        appointmentStatus: reservedSlotId ? AppointmentStatus.PENDING : null,
        offerId: claimedOfferId,
        offerCode: claimedOfferCode,
        idempotencyKey: input.idempotencyKey?.trim() || null,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30-minute reservation window
        requestType,
        status: OrderStatus.ORDER_RECEIVED,
        paymentStatus: PaymentStatus.PENDING,
        paymentMode: PaymentMode.RAZORPAY,
        jatakaDetails: input.jatakaDetails as unknown as Prisma.InputJsonValue,
        baseAmountPaise: billing.baseAmountPaise,
        discountAmountPaise: billing.discountAmountPaise,
        taxableAmountPaise: billing.taxableAmountPaise,
        gstRateBasisPoints: billing.gstRateBasisPoints,
        gstAmountPaise: billing.gstAmountPaise,
        netAmountPaise: billing.netAmountPaise,
        gstin: gstinSnapshot,
      },
    });

    // 10. Record initial status event
    await tx.orderStatusEvent.create({
      data: {
        orderId: order.id,
        status: OrderStatus.ORDER_RECEIVED,
        note: "Order created successfully. Awaiting payment.",
        changedById: userId,
      },
    });

    // 11. Attribute the order to the referring associate (cookie set by /r/<code>)
    if (referralCode) {
      const associate = await resolveApprovedReferral(referralCode, tx);
      if (associate) {
        await attachReferralToOrder(tx, order, associate.id);
      }
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      netAmountPaise: order.netAmountPaise,
    };
  });
}

/**
 * Checks if an order has exceeded its expiry window and releases its reserved slot and offer claim.
 */
export async function expireUnpaidOrder(
  orderId: string,
  now: Date = new Date()
): Promise<boolean> {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.paymentStatus !== PaymentStatus.PENDING) {
      return false;
    }

    if (!order.expiresAt || now <= order.expiresAt) {
      return false; // Order has no reservation window or has not expired yet
    }

    // Atomic transition: only one concurrent expiry can claim the release.
    const claimed = await tx.order.updateMany({
      where: {
        id: orderId,
        paymentStatus: PaymentStatus.PENDING,
        expiresAt: { lte: now },
      },
      data: {
        paymentStatus: PaymentStatus.FAILED,
      },
    });

    if (claimed.count === 0) {
      return false;
    }

    // Release slot bookedCount without ever going negative.
    if (order.slotId) {
      await tx.slot.updateMany({
        where: { id: order.slotId, bookedCount: { gt: 0 } },
        data: { bookedCount: { decrement: 1 } },
      });
    }

    await cancelCommission(tx, orderId);

    // Release coupon usedCount without ever going negative.
    if (order.offerId) {
      await tx.offer.updateMany({
        where: { id: order.offerId, usedCount: { gt: 0 } },
        data: { usedCount: { decrement: 1 } },
      });
    }

    await tx.orderStatusEvent.create({
      data: {
        orderId,
        status: order.status,
        note: "Reservation expired. Appointment slot and coupon claim released.",
      },
    });

    return true;
  });
}

export interface ExpireOverdueResult {
  scanned: number;
  expired: number;
}

/**
 * Releases reservations for unpaid orders whose 30-minute window has elapsed.
 * Safe to call from read paths and from the scheduled cron endpoint; each order
 * is expired atomically, so concurrent callers cannot double-release.
 */
export async function expireOverdueOrders(
  now: Date = new Date(),
  take = 200
): Promise<ExpireOverdueResult> {
  const overdue = await prisma.order.findMany({
    where: {
      paymentStatus: PaymentStatus.PENDING,
      expiresAt: { lte: now },
    },
    select: { id: true },
    orderBy: { expiresAt: "asc" },
    take,
  });

  let expired = 0;
  for (const order of overdue) {
    try {
      if (await expireUnpaidOrder(order.id, now)) {
        expired += 1;
      }
    } catch (error) {
      console.error(`Failed to expire overdue order ${order.id}:`, error);
    }
  }

  return { scanned: overdue.length, expired };
}
