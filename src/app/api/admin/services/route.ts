import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiAdmin } from "@/lib/auth/guards";
import { serviceInputSchema } from "@/features/services/validation";

export async function GET() {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

  const services = await prisma.service.findMany({
    include: {
      plans: {
        orderBy: { orderIndex: "asc" },
      },
      _count: {
        select: { orders: true },
      },
    },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json({ services });
}

export async function POST(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

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
