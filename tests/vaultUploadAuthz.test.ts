import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { OrderStatus } from "@prisma/client";

/**
 * H8: an admin vault upload may only attach a document to an order that
 * belongs to the selected customer, and the order status may only move to
 * KUNDLI_COMPLETE through a valid transition.
 */

const storageSave = vi.hoisted(() =>
  vi.fn(async () => ({
    storageKey: "vault/kundli.pdf",
    publicUrl: "/api/storage/vault/kundli.pdf",
  }))
);

const state = vi.hoisted(() => ({
  orders: [] as Array<{
    id: string;
    userId: string | null;
    status: string;
  }>,
  vaultFiles: [] as Array<Record<string, unknown>>,
  events: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/lib/auth/guards", () => ({
  guardApiAdmin: vi.fn(async () => ({
    ok: true,
    user: { id: "admin-1", role: "ADMIN" },
  })),
}));

vi.mock("@/lib/auth/csrf", () => ({
  validateCsrfOrigin: vi.fn(() => ({ isValid: true })),
}));

vi.mock("@/lib/storage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/storage")>();
  return {
    ...actual,
    getStorageProvider: () => ({ saveFile: storageSave }),
  };
});

vi.mock("@/lib/prisma", () => {
  const tx = {
    user: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) =>
        where.id === "user-1" ? { id: "user-1" } : null
      ),
    },
    order: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        return state.orders.find((order) => order.id === where.id) ?? null;
      }),
      update: vi.fn(
        async (args: { where: { id: string }; data: { status: string } }) => {
          const order = state.orders.find((row) => row.id === args.where.id);
          if (order) order.status = args.data.status;
          return order;
        }
      ),
    },
    vaultFile: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const record = { id: "vault-1", ...data };
        state.vaultFiles.push(record);
        return record;
      }),
    },
    orderStatusEvent: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        state.events.push(data);
        return data;
      }),
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

import { POST as uploadVaultFile } from "@/app/api/admin/vault/upload/route";

function makeRequest(fields: Record<string, string>) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }
  form.append(
    "file",
    new File([Buffer.from("%PDF-1.7\nKundli dossier")], "kundli.pdf", {
      type: "application/pdf",
    })
  );

  return new NextRequest("http://localhost:3000/api/admin/vault/upload", {
    method: "POST",
    body: form,
  });
}

const baseFields = {
  userId: "user-1",
  titleEn: "Kundli Dossier",
  titleHi: "कुंडली डोजियर",
};

beforeEach(() => {
  state.orders.length = 0;
  state.vaultFiles.length = 0;
  state.events.length = 0;
  storageSave.mockClear();
  state.orders.push({
    id: "order-1",
    userId: "user-1",
    status: OrderStatus.KUNDLI_IN_PROGRESS,
  });
});

describe("H8 - vault upload order authorization", () => {
  it("rejects attaching a document to another customer's order", async () => {
    state.orders[0].userId = "user-2";

    const res = await uploadVaultFile(
      makeRequest({ ...baseFields, orderId: "order-1" })
    );

    expect(res.status).toBe(403);
    expect(state.vaultFiles).toHaveLength(0);
    expect(state.events).toHaveLength(0);
    expect(state.orders[0].status).toBe(OrderStatus.KUNDLI_IN_PROGRESS);
    expect(storageSave).not.toHaveBeenCalled();
  });

  it("rejects an unknown order", async () => {
    const res = await uploadVaultFile(
      makeRequest({ ...baseFields, orderId: "order-does-not-exist" })
    );

    expect(res.status).toBe(404);
    expect(state.vaultFiles).toHaveLength(0);
    expect(storageSave).not.toHaveBeenCalled();
  });

  it("rejects a completion upload from an invalid status", async () => {
    state.orders[0].status = OrderStatus.ORDER_RECEIVED;

    const res = await uploadVaultFile(
      makeRequest({ ...baseFields, orderId: "order-1" })
    );

    expect(res.status).toBe(409);
    expect(state.vaultFiles).toHaveLength(0);
    expect(state.events).toHaveLength(0);
    expect(state.orders[0].status).toBe(OrderStatus.ORDER_RECEIVED);
  });

  it("moves the order to KUNDLI_COMPLETE and records the event atomically", async () => {
    const res = await uploadVaultFile(
      makeRequest({ ...baseFields, orderId: "order-1" })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(state.orders[0].status).toBe(OrderStatus.KUNDLI_COMPLETE);
    expect(state.vaultFiles).toHaveLength(1);
    expect(state.events).toHaveLength(1);
    expect(state.events[0]).toMatchObject({
      orderId: "order-1",
      status: OrderStatus.KUNDLI_COMPLETE,
      changedById: "admin-1",
    });
  });

  it("allows a vault-only upload without touching order status", async () => {
    const res = await uploadVaultFile(makeRequest(baseFields));

    expect(res.status).toBe(200);
    expect(state.vaultFiles).toHaveLength(1);
    expect(state.events).toHaveLength(0);
    expect(state.orders[0].status).toBe(OrderStatus.KUNDLI_IN_PROGRESS);
  });
});
