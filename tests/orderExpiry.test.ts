import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * H7: abandoned unpaid orders must release their reserved slot and coupon.
 * Expiry runs from a secret-protected cron endpoint and opportunistically
 * before slot listing / coupon validation.
 */

interface MockOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  expiresAt: Date | null;
  slotId: string | null;
  offerId: string | null;
  netAmountPaise: number;
}

interface MockSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isActive: boolean;
}

interface MockOffer {
  id: string;
  code: string;
  titleEn: string;
  titleHi: string;
  discountType: string;
  discountValuePaise: number;
  minOrderValuePaise: number;
  maxDiscountPaise: number | null;
  isActive: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
  usageLimit: number | null;
  usedCount: number;
}

const state = vi.hoisted(() => ({
  orders: [] as MockOrder[],
  slots: new Map<string, MockSlot>(),
  offers: new Map<string, MockOffer>(),
  events: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/lib/prisma", () => {
  const appliesExpiryFilter = (row: MockOrder) => {
    if (row.paymentStatus !== "PENDING") return false;
    // Orders without a reservation window (e.g. zero-value astro requests)
    // are not abandoned-payment holds and must never expire.
    if (row.expiresAt === null) return false;
    return row.expiresAt.getTime() <= Date.now();
  };

  const proxy: Record<string, unknown> = {};
  const models: Record<string, unknown> = {
    order: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        return state.orders.find((order) => order.id === where.id) ?? null;
      }),
      findMany: vi.fn(
        async ({ where }: { where?: { paymentStatus?: string } } = {}) => {
          return state.orders.filter((order) => {
            if (where?.paymentStatus && order.paymentStatus !== where.paymentStatus) {
              return false;
            }
            return appliesExpiryFilter(order);
          });
        }
      ),
      updateMany: vi.fn(
        async (args: {
          where: { id: string; paymentStatus?: string };
          data: { paymentStatus: string };
        }) => {
          const order = state.orders.find(
            (candidate) =>
              candidate.id === args.where.id &&
              (!args.where.paymentStatus ||
                candidate.paymentStatus === args.where.paymentStatus)
          );
          if (!order || !appliesExpiryFilter(order)) return { count: 0 };
          order.paymentStatus = args.data.paymentStatus;
          return { count: 1 };
        }
      ),
      update: vi.fn(async () => ({})),
    },
    slot: {
      findMany: vi.fn(async () => Array.from(state.slots.values())),
      updateMany: vi.fn(
        async (args: {
          where: { id: string; bookedCount?: { gt: number } };
          data: { bookedCount: { decrement: number } };
        }) => {
          const slot = state.slots.get(args.where.id);
          if (!slot) return { count: 0 };
          if (slot.bookedCount <= (args.where.bookedCount?.gt ?? -1)) {
            return { count: 0 };
          }
          slot.bookedCount -= args.data.bookedCount.decrement;
          return { count: 1 };
        }
      ),
      update: vi.fn(async () => ({})),
    },
    offer: {
      findUnique: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
        if (where.id) return state.offers.get(String(where.id)) ?? null;
        if (where.code) {
          return (
            Array.from(state.offers.values()).find(
              (offer) => offer.code === where.code
            ) ?? null
          );
        }
        return null;
      }),
      updateMany: vi.fn(
        async (args: {
          where: { id: string; usedCount?: { gt: number } };
          data: { usedCount: { decrement: number } };
        }) => {
          const offer = state.offers.get(args.where.id);
          if (!offer) return { count: 0 };
          if (offer.usedCount <= (args.where.usedCount?.gt ?? -1)) {
            return { count: 0 };
          }
          offer.usedCount -= args.data.usedCount.decrement;
          return { count: 1 };
        }
      ),
      update: vi.fn(async () => ({})),
    },
    plan: {
      findUnique: vi.fn(async () => ({
        id: "plan-1",
        titleEn: "Standard",
        titleHi: "मानक",
        pricePaise: 100000,
      })),
    },
    adminSettings: {
      findUnique: vi.fn(async () => ({ gstin: null, defaultGstRateBps: 1800 })),
    },
    orderStatusEvent: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        state.events.push(data);
        return data;
      }),
    },
    rateLimit: {
      findUnique: vi.fn(async () => null),
      updateMany: vi.fn(async () => ({ count: 0 })),
      create: vi.fn(async () => ({})),
    },
    counter: { upsert: vi.fn(async () => ({ seq: 1 })) },
  };

  const client = new Proxy(proxy, {
    get(obj, prop: string) {
      if (prop === "$transaction") {
        return vi.fn(async (arg: unknown) =>
          typeof arg === "function"
            ? (arg as (tx: unknown) => Promise<unknown>)(client)
            : Promise.all(arg as Promise<unknown>[])
        );
      }
      if (prop === "then") return undefined;
      if (!obj[prop]) obj[prop] = models[prop] ?? {};
      return obj[prop];
    },
  });

  return { prisma: client };
});

import { GET as listSlots } from "@/app/api/booking/slots/route";
import { POST as validateOffer } from "@/app/api/offers/validate/route";
import {
  GET as runExpiryCron,
  POST as runExpiryCronPost,
} from "@/app/api/cron/expire-orders/route";
import { expireOverdueOrders } from "@/lib/booking/service";

