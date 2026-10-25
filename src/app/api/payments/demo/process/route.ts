import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { markOrderPaid, PaymentError } from "@/lib/payments/service";
import { isDemoMode } from "@/lib/config/demo";
import { PaymentMode, PaymentStatus, Role } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

const demoPaymentSchema = z.object({
  orderId: z.string().min(1),
  action: z.enum(["SIMULATE_SUCCESS", "SIMULATE_FAILURE"]),
});

export async function POST(request: NextRequest) {
  try {
    // Simulation backdoor: never available in production builds and only when
    // DEMO_MODE is explicitly enabled. Respond 404 so the route is invisible.
    if (!isDemoMode() || process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = demoPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment payload" }, { status: 400 });
    }

    const { orderId, action } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isOwner = order.userId === user.id;
    const isAdmin = user.role === Role.ADMIN;
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "SIMULATE_SUCCESS") {
      const updatedOrder = await markOrderPaid(orderId, {
        paymentMode: PaymentMode.RAZORPAY,
        providerPaymentId: `demo_pay_${Date.now()}`,
        paidAmountPaise: order.netAmountPaise,
        note: "Simulated online gateway checkout completed (Demo Mode)",
      });

      return NextResponse.json({
        success: true,
        orderId: updatedOrder.id,
        paymentStatus: updatedOrder.paymentStatus,
      });
    } else {
      if (order.paymentStatus === PaymentStatus.PAID) {
        return NextResponse.json(
          { error: "A paid order cannot be marked as failed." },
          { status: 409 }
        );
      }

      // Conditional update: never downgrade an order that became PAID between
      // the ownership check above and this write.
      const result = await prisma.order.updateMany({
        where: { id: orderId, paymentStatus: { not: PaymentStatus.PAID } },
        data: { paymentStatus: PaymentStatus.FAILED },
      });

      if (result.count === 0) {
        return NextResponse.json(
          { error: "A paid order cannot be marked as failed." },
          { status: 409 }
        );
      }

      await prisma.orderStatusEvent.create({
        data: {
          orderId,
          status: order.status,
          note: "Simulated online gateway transaction was declined/failed (Demo Mode).",
        },
      });

      return NextResponse.json({
        success: false,
        error: "Simulated payment was marked as failed.",
      });
    }
  } catch (error) {
    if (error instanceof PaymentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Internal error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
