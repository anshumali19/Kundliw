import { NextRequest, NextResponse } from "next/server";
import { AssociateStatus, Prisma } from "@prisma/client";
import { guardApiAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const q = (searchParams.get("q") || "").trim();

    const where: Prisma.AssociateProfileWhereInput = {};
    if (status && status in AssociateStatus) {
      where.status = status as AssociateStatus;
    }
    if (q) {
      where.OR = [
        { referralCode: { contains: q.toUpperCase() } },
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
        { user: { phone: { contains: q } } },
      ];
    }

    const associates = await prisma.associateProfile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
        _count: { select: { orders: true } },
      },
    });

    const sums = await prisma.commission.groupBy({
      by: ["associateId", "status"],
      where: { associateId: { in: associates.map((a) => a.id) } },
      _sum: { amountPaise: true },
    });

    const rows = associates.map((a) => {
      const sum = (s: string) =>
        sums.find((x) => x.associateId === a.id && x.status === s)?._sum.amountPaise ?? 0;
      return {
        id: a.id,
        status: a.status,
        referralCode: a.referralCode,
        rejectionReason: a.rejectionReason,
        createdAt: a.createdAt,
        user: a.user,
        orders: a._count.orders,
        earnedPaise: sum("EARNED"),
        paidPaise: sum("PAID"),
        pendingPaise: sum("PENDING"),
      };
    });

    return NextResponse.json({ associates: rows });
  } catch (error) {
    console.error("[API Admin Associates GET] Error:", error);
    return NextResponse.json({ error: "Failed to load associates." }, { status: 500 });
  }
}
