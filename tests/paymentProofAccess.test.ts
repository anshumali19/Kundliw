import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * M9: payment proof ownership must match the exact storage key, not a
 * substring (which let a key that is contained in another order's proof URL
 * grant access).
 */

vi.mock("@/lib/prisma", () => {
  const makeModel = () => ({
    findUnique: vi.fn(async () => null),
    findFirst: vi.fn(async () => null),
    findMany: vi.fn(async () => []),
    create: vi.fn(async () => ({ id: "mock-id" })),
    update: vi.fn(async () => ({ id: "mock-id" })),
    updateMany: vi.fn(async () => ({ count: 1 })),
    upsert: vi.fn(async () => ({ id: "mock-id" })),
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
import { GET as getStorageFile } from "@/app/api/storage/[...path]/route";

beforeEach(() => {
  vi.clearAllMocks();
  sessionState.current = { user: { id: "user-1" } };
  (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
    id: "user-1",
    name: "Customer",
    email: "customer@example.com",
    phone: "+919999900002",
    role: "USER",
  });
  (prisma.order.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
});

describe("M9 - payment proof key equality", () => {
  it("queries the order with an exact key instead of a substring match", async () => {
    const res = await getStorageFile(
      new NextRequest("http://localhost:3000/api/storage/payment-proofs/receipt-1.png"),
      { params: Promise.resolve({ path: ["payment-proofs", "receipt-1.png"] }) }
    );

    expect(res.status).toBe(403);

    const call = (prisma.order.findFirst as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      where: { manualPaymentProof: Record<string, unknown> };
    };
    expect(call.where.manualPaymentProof).not.toHaveProperty("contains");
    expect(call.where.manualPaymentProof).toEqual({
      in: [
        "payment-proofs/receipt-1.png",
        "/api/storage/payment-proofs/receipt-1.png",
      ],
    });
  });
});
