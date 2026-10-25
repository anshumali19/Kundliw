import { NextRequest, NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";
import { guardApiAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim().slice(0, 80);
    const roleParam = searchParams.get("role");

    const where: Prisma.UserWhereInput = {};
    if (roleParam && (Object.values(Role) as string[]).includes(roleParam)) {
      where.role = roleParam as Role;
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("[API Admin Users GET] Error:", error);
    return NextResponse.json({ error: "Failed to load users." }, { status: 500 });
  }
}
