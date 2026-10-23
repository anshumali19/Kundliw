import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiAdmin } from "@/lib/auth/guards";
import { serviceInputSchema } from "@/features/services/validation";
import { validateCsrfOrigin } from "@/lib/auth/csrf";

export async function GET(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  const [total, services] = await Promise.all([
    prisma.service.count(),
    prisma.service.findMany({
      include: {
        plans: {
          orderBy: { orderIndex: "asc" },
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { orderIndex: "asc" },
      skip,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    services,
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
    const parsed = serviceInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { slug } = parsed.data;
    const existing = await prisma.service.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: `A service with slug "${slug}" already exists.` },
        { status: 409 }
      );
    }

    const service = await prisma.service.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, service }, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
