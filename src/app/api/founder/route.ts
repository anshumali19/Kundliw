import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const profile = await prisma.founderProfile.findUnique({
      where: { id: "default" },
    });
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("[API Founder GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to load founder profile" },
      { status: 500 }
    );
  }
}
