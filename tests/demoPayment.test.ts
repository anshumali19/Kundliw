import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * C2: /api/payments/demo/process is a simulation backdoor and must be hard
 * gated by DEMO_MODE. It must never execute in a production build, and a
 * simulated failure must never downgrade an order that is already PAID.
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
    update: vi.fn(async (args: { data?: Record<string, unknown> }) => ({
      id: "mock-id",
      ...(args?.data ?? {}),
    })),
    updateMany: vi.fn(async () => ({ count: 1 })),
    upsert: vi.fn(async (args: { create?: Record<string, unknown> }) => ({
      id: "mock-id",
      seq: 1,
      ...(args?.create ?? {}),
    })),
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

const sessionState = vi.hoisted(() => ({
  current: null as null | { user: { id: string } },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(async () => sessionState.current),
}));

import { prisma } from "@/lib/prisma";
import { POST } from "@/app/api/payments/demo/process/route";

const OWNER = {
  id: "user-1",
  name: "Customer",
  email: "customer@example.com",
  phone: "+919999900002",
  role: "USER",
};

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "order-1",
    orderNumber: "MKJK-2026-0001",
    userId: OWNER.id,
    status: "PENDING",
    paymentStatus: "PENDING",
    paymentMode: "RAZORPAY",
    invoiceNumber: null,
    razorpayPaymentId: null,
    razorpaySignature: null,
    expiresAt: null,
    ...overrides,
  };
}

function makeRequest(action: "SIMULATE_SUCCESS" | "SIMULATE_FAILURE") {
  return new NextRequest("http://localhost:3000/api/payments/demo/process", {
    method: "POST",
    headers: { host: "localhost:3000", "content-type": "application/json" },
    body: JSON.stringify({ orderId: "order-1", action }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  sessionState.current = { user: { id: OWNER.id } };
  (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(OWNER);
  (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeOrder());
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("C2 - demo payment simulation gate", () => {
  it("refuses to run when DEMO_MODE is not enabled", async () => {
    vi.stubEnv("DEMO_MODE", "");
    vi.stubEnv("NODE_ENV", "development");

    const res = await POST(makeRequest("SIMULATE_SUCCESS"));

    expect(res.status).toBe(404);
    expect(prisma.order.update).not.toHaveBeenCalled();
    expect(prisma.order.updateMany).not.toHaveBeenCalled();
  });

  it("never runs in a production build, even with DEMO_MODE=true", async () => {
    vi.stubEnv("DEMO_MODE", "true");
    vi.stubEnv("NODE_ENV", "production");

    const res = await POST(makeRequest("SIMULATE_SUCCESS"));

    expect(res.status).toBe(404);
    expect(prisma.order.update).not.toHaveBeenCalled();
    expect(prisma.order.updateMany).not.toHaveBeenCalled();
  });

  it("allows the simulation in an explicitly enabled non-production environment", async () => {
    vi.stubEnv("DEMO_MODE", "true");
    vi.stubEnv("NODE_ENV", "development");

    const res = await POST(makeRequest("SIMULATE_SUCCESS"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.paymentStatus).toBe("PAID");
  });

  it("does not downgrade an already PAID order on SIMULATE_FAILURE", async () => {
    vi.stubEnv("DEMO_MODE", "true");
    vi.stubEnv("NODE_ENV", "development");
    (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeOrder({ paymentStatus: "PAID" })
    );

    const res = await POST(makeRequest("SIMULATE_FAILURE"));

    expect(res.status).toBe(409);
    expect(prisma.order.update).not.toHaveBeenCalled();
    expect(prisma.order.updateMany).not.toHaveBeenCalled();
    expect(prisma.orderStatusEvent.create).not.toHaveBeenCalled();
  });
});
