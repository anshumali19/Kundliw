import { prisma } from "@/lib/prisma";
import { Order, PaymentMode, PaymentStatus, Role } from "@prisma/client";
import { isServerGeneratedPaymentProofUrl } from "./proof";
import { settleCommission } from "@/lib/associates/service";
import { sendNotification } from "@/lib/notifications";

/** Best-effort payment confirmation email. Never throws. */
async function notifyPaymentConfirmed(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        orderNumber: true,
        invoiceNumber: true,
        netAmountPaise: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    });
    if (!order?.user?.email) return;
    const rupees = (order.netAmountPaise / 100).toLocaleString("en-IN");
    await sendNotification({
      email: order.user.email,
      phone: order.user.phone,
      subject: `Payment confirmed - ${order.orderNumber}`,
      message: `Namaste ${order.user.name || ""}, we have received your payment of Rs. ${rupees} for order ${order.orderNumber}.${order.invoiceNumber ? ` Your invoice number is ${order.invoiceNumber}.` : ""} You can track your order in My Account.`,
    });
  } catch (error) {
    console.error("[Payments] Confirmation email failed:", error);
  }
}

export const MAX_MANUAL_PAYMENT_ATTEMPTS = 3;

export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly status: number = 409
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

export interface MarkPaidInput {
  paymentMode: PaymentMode;
  providerPaymentId?: string;
  signature?: string;
  note?: string;
  /** Amount actually captured by the provider, in paise. Must match the order. */
  paidAmountPaise: number;
}

export interface ManualPaymentInput {
  paymentMode: PaymentMode;
  manualPaymentRef: string;
  manualPaymentProofUrl?: string;
}

/**
 * Marks an order as PAID inside an atomic transaction.
 * Generates sequential invoice number via Counter if not already generated.
 * Appends an OrderStatusEvent recording the payment.
 */
export async function markOrderPaid(
  orderId: string,
  details: MarkPaidInput,
  adminUserId?: string
): Promise<Order> {
  let newlyPaid = false;
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // Never trust a caller-supplied success flag: the captured amount must
    // equal the server-computed order total.
    if (
      !Number.isInteger(details.paidAmountPaise) ||
      details.paidAmountPaise < 0 ||
      details.paidAmountPaise !== order.netAmountPaise
    ) {
      throw new PaymentError(
        "Captured amount does not match the order total.",
        409
      );
    }

    if (
      order.paymentStatus === PaymentStatus.FAILED ||
      order.paymentStatus === PaymentStatus.REFUNDED
    ) {
      throw new PaymentError(
        "This order is no longer payable. Its reservation was released or refunded.",
        409
      );
    }

    if (order.expiresAt && new Date() > order.expiresAt) {
      throw new PaymentError(
        "This order reservation has expired. Please create a new booking.",
        409
      );
    }

    // Idempotent: if already paid with the verified amount, return
    if (order.paymentStatus === PaymentStatus.PAID) {
      return order;
    }

    // Generate sequential invoice number if not already present
    let invoiceNumber = order.invoiceNumber;
    if (!invoiceNumber) {
      const year = new Date().getFullYear();
      const counterId = `INVOICE_${year}`;
      const counter = await tx.counter.upsert({
        where: { id: counterId },
        update: { seq: { increment: 1 } },
        create: { id: counterId, seq: 1 },
      });
      invoiceNumber = `INV-${year}-${String(counter.seq).padStart(4, "0")}`;
    }

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        paymentMode: details.paymentMode,
        razorpayPaymentId: details.providerPaymentId || order.razorpayPaymentId,
        razorpaySignature: details.signature || order.razorpaySignature,
        invoiceNumber,
      },
    });
    await settleCommission(tx, orderId);
    newlyPaid = true;

    await tx.orderStatusEvent.create({
      data: {
        orderId,
        status: order.status,
        note: details.note || `Payment confirmed successfully via ${details.paymentMode}.`,
        changedById: adminUserId || null,
      },
    });

    return updatedOrder;
  });
  if (newlyPaid) await notifyPaymentConfirmed(orderId);
  return result;
}

/**
 * Submits a manual payment reference (UPI, Bank transfer, QR) for verification.
 * Transitions paymentStatus to AWAITING_VERIFICATION.
 */
