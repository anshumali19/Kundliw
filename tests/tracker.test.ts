import { describe, it, expect } from "vitest";
import {
  isValidStatusTransition,
  getStatusProgress,
  CanonicalOrderStatus,
  ORDER_STATUS_ORDER,
} from "@/lib/orders/status";
import { normalizePhoneNumber } from "@/lib/auth/validation";

describe("Phase 7 - Order Tracker & Status State Machine", () => {
  it("enforces canonical 6-stage forward progression", () => {
    // 1. ORDER_RECEIVED -> KUNDLI_IN_PROGRESS
    expect(isValidStatusTransition("ORDER_RECEIVED", "KUNDLI_IN_PROGRESS")).toBe(true);
    // Cannot skip directly to DELIVERED
    expect(isValidStatusTransition("ORDER_RECEIVED", "DELIVERED")).toBe(false);

    // 2. KUNDLI_IN_PROGRESS -> KUNDLI_COMPLETE
    expect(isValidStatusTransition("KUNDLI_IN_PROGRESS", "KUNDLI_COMPLETE")).toBe(true);
    expect(isValidStatusTransition("KUNDLI_IN_PROGRESS", "EXECUTION_COMPLETE")).toBe(false);

    // 3. KUNDLI_COMPLETE -> DISPATCHED (for physical orders)
    expect(isValidStatusTransition("KUNDLI_COMPLETE", "DISPATCHED", false)).toBe(true);
    expect(isValidStatusTransition("KUNDLI_COMPLETE", "EXECUTION_COMPLETE", false)).toBe(false);

    // 4. KUNDLI_COMPLETE -> EXECUTION_COMPLETE (allowed for digital-only services)
    expect(isValidStatusTransition("KUNDLI_COMPLETE", "EXECUTION_COMPLETE", true)).toBe(true);

    // 5. DISPATCHED -> DELIVERED
    expect(isValidStatusTransition("DISPATCHED", "DELIVERED")).toBe(true);

    // 6. DELIVERED -> EXECUTION_COMPLETE
    expect(isValidStatusTransition("DELIVERED", "EXECUTION_COMPLETE")).toBe(true);

    // Terminal state cannot advance further
    expect(isValidStatusTransition("EXECUTION_COMPLETE", "ORDER_RECEIVED")).toBe(false);
  });

  it("calculates stepper progress percentage accurately across all 6 stages", () => {
    const statuses: CanonicalOrderStatus[] = [
      "ORDER_RECEIVED",
      "KUNDLI_IN_PROGRESS",
      "KUNDLI_COMPLETE",
      "DISPATCHED",
      "DELIVERED",
      "EXECUTION_COMPLETE",
    ];

    statuses.forEach((status, idx) => {
      const { step, totalSteps, progressPercent } = getStatusProgress(status);
      expect(totalSteps).toBe(6);
      expect(step).toBe(idx + 1);
      const expectedPercent = Math.round(((idx + 1) / 6) * 100);
      expect(progressPercent).toBe(expectedPercent);
    });
  });

  it("normalizes diverse phone number formats for strict matching", () => {
    const expected = "9827991224";

    expect(normalizePhoneNumber("9827991224")).toBe(expected);
    expect(normalizePhoneNumber("+919827991224")).toBe(expected);
    expect(normalizePhoneNumber("+91 98279 91224")).toBe(expected);
    expect(normalizePhoneNumber("09827991224")).toBe(expected);
    expect(normalizePhoneNumber("98279-91224")).toBe(expected);
  });
});
