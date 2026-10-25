import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.otherService.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
    });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("[API OtherServices GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to load other services." },
      { status: 500 }
    );
  }
}
