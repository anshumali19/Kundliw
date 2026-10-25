import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * M1: manual payment proof references must be server-generated storage URLs,
 * expired reservations must be rejected, and resubmissions must be bounded.
 */

const storageSave = vi.hoisted(() =>
  vi.fn(async () => ({
    storageKey: "payment-proofs/receipt.png",
    publicUrl: "/api/storage/payment-proofs/receipt.png",
  }))
);

const state = vi.hoisted(() => ({
  order: null as null | Record<string, unknown>,
  attempts: 0,
  events: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/lib/auth/guards", () => ({
  getCurrentUser: vi.fn(async () => ({
    id: "user-1",
    role: "USER",
    name: "Customer",
    email: "customer@example.com",
  })),
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
    order: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        if (!state.order || state.order.id !== where.id) return null;
        return state.order;
      }),
      update: vi.fn(
        async (args: { where: { id: string }; data: Record<string, unknown> }) => {
          if (!state.order) throw new Error("missing order");
          state.order = { ...state.order, ...args.data };
          return state.order;
        }
      ),
    },
    orderStatusEvent: {
      count: vi.fn(async () => state.attempts),
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

import { POST as submitProof } from "@/app/api/payments/manual/submit/route";

function jsonRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/payments/manual/submit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function multipartRequest(fileBytes: Buffer, mimeType = "image/png") {
  const form = new FormData();
  form.append("orderId", "order-1");
  form.append("paymentMode", "MANUAL_UPI");
  form.append("manualPaymentRef", "UTR123456");
  form.append(
    "proofFile",
    new File([Uint8Array.from(fileBytes)], "receipt.png", { type: mimeType })
  );

  return new NextRequest("http://localhost:3000/api/payments/manual/submit", {
    method: "POST",
    body: form,
  });
}

const validJson = {
  orderId: "order-1",
  paymentMode: "MANUAL_UPI",
  manualPaymentRef: "UTR123456",
  manualPaymentProofUrl: "/api/storage/payment-proofs/receipt.png",
};

beforeEach(() => {
  state.attempts = 0;
  state.events.length = 0;
  state.order = {
    id: "order-1",
    userId: "user-1",
    status: "ORDER_RECEIVED",
    paymentStatus: "PENDING",
    expiresAt: new Date(Date.now() + 30 * 60_000),
    manualPaymentProof: null,
  };
  storageSave.mockClear();
});

describe("M1 - manual payment proof integrity", () => {
  it("rejects an arbitrary external proof URL", async () => {
    const res = await submitProof(
      jsonRequest({
        ...validJson,
        manualPaymentProofUrl: "https://evil.example/fake-receipt.png",
      })
    );

    expect(res.status).toBe(400);
    expect(state.order?.paymentStatus).toBe("PENDING");
    expect(state.order?.manualPaymentProof).toBeNull();
    expect(state.events).toHaveLength(0);
  });

  it("rejects a storage path outside payment-proofs", async () => {
    const res = await submitProof(
      jsonRequest({
        ...validJson,
        manualPaymentProofUrl: "/api/storage/vault/private.pdf",
      })
    );

    expect(res.status).toBe(400);
    expect(state.events).toHaveLength(0);
  });

  it("accepts a server-generated payment proof URL", async () => {
    const res = await submitProof(jsonRequest(validJson));

    expect(res.status).toBe(200);
    expect(state.order?.manualPaymentProof).toBe(
      "/api/storage/payment-proofs/receipt.png"
    );
    expect(state.order?.paymentStatus).toBe("AWAITING_VERIFICATION");
  });

  it("rejects a submission after the reservation expired", async () => {
    state.order!.expiresAt = new Date(Date.now() - 60_000);

    const res = await submitProof(jsonRequest(validJson));

    expect(res.status).toBe(409);
    expect(state.order?.paymentStatus).toBe("PENDING");
    expect(state.events).toHaveLength(0);
  });

  it("rejects a proof upload for an order that is no longer payable", async () => {
    state.order!.paymentStatus = "FAILED";

    const res = await submitProof(jsonRequest(validJson));

    expect(res.status).toBe(409);
    expect(state.events).toHaveLength(0);
  });

  it("caps manual payment resubmissions", async () => {
    state.attempts = 3;

    const res = await submitProof(jsonRequest(validJson));

    expect(res.status).toBe(429);
    expect(state.order?.paymentStatus).toBe("PENDING");
    expect(state.events).toHaveLength(0);
  });

  it("stores an uploaded receipt under payment-proofs", async () => {
    const res = await submitProof(
      multipartRequest(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    );

    expect(res.status).toBe(200);
    expect(storageSave).toHaveBeenCalledWith(
      expect.any(Buffer),
      "receipt.png",
      "image/png",
      "payment-proofs"
    );
    expect(state.order?.manualPaymentProof).toBe(
      "/api/storage/payment-proofs/receipt.png"
    );
  });

  it("rejects an uploaded file whose bytes are not an allowed document type", async () => {
    const res = await submitProof(
      multipartRequest(Buffer.from("this is not an image"))
    );

    expect(res.status).toBe(400);
    expect(storageSave).not.toHaveBeenCalled();
    expect(state.events).toHaveLength(0);
  });
});
