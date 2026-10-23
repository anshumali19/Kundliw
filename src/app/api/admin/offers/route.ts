import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiAdmin } from "@/lib/auth/guards";
import { offerInputSchema } from "@/features/services/validation";
import { rupeesToPaise } from "@/lib/billing/money";
import { DiscountType } from "@prisma/client";
import { validateCsrfOrigin } from "@/lib/auth/csrf";

export async function GET(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  const [total, offers] = await Promise.all([
    prisma.offer.count(),
    prisma.offer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { orders: true },
        },
      },
      skip,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    offers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

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
