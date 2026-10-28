import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiAdmin } from "@/lib/auth/guards";
import { packageInputSchema } from "@/features/services/validation";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { jsonOrNull } from "@/lib/content/json";

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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
    const current = await prisma.servicePackage.findUnique({ where: { id: params.id } });
    if (!current) return NextResponse.json({ error: "Package not found." }, { status: 404 });

    const { serviceId, slug, itineraryDays, additionalLinks, ...rest } = parsed.data;
    if (slug !== current.slug) {
      const clash = await prisma.servicePackage.findUnique({ where: { serviceId_slug: { serviceId: current.serviceId, slug } } });
      if (clash) return NextResponse.json({ error: `A package with slug "${slug}" already exists for this service.` }, { status: 409 });
    }

    const pkg = await prisma.servicePackage.update({
      where: { id: params.id },
      data: { slug, ...rest, itineraryDays: jsonOrNull(itineraryDays), additionalLinks: jsonOrNull(additionalLinks) },
    });
    return NextResponse.json({ success: true, package: pkg });
  } catch (error) {
    console.error("Error updating package:", error);
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const plans = await prisma.plan.count({ where: { packageId: params.id } });
    if (plans > 0) {
      return NextResponse.json(
        { error: `This package still has ${plans} plan(s). Move or delete them first, or switch the package off instead.` },
        { status: 409 }
      );
    }
    await prisma.servicePackage.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting package:", error);
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 });
  }
}
