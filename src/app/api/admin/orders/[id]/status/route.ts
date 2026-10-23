import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { isValidStatusTransition } from "@/lib/orders/status";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateStatusSchema = z.object({
  nextStatus: z.nativeEnum(OrderStatus),
  note: z.string().min(2, "Note is required for every status transition"),
  courierName: z.string().optional(),
  trackingNumber: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guard = await guardApiAdmin();
    if (guard.errorResponse) return guard.errorResponse;
    const admin = guard.user;

    const orderId = params.id;

    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid status payload" },
        { status: 400 }
      );
    }

    const { nextStatus, note, courierName, trackingNumber } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { plan: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Validate transition
    const isDigitalOnly = order.plan ? !order.plan.pages : false;
    const isAllowed = isValidStatusTransition(order.status, nextStatus, isDigitalOnly);
    if (!isAllowed) {
      return NextResponse.json(
        {
          error: `Invalid status transition from ${order.status} to ${nextStatus}.`,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.order.update({
        where: { id: orderId },
        data: {
          status: nextStatus,
          courierName: courierName || order.courierName,
          trackingNumber: trackingNumber || order.trackingNumber,
        },
      });

      await tx.orderStatusEvent.create({
        data: {
          orderId,
          status: nextStatus,
          note: note.trim(),
          changedById: admin.id,
        },
      });

      return u;
    });

    return NextResponse.json({
      success: true,
      order: updated,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
