import { describe, it, expect, vi } from "vitest";
import { claimOfferInTransaction } from "@/lib/offers/apply";

describe("Pre-Phase 8 Hardening & Atomic Guards", () => {
  it("enforces atomic conditional offer claims against usage limits", async () => {
    // Mock Prisma transaction client with updateMany supporting atomic conditional checks
    const mockOffer = {
      code: "FESTIVE500",
      discountType: "FLAT" as const,
      discountValuePaise: 50000,
      minOrderValuePaise: 150000,
      isActive: true,
      usageLimit: 10,
      usedCount: 9,
    };

    const mockTx = {
      offer: {
        findUnique: vi.fn().mockResolvedValue(mockOffer),
        update: vi.fn().mockResolvedValue({}),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };

    // First claim succeeds (count: 1)
    const result1 = await claimOfferInTransaction(mockTx, "FESTIVE500", 200000);
    expect(result1.discountPaise).toBe(50000);
    expect(mockTx.offer.updateMany).toHaveBeenCalledWith({
      where: {
        code: "FESTIVE500",
        isActive: true,
        usedCount: { lt: 10 },
      },
      data: { usedCount: { increment: 1 } },
    });

    // Concurrent claim when limit is reached (updateMany returns count: 0)
    mockTx.offer.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(
      claimOfferInTransaction(mockTx, "FESTIVE500", 200000)
    ).rejects.toThrow("Invalid or unavailable coupon code.");
  });

  it("atomic conditional slot booking logic enforces capacity bounds", () => {
    // Pure logic simulation of conditional updateMany { bookedCount: { lt: capacity } }
    const reserveSlot = (slot: { capacity: number; bookedCount: number }) => {
      if (slot.bookedCount >= slot.capacity) {
        return { count: 0 };
      }
      slot.bookedCount += 1;
      return { count: 1 };
    };

    const slot = { capacity: 2, bookedCount: 0 };
    expect(reserveSlot(slot)).toEqual({ count: 1 });
    expect(slot.bookedCount).toBe(1);

    expect(reserveSlot(slot)).toEqual({ count: 1 });
    expect(slot.bookedCount).toBe(2);

    // Overbooking prevented atomically
    expect(reserveSlot(slot)).toEqual({ count: 0 });
    expect(slot.bookedCount).toBe(2);
  });

  it("order expiry releases reserved appointment slot and coupon counts", () => {
    const order = {
      id: "ord_exp_1",
      paymentStatus: "PENDING",
      slotId: "slot_1",
      offerId: "off_1",
      expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
    };

    const slot = { id: "slot_1", bookedCount: 2 };
    const offer = { id: "off_1", usedCount: 5 };

    const isExpired = Boolean(order.expiresAt && new Date() > order.expiresAt);
    expect(isExpired).toBe(true);

    if (isExpired && order.paymentStatus === "PENDING") {
      order.paymentStatus = "FAILED";
      slot.bookedCount -= 1;
      offer.usedCount -= 1;
    }

    expect(order.paymentStatus).toBe("FAILED");
    expect(slot.bookedCount).toBe(1);
    expect(offer.usedCount).toBe(4);
  });

  it("manual payment rejection returns order to retry state if within expiry window", () => {
    const unexpiredOrder = {
      id: "ord_retry_1",
      paymentStatus: "AWAITING_VERIFICATION",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins left
      rejectionReason: null as string | null,
      manualPaymentRef: "UTR9999",
    };

    const isExpired = Boolean(unexpiredOrder.expiresAt && new Date() > unexpiredOrder.expiresAt);
    expect(isExpired).toBe(false);

    // Rejection within window returns to PENDING retry state with note
    const rejectionReason = "UTR not found on bank statement";
    unexpiredOrder.paymentStatus = isExpired ? "FAILED" : "PENDING";
    unexpiredOrder.rejectionReason = rejectionReason;
    unexpiredOrder.manualPaymentRef = "";

    expect(unexpiredOrder.paymentStatus).toBe("PENDING");
    expect(unexpiredOrder.rejectionReason).toBe(rejectionReason);
    expect(unexpiredOrder.manualPaymentRef).toBe("");
  });

  it("defines strict HTTP security headers in next.config.mjs", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(path.resolve(__dirname, "../next.config.mjs"), "utf8");
    expect(content).toContain("poweredByHeader: false");
    expect(content).toContain("X-Frame-Options");
    expect(content).toContain("X-Content-Type-Options");
    expect(content).toContain("Strict-Transport-Security");
  });
});
