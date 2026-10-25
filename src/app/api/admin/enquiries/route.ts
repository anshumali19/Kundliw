import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // "all" | "pending" | "resolved"

  try {
    const where: any = {};
    if (status === "pending") where.isResolved = false;
    else if (status === "resolved") where.isResolved = true;

    const enquiries = await prisma.contactEnquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, enquiries });
  } catch (error) {
    console.error("[API Admin Enquiries GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to load enquiries." },
      { status: 500 }
    );
  }
}
