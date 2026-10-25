import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  AssociateStatus,
  CommissionStatus,
  DiscountType,
  PayoutStatus,
  Prisma,
} from "@prisma/client";

export const REFERRAL_COOKIE = "kjk_ref";
export const REFERRAL_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
/** Characters without look-alikes (no 0/O, 1/I). */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export class AssociateError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400
  ) {
    super(message);
    this.name = "AssociateError";
  }
}

type Db = Prisma.TransactionClient | typeof prisma;

export function generateReferralCode(): string {
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return `KJK${suffix}`;
}

export function normalizeReferralCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.trim().toUpperCase();
  return /^[A-Z0-9]{6,16}$/.test(code) ? code : null;
}

/** Creates the associate profile for a user if missing. Retries on a code collision. */
export async function ensureAssociateProfile(userId: string, db: Db = prisma) {
  const existing = await db.associateProfile.findUnique({ where: { userId } });
  if (existing) return existing;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await db.associateProfile.create({
        data: { userId, referralCode: generateReferralCode() },
      });
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "P2002") {
        // Either the user row raced us or the referral code collided: re-check.
        const raced = await db.associateProfile.findUnique({ where: { userId } });
        if (raced) return raced;
        continue;
      }
      throw error;
    }
  }
  throw new AssociateError("Could not generate a unique referral code.", 500);
}

/** Returns the associate profile for a referral code only when it is approved. */
export async function resolveApprovedReferral(rawCode: unknown, db: Db = prisma) {
  const code = normalizeReferralCode(rawCode);
  if (!code) return null;
  const profile = await db.associateProfile.findUnique({ where: { referralCode: code } });
  return profile && profile.status === AssociateStatus.APPROVED ? profile : null;
}

export interface CommissionBasis {
  serviceId?: string | null;
  planId?: string | null;
  taxableAmountPaise: number;
}

/** Plan rule beats service rule beats global rule. Returns 0 when no rule applies. */
export async function computeCommissionPaise(basis: CommissionBasis, db: Db = prisma): Promise<number> {
  if (basis.taxableAmountPaise <= 0) return 0;

  const rules = await db.commissionRule.findMany({
    where: {
      isActive: true,
      OR: [
        ...(basis.planId ? [{ planId: basis.planId }] : []),
        ...(basis.serviceId ? [{ serviceId: basis.serviceId, planId: null }] : []),
        { serviceId: null, planId: null },
      ],
    },
  });

  const rule =
    (basis.planId && rules.find((r) => r.planId === basis.planId)) ||
    (basis.serviceId && rules.find((r) => r.serviceId === basis.serviceId && !r.planId)) ||
    rules.find((r) => !r.serviceId && !r.planId);
  if (!rule) return 0;

  const amount =
    rule.type === DiscountType.PERCENTAGE
      ? Math.floor((basis.taxableAmountPaise * rule.value) / 10000)
      : rule.value;
  // A commission can never exceed what the customer paid before GST.
  return Math.max(0, Math.min(amount, basis.taxableAmountPaise));
}

/**
 * Attributes an order to an associate and records a pending commission.
 * Self-referrals (an associate booking with their own code) are ignored.
 */
export async function attachReferralToOrder(
  tx: Prisma.TransactionClient,
  order: {
    id: string;
    userId: string | null;
    serviceId: string | null;
    planId: string | null;
    taxableAmountPaise: number;
  },
  associateId: string
): Promise<void> {
  const associate = await tx.associateProfile.findUnique({
    where: { id: associateId },
    select: { id: true, userId: true, status: true },
  });
  if (!associate || associate.status !== AssociateStatus.APPROVED) {
    throw new AssociateError("Associate is not active.");
  }
  if (order.userId && associate.userId === order.userId) return;

  await tx.order.update({ where: { id: order.id }, data: { associateId: associate.id } });

  const amountPaise = await computeCommissionPaise(
    {
      serviceId: order.serviceId,
      planId: order.planId,
      taxableAmountPaise: order.taxableAmountPaise,
    },
    tx
  );

  await tx.commission.upsert({
    where: { orderId: order.id },
    update: {},
    create: { orderId: order.id, associateId: associate.id, amountPaise },
  });
}

