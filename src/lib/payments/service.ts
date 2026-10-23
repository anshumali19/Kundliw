import { prisma } from "@/lib/prisma";
import { Order, PaymentMode, PaymentStatus, Role } from "@prisma/client";

export interface MarkPaidInput {
  paymentMode: PaymentMode;
  providerPaymentId?: string;
  signature?: string;
  note?: string;
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
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // Idempotent: if already paid, return
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
      throw new Error("Order is already paid.");
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
  return await prisma.$transaction(async (tx) => {
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
