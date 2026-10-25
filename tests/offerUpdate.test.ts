import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * H3: a partial offer update that sends only `discountValue` must use the
 * offer's stored discount type. Percentage offers store the integer percent,
 * not paise, so a missing `discountType` must not trigger rupeesToPaise().
 */

vi.mock("@/lib/prisma", () => {
  const makeModel = () => ({
    findUnique: vi.fn(async () => null),
    findFirst: vi.fn(async () => null),
    findMany: vi.fn(async () => []),
    create: vi.fn(async () => ({ id: "mock-id" })),
    update: vi.fn(async (args: { data?: Record<string, unknown> }) => ({
      id: "offer-1",
      ...(args?.data ?? {}),
    })),
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
import { PUT } from "@/app/api/admin/offers/[id]/route";

const ADMIN = {
  id: "admin-1",
  name: "Admin",
  email: "admin@example.com",
  phone: "+919999900001",
  role: "ADMIN",
};

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/admin/offers/offer-1", {
    method: "PUT",
    headers: {
      host: "localhost:3000",
      origin: "http://localhost:3000",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionState.current = { user: { id: ADMIN.id } };
  (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(ADMIN);
  (prisma.offer.update as ReturnType<typeof vi.fn>).mockResolvedValue({
    id: "offer-1",
    discountType: "PERCENTAGE",
    discountValuePaise: 30,
  });
});

describe("H3 - partial offer update keeps percentage semantics", () => {
  it("stores a percentage update as the integer percent", async () => {
    (prisma.offer.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "offer-1",
      discountType: "PERCENTAGE",
      discountValuePaise: 25,
    });

    const res = await PUT(makeRequest({ discountValue: 30 }), {
      params: { id: "offer-1" },
    });

    expect(res.status).toBe(200);
    expect(prisma.offer.update).toHaveBeenCalledWith({
      where: { id: "offer-1" },
      data: { discountValuePaise: 30 },
    });
  });

  it("still converts flat discounts from rupees to paise", async () => {
    (prisma.offer.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "offer-1",
      discountType: "FLAT",
      discountValuePaise: 50000,
    });

    const res = await PUT(makeRequest({ discountValue: 500 }), {
      params: { id: "offer-1" },
    });

    expect(res.status).toBe(200);
    expect(prisma.offer.update).toHaveBeenCalledWith({
      where: { id: "offer-1" },
      data: { discountValuePaise: 50000 },
    });
  });

  it("uses an explicit discountType when switching type", async () => {
    (prisma.offer.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "offer-1",
      discountType: "PERCENTAGE",
      discountValuePaise: 25,
    });

    const res = await PUT(makeRequest({ discountType: "FLAT", discountValue: 500 }), {
      params: { id: "offer-1" },
    });

    expect(res.status).toBe(200);
    expect(prisma.offer.update).toHaveBeenCalledWith({
      where: { id: "offer-1" },
      data: { discountType: "FLAT", discountValuePaise: 50000 },
    });
  });
});
