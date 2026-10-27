import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateOfferQuerySchema } from "@/features/services/validation";
import { getCurrentUser } from "@/lib/auth/guards";
import { applyOffer } from "@/lib/offers/apply";
import { calculateGst, formatPaiseToInr } from "@/lib/billing/gst";
import { getGstSettings } from "@/lib/billing/gstSettings";
import { getClientIp, checkDbRateLimit } from "@/lib/rateLimit";
import { expireOverdueOrders } from "@/lib/booking/service";

const GENERIC_UNAVAILABLE_MESSAGE = "Invalid or unavailable coupon code.";

export async function POST(request: NextRequest) {
  try {
    // 1. Rate-limit coupon validation per IP to prevent code brute-forcing
    const clientIp = getClientIp(request.headers);
    const ipRate = await checkDbRateLimit({
      scope: "OFFER_VALIDATE_IP",
      identifier: clientIp,
      windowSeconds: 60,
      maxAllowed: 20, // Max 20 attempts per minute per IP
    });

    if (!ipRate.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Retry in ${ipRate.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = validateOfferQuerySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({
        isValid: false,
        reason: GENERIC_UNAVAILABLE_MESSAGE,
      });
    }

    const { code, planId } = parsed.data;

    // Fetch plan from database - NEVER trust client price
    // Release abandoned reservations first so coupon usage counts are accurate.
    try {
      await expireOverdueOrders();
    } catch (error) {
      console.error("Failed to expire overdue orders before coupon validation:", error);
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId, isActive: true },
      select: {
        id: true,
        titleEn: true,
        titleHi: true,
        pricePaise: true,
        service: { select: { slug: true } },
      },
    });

    if (!plan) {
      return NextResponse.json({
        isValid: false,
        reason: GENERIC_UNAVAILABLE_MESSAGE,
      });
    }

    // Fetch offer from database
    const offer = await prisma.offer.findUnique({
      where: { code },
    });

    if (!offer) {
      return NextResponse.json({
        isValid: false,
        reason: GENERIC_UNAVAILABLE_MESSAGE,
      });
    }

    // Server-side pure evaluation of offer against plan price
    const user = await getCurrentUser().catch(() => null);
    const userUses =
      user && (offer.perUserLimit ?? 0) > 0
        ? await prisma.order
            .count({
            where: { userId: user.id, offerCode: offer.code, paymentStatus: { notIn: ["FAILED", "REFUNDED"] } },
          })
            .catch(() => 0)
        : 0;
    const evalResult = applyOffer(offer, plan.pricePaise, new Date(), {
      serviceSlug: plan.service?.slug,
      planId: plan.id,
      userUses,
    });

    if (!evalResult.isValid) {
      // Switched-off codes stay generic; for live codes tell the customer exactly what is missing.
      return NextResponse.json({
        isValid: false,
        reason: offer.isActive ? evalResult.reason : GENERIC_UNAVAILABLE_MESSAGE,
      });
    }

    // Compute verified billing math using the same AdminSettings source as
    // order creation, so preview and checkout totals always match.
    const gst = await getGstSettings();
    const billing = calculateGst({
      baseAmountPaise: plan.pricePaise,
      discountAmountPaise: evalResult.discountPaise,
      gstRateBasisPoints: gst.rateBasisPoints,
    });

    return NextResponse.json({
      isValid: true,
      code: offer.code,
      titleEn: offer.titleEn,
      titleHi: offer.titleHi,
      discountPaise: evalResult.discountPaise,
      discountFormatted: formatPaiseToInr(evalResult.discountPaise),
      netAmountPaise: billing.netAmountPaise,
      netAmountFormatted: formatPaiseToInr(billing.netAmountPaise),
      gstAmountPaise: billing.gstAmountPaise,
      taxableAmountPaise: billing.taxableAmountPaise,
      gstRateBasisPoints: gst.rateBasisPoints,
      gstRateLabel: gst.label,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({
      isValid: false,
      reason: GENERIC_UNAVAILABLE_MESSAGE,
    });
  }
}