export async function submitManualPayment(
  orderId: string,
  details: ManualPaymentInput
): Promise<Order> {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new PaymentError("Order is already paid.");
    }

    if (
      order.paymentStatus === PaymentStatus.FAILED ||
      order.paymentStatus === PaymentStatus.REFUNDED
    ) {
      throw new PaymentError("This order is no longer awaiting payment.");
    }

    if (order.expiresAt && new Date() > order.expiresAt) {
      throw new PaymentError(
        "This order reservation has expired. Please create a new booking."
      );
    }

    if (
      details.manualPaymentProofUrl &&
      !isServerGeneratedPaymentProofUrl(details.manualPaymentProofUrl)
    ) {
      throw new PaymentError("Invalid payment proof reference.", 400);
    }

    // Bound retries after repeated rejections so the review queue cannot be
    // flooded with the same order.
    const previousAttempts = await tx.orderStatusEvent.count({
      where: {
        orderId,
        note: { startsWith: "Manual payment submitted" },
      },
    });

    if (previousAttempts >= MAX_MANUAL_PAYMENT_ATTEMPTS) {
      throw new PaymentError(
        "Maximum manual payment submissions reached for this order.",
        429
      );
    }

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.AWAITING_VERIFICATION,
        paymentMode: details.paymentMode,
        manualPaymentRef: details.manualPaymentRef,
        manualPaymentProof: details.manualPaymentProofUrl || order.manualPaymentProof,
        rejectionReason: null,
      },
    });

    await tx.orderStatusEvent.create({
      data: {
        orderId,
        status: order.status,
        note: `Manual payment submitted for verification (${details.paymentMode}, Ref: ${details.manualPaymentRef}).`,
      },
    });

    return updatedOrder;
  });
}

/**
 * Admin action: approves an awaiting manual payment and marks order as PAID.
 */
export async function approveManualPayment(
  orderId: string,
  adminUserId: string,
  note?: string
): Promise<Order> {
  let newlyPaid = false;
  const result = await prisma.$transaction(async (tx) => {
    const admin = await tx.user.findUnique({
      where: { id: adminUserId },
    });

    if (!admin || admin.role !== Role.ADMIN) {
      throw new Error("Unauthorized: Only administrators can approve manual payments.");
    }

    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return order;
    }

    if (order.paymentStatus !== PaymentStatus.AWAITING_VERIFICATION) {
      throw new PaymentError(
        "Only orders awaiting manual payment verification can be approved.",
        409
      );
    }

    let invoiceNumber = order.invoiceNumber;
    if (!invoiceNumber) {
      const year = new Date().getFullYear();
      const counterId = `INVOICE_${year}`;
      const counter = await tx.counter.upsert({
        where: { id: counterId },
        update: { seq: { increment: 1 } },
        create: { id: counterId, seq: 1 },
      });
      invoiceNumber = `INV-${year}-${String(counter.seq).padStart(4, "0")}`;
    }

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        invoiceNumber,
      },
    });
    await settleCommission(tx, orderId);
    newlyPaid = true;

    await tx.orderStatusEvent.create({
      data: {
        orderId,
        status: order.status,
        note: note || `Manual payment verified and approved by admin (${admin.name || admin.email}).`,
        changedById: adminUserId,
      },
    });

    return updatedOrder;
  });
  if (newlyPaid) await notifyPaymentConfirmed(orderId);
  return result;
}

/**
 * Admin action: rejects an awaiting manual payment.
 */
export async function rejectManualPayment(
  orderId: string,
  adminUserId: string,
  reason: string
): Promise<Order> {
  return await prisma.$transaction(async (tx) => {
    const admin = await tx.user.findUnique({
      where: { id: adminUserId },
    });

    if (!admin || admin.role !== Role.ADMIN) {
      throw new Error("Unauthorized: Only administrators can reject manual payments.");
    }

    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    const isExpired = order.expiresAt ? new Date() > order.expiresAt : false;
    const nextPaymentStatus = isExpired ? PaymentStatus.FAILED : PaymentStatus.PENDING;

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: nextPaymentStatus,
        rejectionReason: reason,
        manualPaymentRef: null,
        manualPaymentProof: null,
      },
    });

    await tx.orderStatusEvent.create({
      data: {
        orderId,
        status: order.status,
        note: `Manual payment rejected by admin. Reason: ${reason}.${
          isExpired ? " Order reservation expired." : " Returned to retry state for Yajman resubmission."
        }`,
        changedById: adminUserId,
      },
    });

    return updatedOrder;
  });
}
