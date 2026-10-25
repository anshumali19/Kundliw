import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { AssociateError, resolvePayout } from "@/lib/associates/service";
import { sendNotification } from "@/lib/notifications";

const bodySchema = z.object({
  decision: z.enum(["PAID", "REJECTED"]),
  paymentReference: z.string().trim().max(120).optional(),
  note: z.string().trim().max(500).optional(),
});

/** Marks a payout as paid (the client pays the associate outside this system) or rejects it. */
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
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    if (parsed.data.decision === "REJECTED" && !parsed.data.note) {
      return NextResponse.json({ error: "Please give a reason for rejection." }, { status: 400 });
    }

    const payout = await resolvePayout(id, parsed.data.decision, {
      paymentReference: parsed.data.paymentReference,
      note: parsed.data.note,
    });

    const associate = await prisma.associateProfile.findUnique({
      where: { id: payout.associateId },
      select: { user: { select: { name: true, email: true, phone: true } } },
    });
    if (associate) {
      const rupees = (payout.amountPaise / 100).toLocaleString("en-IN");
      await sendNotification({
        email: associate.user.email,
        phone: associate.user.phone,
        subject: payout.status === "PAID" ? "Your payout is marked as paid" : "Your payout request was declined",
        message:
          payout.status === "PAID"
            ? `Namaste ${associate.user.name || ""}, your payout of Rs. ${rupees} has been marked as paid${payout.paymentReference ? ` (reference ${payout.paymentReference})` : ""}.`
            : `Namaste ${associate.user.name || ""}, your payout request of Rs. ${rupees} was declined. ${payout.note || ""}`,
      });
    }

    return NextResponse.json({ success: true, payout });
  } catch (error) {
    if (error instanceof AssociateError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[API Admin Payouts PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to process payout." }, { status: 500 });
  }
}
