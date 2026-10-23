import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { normalizePhoneNumber } from "@/lib/auth/validation";

export const dynamic = "force-dynamic";

const trackLookupSchema = z.object({
  orderNumber: z.string().min(3, "Order number is required"),
  phone: z.string().min(10, "10-digit mobile number is required"),
});

/**
 * Public Order Tracker API.
 * Strict Security Guard:
 * Must provide BOTH orderNumber and phone.
 * Lookup by orderNumber alone is prohibited to prevent customer data leakage.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = trackLookupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid tracking payload" },
        { status: 400 }
      );
    }

    const { orderNumber, phone } = parsed.data;
    const cleanSearchOrder = orderNumber.trim().toUpperCase();
    const cleanSearchPhone = normalizePhoneNumber(phone);

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: {
          equals: cleanSearchOrder,
          mode: "insensitive",
        },
      },
      include: {
        service: true,
        plan: true,
        user: true,
        statusEvents: {
          orderBy: { createdAt: "desc" },
          include: {
            changedBy: {
              select: { name: true },
            },
          },
        },
      },
    });

    // Generic rejection if order does not exist
    if (!order) {
      return NextResponse.json(
        { error: "No consultation order found matching this order number and mobile combination." },
        { status: 404 }
      );
    }

    // Extract phone from Jataka details or User record
    const jataka = (order.jatakaDetails as Record<string, unknown>) || {};
    const candidatePhones: string[] = [];

    if (jataka.phone) {
      candidatePhones.push(normalizePhoneNumber(String(jataka.phone)));
    }
    if (order.user?.phone) {
      candidatePhones.push(normalizePhoneNumber(order.user.phone));
    }

    const phoneMatches = candidatePhones.some((p) => p === cleanSearchPhone);
    if (!phoneMatches) {
      return NextResponse.json(
        { error: "No consultation order found matching this order number and mobile combination." },
        { status: 404 }
      );
    }

    // Return sanitized tracking payload
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        trackingNumber: order.trackingNumber,
        paymentStatus: order.paymentStatus,
        serviceTitleEn: order.service?.titleEn || "Vedic Service",
        serviceTitleHi: order.service?.titleHi || "Vedic Service",
        planTitleEn: order.plan?.titleEn || "Standard",
        planTitleHi: order.plan?.titleHi || "Standard",
        jatakaName: String(jataka.name || order.user?.name || "Yajman"),
        statusEvents: order.statusEvents.map((e) => ({
          id: e.id,
          status: e.status,
          note: e.note,
          createdAt: e.createdAt.toISOString(),
          changedByName: e.changedBy?.name || null,
        })),
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Tracking lookup failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
