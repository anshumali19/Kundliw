import { NextResponse } from "next/server";
import { guardApiAssociate } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { ensureAssociateProfile, getEarningsSummary } from "@/lib/associates/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await guardApiAssociate();
  if (!guard.ok) return guard.errorResponse;

  try {
    const profile = await ensureAssociateProfile(guard.user.id);
    const [earnings, commissions, payouts] = await Promise.all([
      getEarningsSummary(profile.id),
      prisma.commission.findMany({
        where: { associateId: profile.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          order: {
            select: {
              orderNumber: true,
              createdAt: true,
              paymentStatus: true,
              service: { select: { titleEn: true, titleHi: true } },
            },
          },
        },
      }),
      prisma.payoutRequest.findMany({
        where: { associateId: profile.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return NextResponse.json({
      profile: {
        status: profile.status,
        referralCode: profile.referralCode,
        rejectionReason: profile.rejectionReason,
      },
      earnings,
      commissions,
      payouts,
    });
  } catch (error) {
    console.error("[API Associate Summary] Error:", error);
    return NextResponse.json({ error: "Failed to load associate summary." }, { status: 500 });
  }
}
