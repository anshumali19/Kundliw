import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiAdmin } from "@/lib/auth/guards";
import { offerInputSchema } from "@/features/services/validation";
import { rupeesToPaise } from "@/lib/billing/money";
import { DiscountType } from "@prisma/client";

export async function GET() {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

  const offers = await prisma.offer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { orders: true },
      },
    },
  });

  return NextResponse.json({ offers });
}

export async function POST(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

  try {
    const body = await request.json();
    const parsed = offerInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      code,
      discountType,
      discountValue,
      maxDiscountRupees,
      minOrderValueRupees,
      ...rest
    } = parsed.data;

    // Convert values to paise at the boundary
    const discountValuePaise =
      discountType === DiscountType.FLAT
        ? rupeesToPaise(discountValue)
        : discountValue; // Integer percentage for PERCENTAGE

    const maxDiscountPaise = maxDiscountRupees
      ? rupeesToPaise(maxDiscountRupees)
      : null;

    const minOrderValuePaise = minOrderValueRupees
      ? rupeesToPaise(minOrderValueRupees)
      : 0;

    const existing = await prisma.offer.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: `An offer with code "${code}" already exists.` },
        { status: 409 }
      );
    }

    const offer = await prisma.offer.create({
      data: {
        code,
        discountType,
        discountValuePaise,
        maxDiscountPaise,
        minOrderValuePaise,
        ...rest,
      },
    });

    return NextResponse.json({ success: true, offer }, { status: 201 });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}
