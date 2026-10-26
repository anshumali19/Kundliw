import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiAdmin } from "@/lib/auth/guards";
import { updateOfferInputSchema } from "@/features/services/validation";
import { rupeesToPaise } from "@/lib/billing/money";
import { DiscountType } from "@prisma/client";
import { validateCsrfOrigin } from "@/lib/auth/csrf";

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

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
      // For a partial update the request may omit discountType. Resolve it from
      // the stored offer so percentages stay integers instead of being
      // multiplied by 100 by rupeesToPaise().
      let effectiveType = discountType;
      if (effectiveType === undefined) {
        const existing = await prisma.offer.findUnique({
          where: { id: params.id },
          select: { discountType: true },
        });
        if (!existing) {
          return NextResponse.json({ error: "Offer not found" }, { status: 404 });
        }
        effectiveType = existing.discountType;
      }

      updateData.discountValuePaise =
        effectiveType === DiscountType.PERCENTAGE
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

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const used = await prisma.order.count({ where: { offerId: params.id } });
    if (used > 0) {
      await prisma.offer.update({ where: { id: params.id }, data: { isActive: false } });
      return NextResponse.json({
        success: true,
        message: `This offer was used on ${used} order(s). It has been deactivated so those records stay intact.`,
        deactivated: true,
      });
    }

    await prisma.offer.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: "Offer removed.", deactivated: false });
  } catch (error) {
    console.error("Error removing offer:", error);
    return NextResponse.json(
      { error: "Failed to remove offer" },
      { status: 500 }
    );
  }
}
