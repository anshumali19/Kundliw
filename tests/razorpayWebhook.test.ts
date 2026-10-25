import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import * as crypto from "crypto";

/**
 * C4: Razorpay webhook must require a genuine event id, verify the payment
 * amount/currency/order against our database, and only persist the
 * deduplication record after successful processing so provider retries work.
 */

vi.mock("@/lib/prisma", () => {
  const makeModel = () => ({
    findUnique: vi.fn(async () => null),
    findFirst: vi.fn(async () => null),
    findMany: vi.fn(async () => []),
    create: vi.fn(async (args: { data?: Record<string, unknown> }) => ({
      id: "mock-id",
      ...(args?.data ?? {}),
    })),
    createMany: vi.fn(async () => ({ count: 0 })),
    update: vi.fn(async () => ({ id: "mock-id" })),
    updateMany: vi.fn(async () => ({ count: 1 })),
    upsert: vi.fn(async () => ({ id: "mock-id", seq: 1 })),
    delete: vi.fn(async () => ({})),
    deleteMany: vi.fn(async () => ({ count: 0 })),
    count: vi.fn(async () => 0),
  });

  const target: Record<string, unknown> = {};
  const proxy = new Proxy(target, {
    get(obj, prop: string) {
      if (prop === "$transaction") {
        return vi.fn(async (arg: unknown) =>
          typeof arg === "function"
            ? (arg as (tx: unknown) => Promise<unknown>)(proxy)
            : Promise.all(arg as Promise<unknown>[])
        );
      }
      if (prop === "then") return undefined;
      if (!obj[prop]) obj[prop] = makeModel();
      return obj[prop];
    },
  });

  return { prisma: proxy };
});

vi.mock("@/lib/payments/service", () => ({
  markOrderPaid: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/lib/payments/service";
import { POST } from "@/app/api/webhooks/razorpay/route";

const WEBHOOK_SECRET = "wh_secret_c4_test";

const ORDER = {
  id: "order-1",
  orderNumber: "MKJK-2026-0001",
  status: "ORDER_RECEIVED",
  paymentStatus: "PENDING",
  paymentMode: "RAZORPAY",
  netAmountPaise: 105000,
  razorpayOrderId: "order_rzp_123",
  razorpayPaymentId: null,
  invoiceNumber: null,
};

function makePayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "evt_c4_0001",
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_c4_0001",
          order_id: "order_rzp_123",
          amount: 105000,
          currency: "INR",
          notes: { orderId: "order-1" },
        },
      },
    },
    ...overrides,
  };
}

function makeRequest(payload: unknown) {
  const raw = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(raw)
    .digest("hex");
  return new NextRequest("http://localhost:3000/api/webhooks/razorpay", {
    method: "POST",
    headers: {
      host: "localhost:3000",
      "content-type": "application/json",
      "x-razorpay-signature": signature,
    },
    body: raw,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("RAZORPAY_WEBHOOK_SECRET", WEBHOOK_SECRET);
  (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(ORDER);
  (prisma.processedWebhookEvent.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
  (prisma.processedWebhookEvent.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "pw-1" });
  (markOrderPaid as ReturnType<typeof vi.fn>).mockResolvedValue({ ...ORDER, paymentStatus: "PAID" });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("C4 - Razorpay webhook integrity", () => {
  it("rejects an event without a real event id", async () => {
    const payload = makePayload();
    delete (payload as { id?: string }).id;

    const res = await POST(makeRequest(payload));

    expect(res.status).toBe(400);
    expect(markOrderPaid).not.toHaveBeenCalled();
    expect(prisma.processedWebhookEvent.create).not.toHaveBeenCalled();
  });

  it("rejects an event when the provider order id does not match the order", async () => {
    const payload = makePayload();
    payload.payload.payment.entity.order_id = "order_rzp_other";

    const res = await POST(makeRequest(payload));

    expect(res.status).toBe(400);
    expect(markOrderPaid).not.toHaveBeenCalled();
  });

  it("rejects a payment whose amount does not match the order", async () => {
    const payload = makePayload();
    payload.payload.payment.entity.amount = 100;

    const res = await POST(makeRequest(payload));

    expect(res.status).toBe(400);
    expect(markOrderPaid).not.toHaveBeenCalled();
    expect(prisma.processedWebhookEvent.create).not.toHaveBeenCalled();
  });

  it("rejects a payment currency other than INR", async () => {
    const payload = makePayload();
    payload.payload.payment.entity.currency = "USD";

    const res = await POST(makeRequest(payload));

    expect(res.status).toBe(400);
    expect(markOrderPaid).not.toHaveBeenCalled();
  });

  it("does not persist the dedupe row when processing fails, so a retry succeeds", async () => {
    (markOrderPaid as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("database temporarily unavailable")
    );

    const first = await POST(makeRequest(makePayload()));
    expect(first.status).toBe(500);
    expect(prisma.processedWebhookEvent.create).not.toHaveBeenCalled();

    const second = await POST(makeRequest(makePayload()));
    expect(second.status).toBe(200);
    expect(markOrderPaid).toHaveBeenCalledTimes(2);
    expect(prisma.processedWebhookEvent.create).toHaveBeenCalledTimes(1);
  });

  it("deduplicates a previously processed event", async () => {
    (prisma.processedWebhookEvent.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "pw-existing",
      eventId: "evt_c4_0001",
    });

    const res = await POST(makeRequest(makePayload()));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.deduplicated).toBe(true);
    expect(markOrderPaid).not.toHaveBeenCalled();
  });

  it("marks a matching captured payment as paid and records the event", async () => {
    const res = await POST(makeRequest(makePayload()));

    expect(res.status).toBe(200);
    expect(markOrderPaid).toHaveBeenCalledWith(
      "order-1",
      expect.objectContaining({
        providerPaymentId: "pay_c4_0001",
        paymentMode: "RAZORPAY",
      })
    );
    expect(prisma.processedWebhookEvent.create).toHaveBeenCalledWith({
      data: { eventId: "evt_c4_0001", eventType: "payment.captured" },
    });
  });
});
