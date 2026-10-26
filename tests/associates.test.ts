import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import {
  computeCommissionPaise,
  generateReferralCode,
  normalizeReferralCode,
  requestPayout,
  resolvePayout,
  attachReferralToOrder,
  AssociateError,
} from "@/lib/associates/service";

type Rule = {
  serviceId: string | null;
  planId: string | null;
  type: "PERCENTAGE" | "FLAT";
  value: number;
  isActive: boolean;
};

function dbWithRules(rules: Rule[]) {
  return {
    commissionRule: {
      // The real query filters by scope; return every rule and let the logic pick.
      findMany: vi.fn(async () => rules),
    },
  } as never;
}

describe("referral codes", () => {
  it("generates codes without look-alike characters", () => {
    for (let i = 0; i < 200; i += 1) {
      const code = generateReferralCode();
      expect(code).toMatch(/^KJK[A-HJ-NP-Z2-9]{6}$/);
    }
  });

  it("normalizes valid codes and rejects bad input", () => {
    expect(normalizeReferralCode(" kjkabc234 ")).toBe("KJKABC234");
    expect(normalizeReferralCode("ab")).toBeNull();
    expect(normalizeReferralCode("KJK-ABC")).toBeNull();
    expect(normalizeReferralCode(undefined)).toBeNull();
    expect(normalizeReferralCode({})).toBeNull();
  });
});

describe("commission calculation", () => {
  const base = { serviceId: "s1", planId: "p1", taxableAmountPaise: 100000 };

  it("returns 0 when no rule exists", async () => {
    expect(await computeCommissionPaise(base, dbWithRules([]))).toBe(0);
  });

  it("returns 0 for a zero-value order", async () => {
    const rules: Rule[] = [{ serviceId: null, planId: null, type: "FLAT", value: 5000, isActive: true }];
    expect(await computeCommissionPaise({ ...base, taxableAmountPaise: 0 }, dbWithRules(rules))).toBe(0);
  });

  it("applies a global percentage in basis points", async () => {
    const rules: Rule[] = [{ serviceId: null, planId: null, type: "PERCENTAGE", value: 1000, isActive: true }];
    expect(await computeCommissionPaise(base, dbWithRules(rules))).toBe(10000);
  });

  it("prefers the plan rule over the service rule over the global rule", async () => {
    const rules: Rule[] = [
      { serviceId: null, planId: null, type: "PERCENTAGE", value: 500, isActive: true },
      { serviceId: "s1", planId: null, type: "PERCENTAGE", value: 1000, isActive: true },
      { serviceId: null, planId: "p1", type: "FLAT", value: 7000, isActive: true },
    ];
    expect(await computeCommissionPaise(base, dbWithRules(rules))).toBe(7000);
    expect(await computeCommissionPaise({ ...base, planId: "other" }, dbWithRules(rules))).toBe(10000);
    expect(await computeCommissionPaise({ serviceId: "other", planId: "other", taxableAmountPaise: 100000 }, dbWithRules(rules))).toBe(5000);
  });

  it("never pays more than the taxable amount", async () => {
    const rules: Rule[] = [{ serviceId: null, planId: null, type: "FLAT", value: 999999, isActive: true }];
    expect(await computeCommissionPaise(base, dbWithRules(rules))).toBe(100000);
  });

  it("rounds percentage commission down to a whole paisa", async () => {
    const rules: Rule[] = [{ serviceId: null, planId: null, type: "PERCENTAGE", value: 333, isActive: true }];
    expect(await computeCommissionPaise({ ...base, taxableAmountPaise: 1001 }, dbWithRules(rules))).toBe(33);
  });
});

describe("referral attribution", () => {
  const order = { id: "o1", userId: "u-customer", serviceId: "s1", planId: "p1", taxableAmountPaise: 100000 };

  function tx(profile: { id: string; userId: string; status: string } | null) {
    return {
      associateProfile: { findUnique: vi.fn(async () => profile) },
      commissionRule: {
        findMany: vi.fn(async () => [{ serviceId: null, planId: null, type: "PERCENTAGE", value: 1000, isActive: true }]),
      },
      order: { update: vi.fn(async () => ({})) },
      commission: { upsert: vi.fn(async () => ({})) },
    };
  }

  it("records a pending commission for an approved associate", async () => {
    const t = tx({ id: "a1", userId: "u-assoc", status: "APPROVED" });
    await attachReferralToOrder(t as never, order, "a1");
    expect(t.order.update).toHaveBeenCalledWith({ where: { id: "o1" }, data: { associateId: "a1" } });
    expect(t.commission.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: { orderId: "o1", associateId: "a1", amountPaise: 10000 } })
    );
  });

  it("ignores self-referrals", async () => {
    const t = tx({ id: "a1", userId: "u-customer", status: "APPROVED" });
    await attachReferralToOrder(t as never, order, "a1");
    expect(t.order.update).not.toHaveBeenCalled();
    expect(t.commission.upsert).not.toHaveBeenCalled();
  });

  it("rejects an associate that is not approved", async () => {
    const t = tx({ id: "a1", userId: "u-assoc", status: "PENDING" });
    await expect(attachReferralToOrder(t as never, order, "a1")).rejects.toBeInstanceOf(AssociateError);
  });
});

