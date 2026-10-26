import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { credentialUpdateSchema } from "@/lib/content/credentials";

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const parsed = credentialUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please check the details." },
        { status: 400 }
      );
    }
    const item = await prisma.credential.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ success: true, item });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }
    console.error("[API Admin Credentials PUT] Error:", error);
    return NextResponse.json({ error: "Failed to update document." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    await prisma.credential.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }
    console.error("[API Admin Credentials DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to remove document." }, { status: 500 });
  }
}
