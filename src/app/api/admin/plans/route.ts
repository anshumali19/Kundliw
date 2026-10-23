import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiAdmin } from "@/lib/auth/guards";
import { planInputSchema } from "@/features/services/validation";
import { rupeesToPaise } from "@/lib/billing/money";
import { validateCsrfOrigin } from "@/lib/auth/csrf";

export async function POST(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const body = await request.json();
    const parsed = planInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      serviceId,
      slug,
      priceRupees,
      originalPriceRupees,
      ...rest
    } = parsed.data;

    // Boundary conversion from Rupees to Paise
    const pricePaise = rupeesToPaise(priceRupees);
    const originalPricePaise = originalPriceRupees
      ? rupeesToPaise(originalPriceRupees)
      : null;

    const existing = await prisma.plan.findUnique({
      where: {
        serviceId_slug: {
          serviceId,
          slug,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A plan with slug "${slug}" already exists for this service.` },
        { status: 409 }
      );
    }

    const plan = await prisma.plan.create({
      data: {
        serviceId,
        slug,
        pricePaise,
        originalPricePaise,
        ...rest,
      },
    });

    return NextResponse.json({ success: true, plan }, { status: 201 });
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
