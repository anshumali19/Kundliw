import { describe, it, expect } from "vitest";
import {
  isValidStatusTransition,
  getStatusProgress,
} from "../src/lib/orders/status";

describe("Order Status Transition Rules", () => {
  it("allows standard sequential physical delivery progression", () => {
    expect(isValidStatusTransition("ORDER_RECEIVED", "KUNDLI_IN_PROGRESS")).toBe(true);
    expect(isValidStatusTransition("KUNDLI_IN_PROGRESS", "KUNDLI_COMPLETE")).toBe(true);
    expect(isValidStatusTransition("KUNDLI_COMPLETE", "DISPATCHED")).toBe(true);
    expect(isValidStatusTransition("DISPATCHED", "DELIVERED")).toBe(true);
    expect(isValidStatusTransition("DELIVERED", "EXECUTION_COMPLETE")).toBe(true);
  });

  it("prevents arbitrary backward or skipping transitions for physical orders", () => {
    expect(isValidStatusTransition("ORDER_RECEIVED", "DISPATCHED")).toBe(false);
    expect(isValidStatusTransition("DISPATCHED", "ORDER_RECEIVED")).toBe(false);
    expect(isValidStatusTransition("EXECUTION_COMPLETE", "ORDER_RECEIVED")).toBe(false);
  });

  it("allows digital-only orders to transition from KUNDLI_COMPLETE to EXECUTION_COMPLETE", () => {
    // For digital-only tier (no physical book dispatched)
    expect(isValidStatusTransition("KUNDLI_COMPLETE", "EXECUTION_COMPLETE", true)).toBe(true);
    // Disallowed if not digital-only
    expect(isValidStatusTransition("KUNDLI_COMPLETE", "EXECUTION_COMPLETE", false)).toBe(false);
  });

  it("computes stepper progress correctly", () => {
    const step1 = getStatusProgress("ORDER_RECEIVED");
    expect(step1.step).toBe(1);
    expect(step1.totalSteps).toBe(6);

    const step6 = getStatusProgress("EXECUTION_COMPLETE");
    expect(step6.step).toBe(6);
    expect(step6.progressPercent).toBe(100);
  });
});
