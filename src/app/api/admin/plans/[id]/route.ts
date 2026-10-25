import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiAdmin } from "@/lib/auth/guards";
import { planInputSchema } from "@/features/services/validation";
import { rupeesToPaise } from "@/lib/billing/money";
import { validateCsrfOrigin } from "@/lib/auth/csrf";

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const body = await request.json();
    const parsed = planInputSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { priceRupees, originalPriceRupees, ...rest } = parsed.data;

    const updateData: Record<string, unknown> = { ...rest };
    if (priceRupees !== undefined) {
      updateData.pricePaise = rupeesToPaise(priceRupees);
    }
    if (originalPriceRupees !== undefined) {
      updateData.originalPricePaise = originalPriceRupees
        ? rupeesToPaise(originalPriceRupees)
        : null;
    }

    const plan = await prisma.plan.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
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
    const ordersCount = await prisma.order.count({
      where: { planId: params.id },
    });

    if (ordersCount > 0) {
      await prisma.plan.update({
        where: { id: params.id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: `Plan has ${ordersCount} associated orders. It has been deactivated to preserve order records.`,
        deactivated: true,
      });
    }

    await prisma.plan.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Plan deactivated successfully.",
      deactivated: true,
    });
  } catch (error) {
    console.error("Error deactivating plan:", error);
    return NextResponse.json(
      { error: "Failed to deactivate plan" },
      { status: 500 }
    );
  }
}
