import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { guardApiAdmin } from "@/lib/auth/guards";
import { serviceInputSchema } from "@/features/services/validation";
import { validateCsrfOrigin } from "@/lib/auth/csrf";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const body = await request.json();
    const parsed = serviceInputSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        ...(parsed.data.additionalLinks === null ? { additionalLinks: Prisma.JsonNull } : {}),
      } as Prisma.ServiceUpdateInput,
    });

    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const ordersCount = await prisma.order.count({
      where: { serviceId: params.id },
    });

    // If orders exist, hard delete is blocked; apply soft delete via isActive = false
    if (ordersCount > 0) {
      await prisma.service.update({
        where: { id: params.id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: `Service has ${ordersCount} associated orders. It has been deactivated rather than deleted to preserve order integrity.`,
        deactivated: true,
      });
    }

    // If no orders exist, deactivate service
    await prisma.service.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Service deactivated successfully.",
      deactivated: true,
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to deactivate service" },
      { status: 500 }
    );
  }
}
