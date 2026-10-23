import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiAdmin } from "@/lib/auth/guards";
import { updateOfferInputSchema } from "@/features/services/validation";
import { rupeesToPaise } from "@/lib/billing/money";
import { DiscountType } from "@prisma/client";
import { validateCsrfOrigin } from "@/lib/auth/csrf";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const body = await request.json();
    const parsed = updateOfferInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      discountType,
      discountValue,
      maxDiscountRupees,
      minOrderValueRupees,
      ...rest
    } = parsed.data;

    const updateData: Record<string, unknown> = { ...rest };
    if (discountType !== undefined) {
      updateData.discountType = discountType;
    }
    if (discountValue !== undefined) {
      updateData.discountValuePaise =
        discountType === DiscountType.PERCENTAGE
          ? discountValue
          : rupeesToPaise(discountValue);
    }
    if (maxDiscountRupees !== undefined) {
      updateData.maxDiscountPaise = maxDiscountRupees
        ? rupeesToPaise(maxDiscountRupees)
        : null;
    }
    if (minOrderValueRupees !== undefined) {
      updateData.minOrderValuePaise = minOrderValueRupees
        ? rupeesToPaise(minOrderValueRupees)
        : 0;
    }

    const offer = await prisma.offer.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, offer });
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json(
      { error: "Failed to update offer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    await prisma.offer.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Offer deactivated successfully.",
      deactivated: true,
    });
  } catch (error) {
    console.error("Error deactivating offer:", error);
    return NextResponse.json(
      { error: "Failed to deactivate offer" },
      { status: 500 }
    );
  }
}
