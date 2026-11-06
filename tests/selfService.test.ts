import { describe, expect, it } from "vitest";
import { AppointmentStatus, OrderStatus, PaymentStatus } from "@prisma/client";
import { cancelBlockReason, upgradeBlockReason } from "@/lib/orders/selfService";

const base = { paymentStatus: PaymentStatus.PAID, status: OrderStatus.ORDER_RECEIVED, appointmentStatus: null as AppointmentStatus | null };
const now = new Date("2026-11-10T10:00:00Z");

describe("customer self-service cancellation rules", () => {
  it("allows a fresh paid order", () => {
    expect(cancelBlockReason(base, null, now)).toBeNull();
  });
  it("allows an unpaid order", () => {
    expect(cancelBlockReason({ ...base, paymentStatus: PaymentStatus.PENDING }, null, now)).toBeNull();
  });
  it("blocks once work has started", () => {
    expect(cancelBlockReason({ ...base, status: OrderStatus.KUNDLI_IN_PROGRESS }, null, now)).not.toBeNull();
  });
  it("blocks when the call is scheduled", () => {
    expect(cancelBlockReason({ ...base, appointmentStatus: AppointmentStatus.APPROVED }, null, now)).not.toBeNull();
  });
  it("blocks an order that is already cancelled", () => {
    expect(cancelBlockReason({ ...base, paymentStatus: PaymentStatus.REFUNDED }, null, now)).not.toBeNull();
  });
  it("blocks a package starting within 48 hours but not one starting later", () => {
    expect(cancelBlockReason(base, new Date("2026-11-11T10:00:00Z"), now)).not.toBeNull();
    expect(cancelBlockReason(base, new Date("2026-11-13T10:00:00Z"), now)).toBeNull();
  });
});

describe("customer self-service upgrade rules", () => {
  const up = { ...base, extraPlanIds: [] as string[] };
  it("allows a paid single-plan order", () => {
    expect(upgradeBlockReason(up)).toBeNull();
  });
  it("blocks an unpaid order", () => {
    expect(upgradeBlockReason({ ...up, paymentStatus: PaymentStatus.PENDING })).not.toBeNull();
  });
  it("blocks multi-plan orders and orders with work started", () => {
    expect(upgradeBlockReason({ ...up, extraPlanIds: ["x"] })).not.toBeNull();
    expect(upgradeBlockReason({ ...up, status: OrderStatus.DELIVERED })).not.toBeNull();
  });
});
