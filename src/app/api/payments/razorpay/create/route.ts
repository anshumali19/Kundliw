import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PaymentStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { RazorpayPaymentProvider } from "@/lib/payments/razorpayProvider";
import { razorpayConfigured } from "@/lib/payments/gateway";

export const dynamic = "force-dynamic";

const schema = z.object({ orderId: z.string().min(1) });

/** Starts an online (Razorpay) payment for the customer's own unpaid order. */
export async function POST(request: NextRequest) {
  try {
    if (!razorpayConfigured()) {
      return NextResponse.json({ error: "Online payment is not switched on yet. Please pay by UPI or bank transfer." }, { status: 503 });
    }
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
    if (!order || order.userId !== user.id) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.paymentStatus !== PaymentStatus.PENDING) {
      return NextResponse.json({ error: "This order is not waiting for payment." }, { status: 409 });
    }
    if (order.expiresAt && new Date() > order.expiresAt) {
      return NextResponse.json({ error: "This booking has expired. Please book again." }, { status: 409 });
    }

    const provider = new RazorpayPaymentProvider();
    const rzp = await provider.createPaymentOrder({
      orderId: order.id,
      orderNumber: order.orderNumber,
      netAmountPaise: order.netAmountPaise,
    });
    await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: rzp.providerOrderId } });

    return NextResponse.json({
      keyId: rzp.keyId,
      providerOrderId: rzp.providerOrderId,
      amountPaise: rzp.amountPaise,
      currency: rzp.currency,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Razorpay create error:", error);
    return NextResponse.json({ error: "Could not start the online payment." }, { status: 500 });
  }
}
