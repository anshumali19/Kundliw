import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/lib/payments/service";
import { PaymentMode, PaymentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface RazorpayEntity {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  notes?: Record<string, string>;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    // Inactive without real webhook secret
    if (!webhookSecret || webhookSecret === "placeholder_webhook") {
      return NextResponse.json(
        { received: true, active: false, message: "Razorpay webhook inactive: RAZORPAY_WEBHOOK_SECRET not configured." },
        { status: 200 }
      );
    }

    const isValid = verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    // Never synthesise an event id: without the provider's real id we cannot
    // deduplicate safely. Reject so Razorpay retries with a proper event.
    const eventId = typeof payload?.id === "string" ? payload.id.trim() : "";
    if (!eventId) {
      return NextResponse.json({ error: "Missing webhook event id" }, { status: 400 });
    }

    // Deduplication check
    const existing = await prisma.processedWebhookEvent.findUnique({
      where: { eventId },
    });

    if (existing) {
      return NextResponse.json({ received: true, deduplicated: true }, { status: 200 });
    }

    const eventType = typeof payload?.event === "string" ? payload.event : "unknown";

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity as RazorpayEntity | undefined;
      const orderEntity = payload.payload?.order?.entity as RazorpayEntity | undefined;
      const entity = paymentEntity ?? orderEntity;

      const ourOrderId = entity?.notes?.orderId;
      const providerOrderId = paymentEntity?.order_id ?? orderEntity?.id;
      const paymentId = paymentEntity?.id;

      if (!ourOrderId || !providerOrderId || !paymentId) {
        return NextResponse.json(
          { error: "Webhook payload is missing order/payment identifiers" },
          { status: 400 }
        );
      }

      const order = await prisma.order.findUnique({ where: { id: ourOrderId } });
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 400 });
      }

      // Verify the payment belongs to the order we created.
      if (order.razorpayOrderId && order.razorpayOrderId !== providerOrderId) {
        return NextResponse.json({ error: "Provider order mismatch" }, { status: 400 });
      }

      const amount = entity?.amount;
      if (typeof amount !== "number" || !Number.isInteger(amount) || amount !== order.netAmountPaise) {
        return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
      }

      if (String(entity?.currency || "").toUpperCase() !== "INR") {
        return NextResponse.json({ error: "Unsupported payment currency" }, { status: 400 });
      }

      if (
        order.paymentStatus === PaymentStatus.PAID &&
        order.razorpayPaymentId &&
        order.razorpayPaymentId !== paymentId
      ) {
        return NextResponse.json(
          { error: "Order was already paid by a different payment" },
          { status: 409 }
        );
      }

      await markOrderPaid(order.id, {
        paymentMode: PaymentMode.RAZORPAY,
        providerPaymentId: paymentId,
        signature,
        paidAmountPaise: amount,
        note: `Payment captured via Razorpay Webhook (${eventType})`,
      });
    }

    // Persist the deduplication marker only after successful processing. If this
    // fails the request is retried by the provider, and markOrderPaid is
    // idempotent. A concurrent duplicate is treated as already processed.
    try {
      await prisma.processedWebhookEvent.create({
        data: {
          eventId,
          eventType,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return NextResponse.json({ received: true, deduplicated: true }, { status: 200 });
      }
      throw error;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
