import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  try {
    const where: any = { isActive: true };
    if (category) {
      where.category = category.toUpperCase();
    }

    const items = await prisma.faqItem.findMany({
      where,
      orderBy: [{ category: "asc" }, { orderIndex: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("[API FAQ GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve FAQs" },
      { status: 500 }
    );
  }
}