/** Called when an order becomes PAID: a pending commission becomes earned. */
export async function settleCommission(tx: Prisma.TransactionClient, orderId: string): Promise<void> {
  await tx.commission.updateMany({
    where: { orderId, status: CommissionStatus.PENDING },
    data: { status: CommissionStatus.EARNED },
  });
}

/** Called when an order expires, fails or is refunded. Commissions already paid out are kept. */
export async function cancelCommission(tx: Prisma.TransactionClient, orderId: string): Promise<void> {
  await tx.commission.updateMany({
    where: {
      orderId,
      status: { in: [CommissionStatus.PENDING, CommissionStatus.EARNED] },
      payoutId: null,
    },
    data: { status: CommissionStatus.CANCELLED },
  });
}

export interface EarningsSummary {
  pendingPaise: number;
  availablePaise: number;
  requestedPaise: number;
  paidPaise: number;
  referredOrders: number;
}

export async function getEarningsSummary(associateId: string): Promise<EarningsSummary> {
  const [byStatus, requested, referredOrders] = await Promise.all([
    prisma.commission.groupBy({
      by: ["status"],
      where: { associateId },
      _sum: { amountPaise: true },
    }),
    prisma.payoutRequest.aggregate({
      where: { associateId, status: PayoutStatus.REQUESTED },
      _sum: { amountPaise: true },
    }),
    prisma.order.count({ where: { associateId } }),
  ]);
  const sum = (status: CommissionStatus) =>
    byStatus.find((row) => row.status === status)?._sum.amountPaise ?? 0;
  const requestedPaise = requested._sum.amountPaise ?? 0;
  return {
    pendingPaise: sum(CommissionStatus.PENDING),
    // Earned commissions that are not yet part of an open payout request.
    availablePaise: Math.max(0, sum(CommissionStatus.EARNED) - requestedPaise),
    requestedPaise,
    paidPaise: sum(CommissionStatus.PAID),
    referredOrders,
  };
}

/** Bundles every earned, unrequested commission into one payout request. */
export async function requestPayout(associateId: string, note?: string) {
  return prisma.$transaction(async (tx) => {
    const profile = await tx.associateProfile.findUnique({ where: { id: associateId } });
    if (!profile || profile.status !== AssociateStatus.APPROVED) {
      throw new AssociateError("Only approved associates can request a payout.", 403);
    }

    const open = await tx.payoutRequest.count({
      where: { associateId, status: PayoutStatus.REQUESTED },
    });
    if (open > 0) {
      throw new AssociateError("You already have a payout request awaiting review.", 409);
    }

    const earned = await tx.commission.findMany({
      where: { associateId, status: CommissionStatus.EARNED, payoutId: null },
      select: { id: true, amountPaise: true },
    });
    const total = earned.reduce((acc, c) => acc + c.amountPaise, 0);
    if (earned.length === 0 || total <= 0) {
      throw new AssociateError("There are no earned commissions available to request.", 409);
    }

    const payout = await tx.payoutRequest.create({
      data: { associateId, amountPaise: total, note: note?.trim() || null },
    });
    await tx.commission.updateMany({
      where: { id: { in: earned.map((c) => c.id) }, payoutId: null },
      data: { payoutId: payout.id },
    });
    return payout;
  });
}

/** Admin decision on a payout request. The money itself is paid by the client outside the system. */
export async function resolvePayout(
  payoutId: string,
  decision: "PAID" | "REJECTED",
  details: { paymentReference?: string; note?: string }
) {
  return prisma.$transaction(async (tx) => {
    const payout = await tx.payoutRequest.findUnique({ where: { id: payoutId } });
    if (!payout) throw new AssociateError("Payout request not found.", 404);
    if (payout.status !== PayoutStatus.REQUESTED) {
      throw new AssociateError("This payout request has already been processed.", 409);
    }

    if (decision === "PAID") {
      await tx.commission.updateMany({
        where: { payoutId, status: CommissionStatus.EARNED },
        data: { status: CommissionStatus.PAID },
      });
    } else {
      // Rejected: commissions return to the available balance.
      await tx.commission.updateMany({
        where: { payoutId },
        data: { payoutId: null },
      });
    }

    return tx.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status: decision === "PAID" ? PayoutStatus.PAID : PayoutStatus.REJECTED,
        paymentReference: details.paymentReference?.trim() || null,
        note: details.note?.trim() || payout.note,
        processedAt: new Date(),
      },
    });
  });
}
