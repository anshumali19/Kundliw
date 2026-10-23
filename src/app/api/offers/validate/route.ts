import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateOfferQuerySchema } from "@/features/services/validation";
import { applyOffer } from "@/lib/offers/apply";
import { calculateGst, formatPaiseToInr } from "@/lib/billing/gst";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = validateOfferQuerySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid coupon code or plan request." },
        { status: 400 }
      );
    }

    const { code, planId } = parsed.data;

    // Fetch plan from database - NEVER trust client price
    const plan = await prisma.plan.findUnique({
      where: { id: planId, isActive: true },
      select: {
        id: true,
        titleEn: true,
        titleHi: true,
        pricePaise: true,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Requested plan is not found or is currently unavailable." },
        { status: 404 }
      );
    }

    // Fetch offer from database
    const offer = await prisma.offer.findUnique({
      where: { code },
    });

    if (!offer) {
      return NextResponse.json({
        isValid: false,
        reason: "Coupon code does not exist.",
      });
    }

    // Server-side pure evaluation of offer against plan price
    const evalResult = applyOffer(offer, plan.pricePaise);

    if (!evalResult.isValid) {
      return NextResponse.json({
        isValid: false,
        reason: evalResult.reason || "Coupon is not applicable to this plan.",
      });
    }

    // Compute verified billing math
    const billing = calculateGst({
      baseAmountPaise: plan.pricePaise,
      discountAmountPaise: evalResult.discountPaise,
      gstRateBasisPoints: 1800,
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
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon code." },
      { status: 500 }
    );
  }
}
