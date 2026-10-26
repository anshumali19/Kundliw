import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { credentialInputSchema } from "@/lib/content/credentials";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  try {
    const items = await prisma.credential.findMany({ orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }] });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("[API Admin Credentials GET] Error:", error);
    return NextResponse.json({ error: "Failed to load documents." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const parsed = credentialInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please check the details.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const item = await prisma.credential.create({ data: parsed.data });
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("[API Admin Credentials POST] Error:", error);
    return NextResponse.json({ error: "Failed to save document." }, { status: 500 });
  }
}