describe("payout requests", () => {
  async function withPrisma(txImpl: Record<string, unknown>) {
    const { prisma } = await import("@/lib/prisma");
    (prisma as unknown as { $transaction: unknown }).$transaction = async (fn: (t: unknown) => unknown) => fn(txImpl);
  }

  it("requires an approved associate", async () => {
    await withPrisma({ associateProfile: { findUnique: vi.fn(async () => ({ id: "a1", status: "PENDING" })) } });
    await expect(requestPayout("a1")).rejects.toMatchObject({ status: 403 });
  });

  it("blocks a second open request", async () => {
    await withPrisma({
      associateProfile: { findUnique: vi.fn(async () => ({ id: "a1", status: "APPROVED" })) },
      payoutRequest: { count: vi.fn(async () => 1) },
    });
    await expect(requestPayout("a1")).rejects.toMatchObject({ status: 409 });
  });

  it("bundles earned commissions into one request", async () => {
    const update = vi.fn(async () => ({}));
    const create = vi.fn(async () => ({ id: "p1", amountPaise: 15000 }));
    await withPrisma({
      associateProfile: { findUnique: vi.fn(async () => ({ id: "a1", status: "APPROVED" })) },
      payoutRequest: { count: vi.fn(async () => 0), create },
      adminSettings: { findUnique: vi.fn(async () => ({ associateMinPayoutPaise: 1000 })) },
      commission: {
        findMany: vi.fn(async () => [
          { id: "c1", amountPaise: 10000 },
          { id: "c2", amountPaise: 5000 },
        ]),
        updateMany: update,
      },
    });
    const payout = await requestPayout("a1", " thanks ");
    expect(create).toHaveBeenCalledWith({ data: { associateId: "a1", amountPaise: 15000, note: "thanks" } });
    expect(update).toHaveBeenCalledWith({
      where: { id: { in: ["c1", "c2"] }, payoutId: null },
      data: { payoutId: "p1" },
    });
    expect(payout.id).toBe("p1");
  });

  it("refuses a request below the minimum payout set by the admin", async () => {
    await withPrisma({
      associateProfile: { findUnique: vi.fn(async () => ({ id: "a1", status: "APPROVED" })) },
      payoutRequest: { count: vi.fn(async () => 0) },
      adminSettings: { findUnique: vi.fn(async () => ({ associateMinPayoutPaise: 50000 })) },
      commission: { findMany: vi.fn(async () => [{ id: "c1", amountPaise: 10000 }]) },
    });
    await expect(requestPayout("a1")).rejects.toMatchObject({ status: 409 });
  });

  it("refuses when nothing is earned", async () => {
    await withPrisma({
      associateProfile: { findUnique: vi.fn(async () => ({ id: "a1", status: "APPROVED" })) },
      payoutRequest: { count: vi.fn(async () => 0) },
      commission: { findMany: vi.fn(async () => []) },
    });
    await expect(requestPayout("a1")).rejects.toMatchObject({ status: 409 });
  });

  it("marks commissions paid when a payout is paid, and frees them when declined", async () => {
    const updateMany = vi.fn(async () => ({}));
    const update = vi.fn(async (args: { data: Record<string, unknown> }) => ({ id: "p1", ...args.data }));
    await withPrisma({
      payoutRequest: { findUnique: vi.fn(async () => ({ id: "p1", status: "REQUESTED", note: null })), update },
      commission: { updateMany },
    });

    await resolvePayout("p1", "PAID", { paymentReference: "UTR123" });
    expect(updateMany).toHaveBeenLastCalledWith({
      where: { payoutId: "p1", status: "EARNED" },
      data: { status: "PAID" },
    });

    await resolvePayout("p1", "REJECTED", { note: "wrong account" });
    expect(updateMany).toHaveBeenLastCalledWith({ where: { payoutId: "p1" }, data: { payoutId: null } });
  });

  it("does not process a payout twice", async () => {
    await withPrisma({
      payoutRequest: { findUnique: vi.fn(async () => ({ id: "p1", status: "PAID" })) },
    });
    await expect(resolvePayout("p1", "PAID", {})).rejects.toMatchObject({ status: 409 });
  });
});
