import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PaymentMode } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { markOrderPaid, PaymentError } from "@/lib/payments/service";
import { RazorpayPaymentProvider } from "@/lib/payments/razorpayProvider";
import { razorpayConfigured } from "@/lib/payments/gateway";

export const dynamic = "force-dynamic";

const schema = z.object({
  orderId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

/** Confirms a Razorpay payment by checking its signature, then marks the order paid. */
export async function POST(request: NextRequest) {
  try {
    if (!razorpayConfigured()) return NextResponse.json({ error: "Online payment is not switched on." }, { status: 503 });
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const csrf = validateCsrfOrigin(request);
    if (!csrf.isValid) return csrf.errorResponse;

    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const p = parsed.data;

    const order = await prisma.order.findUnique({ where: { id: p.orderId } });
    if (!order || order.userId !== user.id) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (!order.razorpayOrderId || order.razorpayOrderId !== p.razorpay_order_id) {
      return NextResponse.json({ error: "Payment does not match this order." }, { status: 400 });
    }

    const valid = await new RazorpayPaymentProvider().verifyPayment({
      orderId: order.id,
      providerOrderId: p.razorpay_order_id,
      providerPaymentId: p.razorpay_payment_id,
      signature: p.razorpay_signature,
    });
    if (!valid) return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });

    await markOrderPaid(order.id, {
      paymentMode: PaymentMode.RAZORPAY,
      providerPaymentId: p.razorpay_payment_id,
      signature: p.razorpay_signature,
      paidAmountPaise: order.netAmountPaise,
      note: "Paid online with Razorpay",
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PaymentError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Razorpay verify error:", error);
    return NextResponse.json({ error: "Could not confirm the payment." }, { status: 500 });
  }
}
