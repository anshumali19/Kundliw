import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * M2: payment state transitions must verify the captured amount, reject
 * expired/void orders, and approve only orders awaiting verification.
 */

const state = vi.hoisted(() => ({
  order: null as null | Record<string, unknown>,
  events: [] as Array<Record<string, unknown>>,
  updates: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/lib/prisma", () => {
  const tx = {
    user: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        if (where.id !== "admin-1") return null;
        return {
          id: "admin-1",
          role: "ADMIN",
          name: "Admin",
          email: "admin@example.com",
        };
      }),
    },
    order: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        if (!state.order || state.order.id !== where.id) return null;
        return state.order;
      }),
      update: vi.fn(
        async (args: { where: { id: string }; data: Record<string, unknown> }) => {
          if (!state.order) throw new Error("missing order");
          state.updates.push(args.data);
          state.order = { ...state.order, ...args.data };
          return state.order;
        }
      ),
    },
    orderStatusEvent: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        state.events.push(data);
        return data;
      }),
    },
    counter: {
      upsert: vi.fn(async () => ({ id: "INVOICE_2026", seq: 7 })),
    },
    commission: {
      updateMany: vi.fn(async () => ({ count: 0 })),
    },
  };

  const client = new Proxy(tx as Record<string, unknown>, {
    get(obj, prop: string) {
      if (prop === "$transaction") {
        return vi.fn(async (arg: unknown) =>
          typeof arg === "function"
            ? (arg as (client: unknown) => Promise<unknown>)(client)
            : Promise.all(arg as Promise<unknown>[])
        );
      }
      if (prop === "then") return undefined;
      return obj[prop];
    },
  });

  return { prisma: client };
});

import {
  markOrderPaid,
  approveManualPayment,
  PaymentError,
} from "@/lib/payments/service";

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "order-1",
    userId: "user-1",
    status: "ORDER_RECEIVED",
    paymentStatus: "PENDING",
    paymentMode: "RAZORPAY",
    netAmountPaise: 118000,
    invoiceNumber: null,
    razorpayPaymentId: null,
    razorpaySignature: null,
    expiresAt: new Date(Date.now() + 30 * 60_000),
    manualPaymentRef: "UTR123",
    manualPaymentProof: "/api/storage/payment-proofs/receipt.png",
    rejectionReason: null,
    ...overrides,
  };
}

beforeEach(() => {
  state.order = makeOrder();
  state.events.length = 0;
  state.updates.length = 0;
});

describe("M2 - markOrderPaid integrity", () => {
  it("rejects a captured amount that does not match the order total", async () => {
    const promise = markOrderPaid("order-1", {
      paymentMode: "RAZORPAY",
      providerPaymentId: "pay_1",
      paidAmountPaise: 100,
    });

    await expect(promise).rejects.toBeInstanceOf(PaymentError);
    await expect(promise).rejects.toMatchObject({ status: 409 });
    expect(state.updates).toHaveLength(0);
    expect(state.events).toHaveLength(0);
    expect(state.order?.paymentStatus).toBe("PENDING");
  });

  it("rejects an expired reservation", async () => {
    state.order = makeOrder({ expiresAt: new Date(Date.now() - 60_000) });

    await expect(
      markOrderPaid("order-1", {
        paymentMode: "RAZORPAY",
        providerPaymentId: "pay_1",
        paidAmountPaise: 118000,
      })
    ).rejects.toMatchObject({ status: 409 });

    expect(state.updates).toHaveLength(0);
    expect(state.order?.paymentStatus).toBe("PENDING");
  });

  it.each(["FAILED", "REFUNDED"])(
    "rejects an order in %s payment state",
    async (paymentStatus) => {
      state.order = makeOrder({ paymentStatus });

      await expect(
        markOrderPaid("order-1", {
          paymentMode: "RAZORPAY",
          providerPaymentId: "pay_1",
          paidAmountPaise: 118000,
        })
      ).rejects.toMatchObject({ status: 409 });

      expect(state.updates).toHaveLength(0);
      expect(state.events).toHaveLength(0);
    }
  );

  it("marks a pending order paid when the captured amount matches", async () => {
    const updated = await markOrderPaid("order-1", {
      paymentMode: "RAZORPAY",
      providerPaymentId: "pay_1",
      signature: "sig_1",
      paidAmountPaise: 118000,
    });

    expect(updated.paymentStatus).toBe("PAID");
    expect(updated.razorpayPaymentId).toBe("pay_1");
    expect(updated.invoiceNumber).toBe("INV-2026-0007");
    expect(state.events).toHaveLength(1);
  });

  it("is idempotent for an already-paid order with a matching amount", async () => {
    state.order = makeOrder({ paymentStatus: "PAID", razorpayPaymentId: "pay_1" });

    const updated = await markOrderPaid("order-1", {
      paymentMode: "RAZORPAY",
      providerPaymentId: "pay_1",
      paidAmountPaise: 118000,
    });

    expect(updated.paymentStatus).toBe("PAID");
    expect(state.updates).toHaveLength(0);
    expect(state.events).toHaveLength(0);
  });
});

describe("M2 - approveManualPayment integrity", () => {
  it("refuses to approve an order that is not awaiting verification", async () => {
    await expect(
      approveManualPayment("order-1", "admin-1")
    ).rejects.toMatchObject({ status: 409 });

    expect(state.order?.paymentStatus).toBe("PENDING");
    expect(state.events).toHaveLength(0);
  });

  it("approves an order that is awaiting verification", async () => {
    state.order = makeOrder({ paymentStatus: "AWAITING_VERIFICATION" });

    const updated = await approveManualPayment("order-1", "admin-1");

    expect(updated.paymentStatus).toBe("PAID");
    expect(updated.invoiceNumber).toBe("INV-2026-0007");
    expect(state.events).toHaveLength(1);
  });

  it("returns an already-paid order without a second invoice event", async () => {
    state.order = makeOrder({ paymentStatus: "PAID", invoiceNumber: "INV-2026-0001" });

    const updated = await approveManualPayment("order-1", "admin-1");

    expect(updated.paymentStatus).toBe("PAID");
    expect(state.updates).toHaveLength(0);
    expect(state.events).toHaveLength(0);
  });
});
