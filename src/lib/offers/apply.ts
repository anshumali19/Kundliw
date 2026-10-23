export interface OfferDefinition {
  code: string;
  discountType: "FLAT" | "PERCENTAGE";
  discountValuePaise: number; // Flat paise (e.g. 50000 = Rs 500) or percent integer (e.g. 25 = 25%)
  minOrderValuePaise?: number;
  maxDiscountPaise?: number | null;
  isActive: boolean;
  validFrom?: Date;
  validUntil?: Date | null;
  usageLimit?: number | null;
  usedCount?: number;
}

export interface OfferEvaluationResult {
  isValid: boolean;
  discountPaise: number;
  reason?: string;
}

/**
 * Validates an offer code against an order amount and computes discount in paise.
 */
export function applyOffer(
  offer: OfferDefinition,
  orderAmountPaise: number,
  now: Date = new Date()
): OfferEvaluationResult {
  if (!offer.isActive) {
    return { isValid: false, discountPaise: 0, reason: "Offer is inactive" };
  }

  if (offer.validFrom && now < offer.validFrom) {
    return { isValid: false, discountPaise: 0, reason: "Offer is not yet valid" };
  }

  if (offer.validUntil && now > offer.validUntil) {
    return { isValid: false, discountPaise: 0, reason: "Offer has expired" };
  }

  if (
    offer.usageLimit !== null &&
    offer.usageLimit !== undefined &&
    (offer.usedCount ?? 0) >= offer.usageLimit
  ) {
    return { isValid: false, discountPaise: 0, reason: "Offer usage limit exceeded" };
  }

  const minOrder = offer.minOrderValuePaise ?? 0;
  if (orderAmountPaise < minOrder) {
    return {
      isValid: false,
      discountPaise: 0,
      reason: `Minimum order value of ₹${minOrder / 100} required`,
    };
  }

  let calculatedDiscount = 0;
  if (offer.discountType === "FLAT") {
    calculatedDiscount = offer.discountValuePaise;
  } else if (offer.discountType === "PERCENTAGE") {
    calculatedDiscount = Math.round(
      (orderAmountPaise * offer.discountValuePaise) / 100
    );
  }

  // Cap at max discount if specified
  if (offer.maxDiscountPaise && calculatedDiscount > offer.maxDiscountPaise) {
    calculatedDiscount = offer.maxDiscountPaise;
  }

  // Cannot discount more than order amount
  calculatedDiscount = Math.min(calculatedDiscount, orderAmountPaise);

  return {
    isValid: true,
    discountPaise: calculatedDiscount,
  };
}

export interface PrismaOfferTxLike {
  offer: {
    findUnique: (args: { where: { code: string } }) => Promise<OfferDefinition | null>;
    update: (args: {
      where: { code: string };
      data: { usedCount: { increment: number } };
    }) => Promise<unknown>;
    updateMany?: (args: {
      where: { code: string; isActive?: boolean; usedCount?: { lt: number } };
      data: { usedCount: { increment: number } };
    }) => Promise<{ count: number }>;
  };
}

/**
 * Validates offer inside a database transaction, re-checking usageLimit and validity,
 * increments usedCount conditionally, and returns computed discount in paise.
 * Throws an error on invalid or exhausted coupons to abort the transaction.
 */
export async function claimOfferInTransaction(
  tx: PrismaOfferTxLike,
  code: string,
  orderAmountPaise: number,
  now: Date = new Date()
): Promise<{ offer: OfferDefinition; discountPaise: number }> {
  const offer = await tx.offer.findUnique({
    where: { code },
  });

  if (!offer) {
    throw new Error("Invalid or unavailable coupon code.");
  }

  const evalResult = applyOffer(offer, orderAmountPaise, now);
  if (!evalResult.isValid) {
    throw new Error(evalResult.reason || "Invalid or unavailable coupon code.");
  }

  // Atomic conditional increment if usageLimit is enforced
  if (offer.usageLimit !== null && offer.usageLimit !== undefined && tx.offer.updateMany) {
    const res = await tx.offer.updateMany({
      where: {
        code,
        isActive: true,
        usedCount: { lt: offer.usageLimit },
      },
      data: { usedCount: { increment: 1 } },
    });
    if (res.count === 0) {
      throw new Error("Invalid or unavailable coupon code.");
    }
  } else {
    await tx.offer.update({
      where: { code },
      data: { usedCount: { increment: 1 } },
    });
  }

  return {
    offer,
    discountPaise: evalResult.discountPaise,
  };
}
