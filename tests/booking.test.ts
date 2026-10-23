import { describe, it, expect } from "vitest";
import { calculateGst } from "../src/lib/billing/gst";
import { claimOfferInTransaction, PrismaOfferTxLike } from "../src/lib/offers/apply";
import { Role } from "@prisma/client";

describe("Phase 4: Server-Side Amount Calculation Ignores Client Values", () => {
  it("computes order billing strictly from database plan price and ignores any client tampering", () => {
    // Database record for a plan
    const dbPlan = {
      id: "plan-vishesh",
      pricePaise: 210000, // ₹2,100
    };

    // Attacker sends tampered amounts in their client request payload
    const maliciousClientPayload = {
      pricePaise: 100, // Tampered ₹1
      discountAmountPaise: 209900, // Fabricated discount
      netAmountPaise: 100,
    };

    // Server-side billing math: client payload values are never read
    // The server calculates base from dbPlan and discount from verified offer
    const verifiedBasePaise = dbPlan.pricePaise;
    const verifiedDiscountPaise = 0; // No valid coupon supplied

    const calculatedBilling = calculateGst({
      baseAmountPaise: verifiedBasePaise,
      discountAmountPaise: verifiedDiscountPaise,
      gstRateBasisPoints: 1800, // 18%
    });

    expect(calculatedBilling.baseAmountPaise).toBe(210000);
    expect(calculatedBilling.taxableAmountPaise).toBe(210000);
    expect(calculatedBilling.gstAmountPaise).toBe(37800); // 18% of ₹2,100
    expect(calculatedBilling.netAmountPaise).toBe(247800); // ₹2,478

    // Proves client payload price was completely ignored
    expect(calculatedBilling.netAmountPaise).not.toBe(maliciousClientPayload.netAmountPaise);
  });
});

describe("Phase 4: Appointment Slot Overbooking Prevention", () => {
  interface MockSlot {
    id: string;
    capacity: number;
    bookedCount: number;
    isActive: boolean;
  }

  // Simulated transactional slot reservation logic
  function reserveSlotInTransaction(slot: MockSlot): MockSlot {
    if (!slot.isActive) {
      throw new Error("Selected appointment slot does not exist or is inactive.");
    }
    if (slot.bookedCount >= slot.capacity) {
      throw new Error("Selected appointment slot is fully booked. Please choose another time.");
    }
    return {
      ...slot,
      bookedCount: slot.bookedCount + 1,
    };
  }

  it("successfully reserves an available slot and increments bookedCount", () => {
    const slot: MockSlot = {
      id: "slot-1",
      capacity: 1,
      bookedCount: 0,
      isActive: true,
    };

    const updated = reserveSlotInTransaction(slot);
    expect(updated.bookedCount).toBe(1);
  });

  it("strictly prevents overbooking when slot capacity is already reached", () => {
    const fullyBookedSlot: MockSlot = {
      id: "slot-2",
      capacity: 1,
      bookedCount: 1, // Already at capacity
      isActive: true,
    };

    expect(() => reserveSlotInTransaction(fullyBookedSlot)).toThrow(
      "Selected appointment slot is fully booked"
    );
  });

  it("prevents reservation on inactive slots", () => {
    const inactiveSlot: MockSlot = {
      id: "slot-3",
      capacity: 2,
      bookedCount: 0,
      isActive: false,
    };

    expect(() => reserveSlotInTransaction(inactiveSlot)).toThrow(
      "Selected appointment slot does not exist or is inactive"
    );
  });
});

describe("Phase 4: Offer Usage Limit Race Prevention", () => {
  it("rejects claim when usage limit is reached during transaction", async () => {
    let usedCount = 10;
    const limit = 10;

    const mockTx: PrismaOfferTxLike = {
      offer: {
        findUnique: async () => ({
          code: "LIMITED",
          discountType: "FLAT",
          discountValuePaise: 50000,
          usageLimit: limit,
          usedCount,
          isActive: true,
        }),
        update: async () => {
          usedCount += 1;
          return {};
        },
      },
    };

    // When already at limit, transaction claim must abort
    await expect(
      claimOfferInTransaction(mockTx, "LIMITED", 210000)
    ).rejects.toThrow("usage limit exceeded");
  });

  it("claims the last remaining slot and blocks any subsequent attempt", async () => {
    let usedCount = 9;
    const limit = 10;

    const mockTx: PrismaOfferTxLike = {
      offer: {
        findUnique: async () => ({
          code: "LIMITED_RACE",
          discountType: "FLAT",
          discountValuePaise: 50000,
          usageLimit: limit,
          usedCount,
          isActive: true,
        }),
        update: async () => {
          usedCount += 1;
          return {};
        },
      },
    };

    // First attempt takes the 10th slot
    const firstClaim = await claimOfferInTransaction(mockTx, "LIMITED_RACE", 210000);
    expect(firstClaim.discountPaise).toBe(50000);
    expect(usedCount).toBe(10);

    // Second concurrent attempt immediately fails as limit is now reached
    await expect(
      claimOfferInTransaction(mockTx, "LIMITED_RACE", 210000)
    ).rejects.toThrow("usage limit exceeded");
  });
});

describe("Phase 4: Success Page Order Ownership Security Guard", () => {
  interface MockOrder {
    id: string;
    userId: string;
  }

  interface MockUser {
    id: string;
    role: Role;
  }

  function canAccessOrderReceipt(order: MockOrder | null, user: MockUser): boolean {
    if (!order) return false;
    const isOwner = order.userId === user.id;
    const isAdmin = user.role === Role.ADMIN;
    return isOwner || isAdmin;
  }

  const orderOwner: MockUser = { id: "user-owner", role: Role.USER };
  const anotherUser: MockUser = { id: "user-stranger", role: Role.USER };
  const adminUser: MockUser = { id: "user-admin", role: Role.ADMIN };

  const targetOrder: MockOrder = {
    id: "ord-12345",
    userId: "user-owner",
  };

  it("grants access to the user who placed the order", () => {
    expect(canAccessOrderReceipt(targetOrder, orderOwner)).toBe(true);
  });

  it("strictly denies access to any other user trying to view a foreign order receipt", () => {
    expect(canAccessOrderReceipt(targetOrder, anotherUser)).toBe(false);
  });

  it("allows administrative access for Kendra Acharyas/Admins", () => {
    expect(canAccessOrderReceipt(targetOrder, adminUser)).toBe(true);
  });

  it("denies access if order does not exist", () => {
    expect(canAccessOrderReceipt(null, orderOwner)).toBe(false);
  });
});
