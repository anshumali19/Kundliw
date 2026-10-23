import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/lib/payments/service";
import { PaymentMode } from "@prisma/client";

export const dynamic = "force-dynamic";

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
    const eventId = String(payload.id || payload.event_id || `evt_${Date.now()}`);

    // Deduplication check
    const existing = await prisma.processedWebhookEvent.findUnique({
      where: { eventId },
    });

    if (existing) {
      return NextResponse.json({ received: true, deduplicated: true }, { status: 200 });
    }

    await prisma.processedWebhookEvent.create({
      data: {
        eventId,
        eventType: payload.event || "unknown",
      },
    });

    const eventType = payload.event;
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.notes?.orderId;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        await markOrderPaid(orderId, {
          paymentMode: PaymentMode.RAZORPAY,
          providerPaymentId: paymentId,
          signature,
          note: `Payment captured via Razorpay Webhook (${eventType})`,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Webhook processing error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
