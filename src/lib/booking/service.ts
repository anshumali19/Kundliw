import { prisma } from "@/lib/prisma";
import { CreateBookingOrderInput } from "@/features/booking/validation";
import { calculateGst } from "@/lib/billing/gst";
import { claimOfferInTransaction } from "@/lib/offers/apply";
import { OrderStatus, PaymentStatus, PaymentMode, RequestType, Prisma } from "@prisma/client";

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
  input: CreateBookingOrderInput
): Promise<CreateOrderResult> {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch active service
    const service = await tx.service.findUnique({
      where: { slug: input.serviceSlug, isActive: true },
    });

    if (!service) {
      throw new Error("Requested Vedic service is unavailable or inactive.");
    }

    // 2. Fetch active plan directly from DB — never trust client price
    const plan = await tx.plan.findUnique({
      where: {
        serviceId_slug: {
          serviceId: service.id,
          slug: input.planSlug,
        },
      },
    });

    if (!plan || !plan.isActive) {
      throw new Error("Requested consultation tier is unavailable or inactive.");
    }

    // 3. If plan includes live call, validate and reserve appointment slot
    let reservedSlotId: string | null = null;
    if (plan.hasCall) {
      if (!input.slotId) {
        throw new Error("An appointment slot is required for consultation calls.");
      }

      const slot = await tx.slot.findUnique({
        where: { id: input.slotId, isActive: true },
      });

      if (!slot) {
        throw new Error("Selected appointment slot does not exist.");
      }

      // Check slot capacity atomically
      if (slot.bookedCount >= slot.capacity) {
        throw new Error("Selected appointment slot is fully booked. Please choose another time.");
      }

      // Reserve slot by incrementing bookedCount
      await tx.slot.update({
        where: { id: slot.id },
        data: { bookedCount: { increment: 1 } },
      });

      reservedSlotId = slot.id;
    }

    // 4. If offer is provided, validate and claim inside transaction
    let discountPaise = 0;
    let claimedOfferId: string | null = null;
    let claimedOfferCode: string | null = null;

    if (input.offerCode && input.offerCode.trim()) {
      const cleanCode = input.offerCode.trim().toUpperCase();
      const claimResult = await claimOfferInTransaction(
        tx,
        cleanCode,
        plan.pricePaise
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

    // 5. Fetch Kendra GSTIN and default tax rate from AdminSettings
    const adminSettings = await tx.adminSettings.findUnique({
      where: { id: "default" },
    });
    const gstRateBps = adminSettings?.defaultGstRateBps ?? 1800; // 18.00%
    const gstinSnapshot = adminSettings?.gstin ?? null;

    // 6. Compute GST calculation strictly from database prices
    const billing = calculateGst({
      baseAmountPaise: plan.pricePaise,
      discountAmountPaise: discountPaise,
      gstRateBasisPoints: gstRateBps,
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
        offerId: claimedOfferId,
        offerCode: claimedOfferCode,
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

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      netAmountPaise: order.netAmountPaise,
    };
  });
}
