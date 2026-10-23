import { describe, it, expect } from "vitest";
import {
  applyOffer,
  claimOfferInTransaction,
  OfferDefinition,
  PrismaOfferTxLike,
} from "../src/lib/offers/apply";

describe("Offer Application Logic", () => {
  const flatOffer: OfferDefinition = {
    code: "VEDIC500",
    discountType: "FLAT",
    discountValuePaise: 50000, // ₹500
    minOrderValuePaise: 150000, // ₹1,500
    isActive: true,
  };

  it("applies a flat discount when minimum order value is satisfied", () => {
    const result = applyOffer(flatOffer, 210000); // ₹2,100
    expect(result.isValid).toBe(true);
    expect(result.discountPaise).toBe(50000); // ₹500
  });

  it("rejects offer when order amount is below minimum required", () => {
    const result = applyOffer(flatOffer, 110000); // ₹1,100 < ₹1,500
    expect(result.isValid).toBe(false);
    expect(result.discountPaise).toBe(0);
    expect(result.reason).toContain("Minimum order value");
  });

  it("computes percentage discount and respects maximum discount ceiling", () => {
    const percentOffer: OfferDefinition = {
      code: "SHUBH25",
      discountType: "PERCENTAGE",
      discountValuePaise: 25, // 25%
      maxDiscountPaise: 100000, // Max ₹1,000
      isActive: true,
    };

    // 25% of ₹5,100 (510,000 paise) is ₹1,275 (127,500 paise), which exceeds cap of ₹1,000
    const resultWithCap = applyOffer(percentOffer, 510000);
    expect(resultWithCap.isValid).toBe(true);
    expect(resultWithCap.discountPaise).toBe(100000);

    // 25% of ₹2,100 (210,000 paise) is ₹525 (52,500 paise), under cap
    const resultUnderCap = applyOffer(percentOffer, 210000);
    expect(resultUnderCap.isValid).toBe(true);
    expect(resultUnderCap.discountPaise).toBe(52500);
  });

  it("rejects inactive or expired offers", () => {
    const inactiveOffer: OfferDefinition = {
      ...flatOffer,
      isActive: false,
    };
    expect(applyOffer(inactiveOffer, 210000).isValid).toBe(false);

    const expiredOffer: OfferDefinition = {
      ...flatOffer,
      validUntil: new Date("2020-01-01"),
    };
    expect(applyOffer(expiredOffer, 210000).isValid).toBe(false);
  });

  it("rejects offers exceeding usage limit", () => {
    const exhaustedOffer: OfferDefinition = {
      ...flatOffer,
      usageLimit: 10,
      usedCount: 10,
    };
    const result = applyOffer(exhaustedOffer, 210000);
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain("usage limit exceeded");
  });
});

describe("Transactional Offer Claiming (claimOfferInTransaction)", () => {
  it("atomically verifies offer and increments usedCount in active transaction", async () => {
    let currentUsedCount = 5;
    const mockTx: PrismaOfferTxLike = {
      offer: {
        findUnique: async () => ({
          code: "FESTIVE500",
          discountType: "FLAT",
          discountValuePaise: 50000,
          minOrderValuePaise: 150000,
          usageLimit: 10,
          usedCount: currentUsedCount,
          isActive: true,
        }),
        update: async ({ data }) => {
          currentUsedCount += data.usedCount.increment;
          return {};
        },
      },
    };

    const res = await claimOfferInTransaction(mockTx, "FESTIVE500", 210000);
    expect(res.discountPaise).toBe(50000);
    expect(currentUsedCount).toBe(6);
  });

  it("throws loudly inside transaction if offer usageLimit has been reached", async () => {
    const mockTx: PrismaOfferTxLike = {
      offer: {
        findUnique: async () => ({
          code: "LIMITED1",
          discountType: "FLAT",
          discountValuePaise: 50000,
          minOrderValuePaise: 100000,
          usageLimit: 1,
          usedCount: 1, // Already reached limit
          isActive: true,
        }),
        update: async () => ({}),
      },
    };

    await expect(
      claimOfferInTransaction(mockTx, "LIMITED1", 200000)
    ).rejects.toThrow("usage limit exceeded");
  });
});
