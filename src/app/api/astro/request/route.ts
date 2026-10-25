import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getNextOrderNumber } from "@/lib/booking/service";
import { OrderStatus, PaymentStatus, PaymentMode, RequestType, Prisma } from "@prisma/client";
import { astroRequestSchema } from "@/features/astro/validation";
import { checkDbRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const RATE_LIMIT_MESSAGE =
  "Too many requests. Please try again after some time.";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const clientIp = getClientIp(request.headers);

    // Anonymous zero-value order creation is limited per IP; signed-in
    // customers get a separate, slightly higher allowance.
    const limit = await checkDbRateLimit({
      scope: user ? "ASTRO_REQUEST_USER" : "ASTRO_REQUEST_ANON",
      identifier: user?.id || clientIp,
      windowSeconds: 3600,
      maxAllowed: user ? 20 : 5,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: RATE_LIMIT_MESSAGE },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfterSeconds ?? 3600),
          },
        }
      );
    }

    const body = await request.json();
    const parsed = astroRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { requestType, jatakaDetails } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const orderNumber = await getNextOrderNumber(tx);

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user?.id || null,
          requestType: requestType as RequestType,
          status: OrderStatus.ORDER_RECEIVED,
          paymentStatus: PaymentStatus.PENDING,
          paymentMode: PaymentMode.RAZORPAY,
          jatakaDetails: jatakaDetails as unknown as Prisma.InputJsonValue,
          baseAmountPaise: 0,
          discountAmountPaise: 0,
          taxableAmountPaise: 0,
          gstRateBasisPoints: 0,
          gstAmountPaise: 0,
          netAmountPaise: 0,
        },
      });

      await tx.orderStatusEvent.create({
        data: {
          orderId: order.id,
          status: OrderStatus.ORDER_RECEIVED,
          note: `Vedic request form submitted (${requestType.replace(/_/g, " ")}). Awaiting Kendra team examination.`,
          changedById: user?.id || null,
        },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      orderId: result.id,
      orderNumber: result.orderNumber,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to record request";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
