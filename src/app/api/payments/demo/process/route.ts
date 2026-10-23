import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/lib/payments/service";
import { PaymentMode, Role } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

const demoPaymentSchema = z.object({
  orderId: z.string().min(1),
  action: z.enum(["SIMULATE_SUCCESS", "SIMULATE_FAILURE"]),
});

export async function POST(request: NextRequest) {
  try {
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
        note: "Simulated online gateway checkout completed (Demo Mode)",
      });

      return NextResponse.json({
        success: true,
        orderId: updatedOrder.id,
        paymentStatus: updatedOrder.paymentStatus,
      });
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "FAILED" },
      });

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
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
