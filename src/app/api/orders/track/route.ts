import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { normalizePhoneNumber } from "@/lib/auth/validation";
import { checkDbRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const trackLookupSchema = z.object({
  orderNumber: z.string().min(3, "Order number is required"),
  phone: z.string().min(10, "10-digit mobile number is required"),
});

const GENERIC_ERROR = "No consultation order found matching this order number and mobile combination.";

/**
 * Public Order Tracker API.
 * Strict Security Guard:
 * Must provide BOTH orderNumber and phone.
 * Rate-limited per IP and per orderNumber to prevent brute-force attacks.
 * Lookup by orderNumber alone is prohibited to prevent customer data leakage.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);

    // 1. Rate-limit per IP (15 lookups per 60 seconds)
    const ipLimit = await checkDbRateLimit({
      scope: "TRACK_IP",
      identifier: ip,
      windowSeconds: 60,
      maxAllowed: 15,
    });

    if (!ipLimit.allowed) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 429 });
    }

    const body = await request.json();
    const parsed = trackLookupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
    }

    const { orderNumber, phone } = parsed.data;
    const cleanSearchOrder = orderNumber.trim().toUpperCase();
    const cleanSearchPhone = normalizePhoneNumber(phone);

    // 2. Rate-limit per order number (5 lookups per 60 seconds)
    const orderLimit = await checkDbRateLimit({
      scope: "TRACK_ORDER",
      identifier: cleanSearchOrder,
      windowSeconds: 60,
      maxAllowed: 5,
    });

    if (!orderLimit.allowed) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 429 });
    }

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
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 404 });
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
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 404 });
    }

    // Return sanitized tracking payload
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        courierName: order.courierName,
        trackingNumber: order.trackingNumber,
        paymentStatus: order.paymentStatus,
        serviceTitleEn: order.service?.titleEn || "Vedic Service",
        serviceTitleHi: order.service?.titleHi || "Vedic Service",
        planTitleEn: order.plan?.titleEn || "Standard",
        planTitleHi: order.plan?.titleHi || "Standard",
        jatakaName: String(jataka.name || order.user?.name || "Customer"),
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
    console.error("Order tracking lookup failed:", error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
