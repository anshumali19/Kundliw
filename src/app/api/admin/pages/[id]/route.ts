import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const pageUpdateSchema = z.object({
  titleEn: z.string().min(2).optional(),
  titleHi: z.string().min(2).optional(),
  contentEn: z.string().min(10).optional(),
  contentHi: z.string().min(10).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await guardApiAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Administrator access required" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = pageUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const page = await prisma.staticPage.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, page });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update page";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await guardApiAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Administrator access required" }, { status: 401 });
    }

    await prisma.staticPage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Page deleted" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to delete page";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
