import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * M10: a 500 response must never echo database, storage, or provider internals.
 * The real error belongs in server logs; the client gets a stable generic text.
 */

const SENTINEL = "PRISMA_INTERNAL: postgres://admin:s3cret@db.internal/app";

const state = vi.hoisted(() => ({
  settingsThrows: false,
  bannerThrows: false,
}));

const storageSave = vi.hoisted(() =>
  vi.fn(async () => {
    throw new Error(SENTINEL);
  })
);

vi.mock("@/lib/auth/guards", () => ({
  guardApiAdmin: vi.fn(async () => ({
    ok: true,
    user: { id: "admin-1", role: "ADMIN", name: "Admin", email: "admin@example.com" },
  })),
  getCurrentUser: vi.fn(async () => ({
    id: "user-1",
    role: "USER",
    name: "Customer",
    email: "customer@example.com",
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

vi.mock("@/lib/astro/factory", () => ({
  getAstroProvider: () => ({
    calculateKundli: vi.fn(async () => {
      throw new Error(SENTINEL);
    }),
    calculateMatching: vi.fn(async () => {
      throw new Error(SENTINEL);
    }),
  }),
}));

vi.mock("@/lib/billing/invoicePdf", () => ({
  generateInvoicePdf: vi.fn(async () => {
    throw new Error(SENTINEL);
  }),
}));

vi.mock("@/lib/prisma", () => {
  const tx = {
    adminSettings: {
      findUnique: vi.fn(async () => {
        if (state.settingsThrows) throw new Error(SENTINEL);
        return {
          id: "default",
          siteNameEn: "Maharshi Kanad Jyotish Kendra",
          addressEn: "Varanasi",
          phone1: "+91-9827991224",
          email: "vedic@kanad-jyotish.in",
          gstin: null,
        };
      }),
    },
    order: {
      findUnique: vi.fn(async () => ({
        id: "order-1",
        userId: "user-1",
        orderNumber: "MKJK-2026-0042",
        invoiceNumber: "INV-2026-0042",
        createdAt: new Date("2026-10-23T10:00:00Z"),
        jatakaDetails: { name: "Customer", phone: "+919999900002" },
        service: { titleEn: "Complete Janampatri" },
        plan: { titleEn: "Standard Tier" },
        baseAmountPaise: 100000,
        discountAmountPaise: 0,
        taxableAmountPaise: 100000,
        gstRateBasisPoints: 500,
        gstAmountPaise: 5000,
        netAmountPaise: 105000,
        paymentMode: "RAZORPAY",
        paymentStatus: "PENDING",
        offerCode: null,
        user: { name: "Customer", phone: "+919999900002", email: null },
      })),
    },
    banner: {
      findMany: vi.fn(async () => {
        if (state.bannerThrows) throw new Error(SENTINEL);
        return [];
      }),
    },
  };

  const client = new Proxy(tx as Record<string, unknown>, {
    get(obj, prop: string) {
      if (prop === "then") return undefined;
      return obj[prop];
    },
  });

  return { prisma: client };
});

import { GET as getAdminSettings } from "@/app/api/admin/settings/route";
import { POST as uploadMedia } from "@/app/api/admin/media/upload/route";
import { POST as calculateKundli } from "@/app/api/astro/kundli/route";
import { GET as getInvoice } from "@/app/api/invoice/[id]/route";
import { GET as getBanners } from "@/app/api/banners/route";

let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  state.settingsThrows = false;
  state.bannerThrows = false;
  storageSave.mockClear();
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
});

function expectNoLeak(payload: unknown) {
  const body = JSON.stringify(payload);
  expect(body).not.toContain(SENTINEL);
  expect(body).not.toContain("PRISMA_INTERNAL");
  expect(body).not.toContain("postgres://");
}

describe("M10 - API error responses do not leak internals", () => {
  it("hides Prisma internals from admin settings failures", async () => {
    state.settingsThrows = true;

    const res = await getAdminSettings();
    const body = await res.json();

    expect(res.status).toBe(500);
    expectNoLeak(body);
    expect(body.error).toBe("Failed to fetch settings");
    expect(errorSpy).toHaveBeenCalled();
  });

  it("hides storage internals from media upload failures", async () => {
    const form = new FormData();
    form.append(
      "file",
      new File(
        [Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
        "banner.png",
        { type: "image/png" }
      )
    );
    form.append("subfolder", "media");

    const res = await uploadMedia(
      new NextRequest("http://localhost:3000/api/admin/media/upload", {
        method: "POST",
        body: form,
      })
    );
    const body = await res.json();

    expect(res.status).toBe(500);
    expectNoLeak(body);
    expect(body.error).toBe("Media upload failed");
    expect(errorSpy).toHaveBeenCalled();
  });

  it("hides provider internals from astro calculation failures", async () => {
    const res = await calculateKundli(
      new NextRequest("http://localhost:3000/api/astro/kundli", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Aditya Sharma",
          gender: "MALE",
          dob: "1995-05-14",
          tob: "08:30",
          pob: "Varanasi, UP",
        }),
      })
    );
    const body = await res.json();

    expect(res.status).toBe(500);
    expectNoLeak(body);
    expect(body.error).toBe("Calculation failed");
    expect(errorSpy).toHaveBeenCalled();
  });

  it("hides invoice generator internals", async () => {
    const res = await getInvoice(
      new NextRequest("http://localhost:3000/api/invoice/order-1"),
      { params: Promise.resolve({ id: "order-1" }) }
    );
    const body = await res.json();

    expect(res.status).toBe(500);
    expectNoLeak(body);
    expect(body.error).toBe("Invoice generation failed");
    expect(errorSpy).toHaveBeenCalled();
  });

  it("hides database internals from the public banners endpoint", async () => {
    state.bannerThrows = true;

    const res = await getBanners(
      new NextRequest("http://localhost:3000/api/banners")
    );
    const body = await res.json();

    expect(res.status).toBe(500);
    expectNoLeak(body);
    expect(body.error).toBe("Failed to load banners");
    expect(errorSpy).toHaveBeenCalled();
  });
});
