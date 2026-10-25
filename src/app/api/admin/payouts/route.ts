import { NextRequest, NextResponse } from "next/server";
import { PayoutStatus } from "@prisma/client";
import { guardApiAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  try {
    const status = new URL(request.url).searchParams.get("status");
    const payouts = await prisma.payoutRequest.findMany({
      where: status && status in PayoutStatus ? { status: status as PayoutStatus } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        associate: {
          select: {
            referralCode: true,
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        _count: { select: { commissions: true } },
      },
    });
    return NextResponse.json({ payouts });
  } catch (error) {
    console.error("[API Admin Payouts GET] Error:", error);
    return NextResponse.json({ error: "Failed to load payout requests." }, { status: 500 });
  }
}