function seedExpiredReservation() {
  state.orders.push({
    id: "order-expired",
    orderNumber: "MKJK-2026-0099",
    status: "ORDER_RECEIVED",
    paymentStatus: "PENDING",
    expiresAt: new Date(Date.now() - 60_000),
    slotId: "slot-1",
    offerId: "offer-1",
    netAmountPaise: 100000,
  });
  state.slots.set("slot-1", {
    id: "slot-1",
    date: new Date(),
    startTime: "10:00",
    endTime: "11:00",
    capacity: 1,
    bookedCount: 1,
    isActive: true,
  });
  state.offers.set("offer-1", {
    id: "offer-1",
    code: "VEDIC10",
    titleEn: "Vedic 10",
    titleHi: "वैदिक 10",
    discountType: "PERCENTAGE",
    discountValuePaise: 10,
    minOrderValuePaise: 0,
    maxDiscountPaise: null,
    isActive: true,
    validFrom: null,
    validUntil: null,
    usageLimit: 1,
    usedCount: 1,
  });
}

beforeEach(() => {
  state.orders.length = 0;
  state.slots.clear();
  state.offers.clear();
  state.events.length = 0;
  seedExpiredReservation();
});

afterEach(() => {
  delete process.env.CRON_SECRET;
});

describe("H7 - opportunistic expiry before slot listing", () => {
  it("releases the slot of an expired unpaid order before returning availability", async () => {
    const res = await listSlots(
      new NextRequest("http://localhost:3000/api/booking/slots")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(state.slots.get("slot-1")?.bookedCount).toBe(0);
    expect(body.slots).toHaveLength(1);
    expect(body.slots[0].available).toBe(1);
    expect(state.orders[0].paymentStatus).toBe("FAILED");
  });
});

describe("H7 - opportunistic expiry before coupon validation", () => {
  it("releases an expired order's coupon claim before evaluating the code", async () => {
    const res = await validateOffer(
      new NextRequest("http://localhost:3000/api/offers/validate", {
        method: "POST",
        headers: { host: "localhost:3000", "content-type": "application/json" },
        body: JSON.stringify({ code: "VEDIC10", planId: "plan-1" }),
      })
    );
    const body = await res.json();

    expect(state.offers.get("offer-1")?.usedCount).toBe(0);
    expect(body.isValid).toBe(true);
    expect(body.discountPaise).toBe(10000);
  });
});

describe("H7 - scheduled expiry endpoint", () => {
  it("refuses to run when no cron secret is configured", async () => {
    const res = await runExpiryCron(
      new NextRequest("http://localhost:3000/api/cron/expire-orders")
    );

    expect(res.status).toBe(503);
    expect(state.orders[0].paymentStatus).toBe("PENDING");
    expect(state.slots.get("slot-1")?.bookedCount).toBe(1);
  });

  it("rejects requests with a missing or wrong secret", async () => {
    process.env.CRON_SECRET = "s3cret-value";

    const missing = await runExpiryCron(
      new NextRequest("http://localhost:3000/api/cron/expire-orders")
    );
    const wrong = await runExpiryCron(
      new NextRequest("http://localhost:3000/api/cron/expire-orders", {
        headers: { authorization: "Bearer not-the-secret" },
      })
    );

    expect(missing.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(state.orders[0].paymentStatus).toBe("PENDING");
    expect(state.slots.get("slot-1")?.bookedCount).toBe(1);
  });

  it("releases slots and coupons for expired orders when authorized", async () => {
    process.env.CRON_SECRET = "s3cret-value";

    const res = await runExpiryCronPost(
      new NextRequest("http://localhost:3000/api/cron/expire-orders", {
        method: "POST",
        headers: { "x-cron-secret": "s3cret-value" },
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ ok: true, scanned: 1, expired: 1 });
    expect(state.orders[0].paymentStatus).toBe("FAILED");
    expect(state.slots.get("slot-1")?.bookedCount).toBe(0);
    expect(state.offers.get("offer-1")?.usedCount).toBe(0);
    expect(state.events).toHaveLength(1);
  });

  it("is idempotent and does not double-release a reservation", async () => {
    process.env.CRON_SECRET = "s3cret-value";

    const first = await runExpiryCron(
      new NextRequest("http://localhost:3000/api/cron/expire-orders", {
        headers: { authorization: "Bearer s3cret-value" },
      })
    );
    const second = await runExpiryCron(
      new NextRequest("http://localhost:3000/api/cron/expire-orders", {
        headers: { authorization: "Bearer s3cret-value" },
      })
    );

    expect(await first.json()).toMatchObject({ expired: 1 });
    expect(await second.json()).toMatchObject({ scanned: 0, expired: 0 });
    expect(state.slots.get("slot-1")?.bookedCount).toBe(0);
    expect(state.offers.get("offer-1")?.usedCount).toBe(0);
  });

  it("does not release an order that has not expired yet", async () => {
    state.orders[0].expiresAt = new Date(Date.now() + 10 * 60_000);

    const result = await expireOverdueOrders();

    expect(result).toEqual({ scanned: 0, expired: 0 });
    expect(state.orders[0].paymentStatus).toBe("PENDING");
    expect(state.slots.get("slot-1")?.bookedCount).toBe(1);
    expect(state.offers.get("offer-1")?.usedCount).toBe(1);
  });

  it("never expires a pending order without a reservation window", async () => {
    state.orders[0].expiresAt = null;

    const result = await expireOverdueOrders();

    expect(result).toEqual({ scanned: 0, expired: 0 });
    expect(state.orders[0].paymentStatus).toBe("PENDING");
    expect(state.slots.get("slot-1")?.bookedCount).toBe(1);
    expect(state.offers.get("offer-1")?.usedCount).toBe(1);
  });
});
