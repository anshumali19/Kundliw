import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiAdmin } from "@/lib/auth/guards";
import { packageInputSchema } from "@/features/services/validation";
import { validateCsrfOrigin } from "@/lib/auth/csrf";

export async function POST(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const parsed = packageInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { serviceId, slug } = parsed.data;

    const service = await prisma.service.findUnique({ where: { id: serviceId }, select: { id: true } });
    if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });

    const existing = await prisma.servicePackage.findUnique({ where: { serviceId_slug: { serviceId, slug } } });
    if (existing) {
      return NextResponse.json({ error: `A package with slug "${slug}" already exists for this service.` }, { status: 409 });
    }

    const pkg = await prisma.servicePackage.create({ data: parsed.data });
    return NextResponse.json({ success: true, package: pkg }, { status: 201 });
  } catch (error) {
    console.error("Error creating package:", error);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
