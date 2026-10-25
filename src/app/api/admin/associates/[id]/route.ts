import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AssociateStatus } from "@prisma/client";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications";

const bodySchema = z.object({
  status: z.nativeEnum(AssociateStatus),
  rejectionReason: z.string().trim().max(500).optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  const { id } = await context.params;

  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    const { status, rejectionReason } = parsed.data;
    if (status === AssociateStatus.REJECTED && !rejectionReason) {
      return NextResponse.json({ error: "Please give a reason for rejection." }, { status: 400 });
    }

    const existing = await prisma.associateProfile.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true, phone: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Associate not found." }, { status: 404 });
    }

    const profile = await prisma.associateProfile.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === AssociateStatus.REJECTED ? rejectionReason : null,
        reviewedAt: new Date(),
      },
    });

    if (status === AssociateStatus.APPROVED || status === AssociateStatus.REJECTED) {
      await sendNotification({
        email: existing.user.email,
        phone: existing.user.phone,
        subject:
          status === AssociateStatus.APPROVED
            ? "Your associate account is approved"
            : "Update on your associate application",
        message:
          status === AssociateStatus.APPROVED
            ? `Namaste ${existing.user.name || ""}, your associate account with Maharshi Kanad Jyotish Kendra is approved. Sign in to the Associate portal to get your referral link.`
            : `Namaste ${existing.user.name || ""}, your associate application was not approved. Reason: ${rejectionReason}`,
      });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("[API Admin Associates PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update associate." }, { status: 500 });
  }
}
