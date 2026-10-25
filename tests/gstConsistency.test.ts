import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * H2: coupon validation and order creation must derive the GST rate and label
 * from the same AdminSettings source. The preview total must match checkout.
 */

vi.mock("@/lib/prisma", () => {
  const makeModel = () => ({
    findUnique: vi.fn(async () => null),
    findFirst: vi.fn(async () => null),
    findMany: vi.fn(async () => []),
    create: vi.fn(async () => ({ id: "mock-id" })),
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

vi.mock("@/lib/rateLimit", () => ({
  getClientIp: vi.fn(() => "203.0.113.7"),
  checkDbRateLimit: vi.fn(async () => ({
    allowed: true,
    count: 1,
    remaining: 19,
  })),
  resetDbRateLimit: vi.fn(async () => undefined),
}));

import { prisma } from "@/lib/prisma";
import { POST as validateOffer } from "@/app/api/offers/validate/route";
import { getGstSettings } from "@/lib/billing/gstSettings";

const SETTINGS = { gstin: "09AAATM1234F1Z5", defaultGstRateBps: 500 };

const PLAN = {
  id: "plan-1",
  titleEn: "Standard",
  titleHi: "मानक",
  pricePaise: 100000,
};

const OFFER = {
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
  usageLimit: null,
  usedCount: 0,
};

function makeRequest() {
  return new NextRequest("http://localhost:3000/api/offers/validate", {
    method: "POST",
    headers: { host: "localhost:3000", "content-type": "application/json" },
    body: JSON.stringify({ code: "VEDIC10", planId: "plan-1" }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  (prisma.plan.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(PLAN);
  (prisma.offer.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(OFFER);
  (prisma.adminSettings.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(SETTINGS);
});

describe("H2 - AdminSettings GST helper", () => {
  it("returns the configured rate and label when GSTIN is set", async () => {
    const gst = await getGstSettings();
    expect(gst.rateBasisPoints).toBe(500);
    expect(gst.ratePercent).toBe("5");
    expect(gst.label).toBe("GST @ 5%");
    expect(gst.enabled).toBe(true);
  });

  it("disables GST when no GSTIN is configured", async () => {
    (prisma.adminSettings.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      gstin: null,
      defaultGstRateBps: 500,
    });
    const gst = await getGstSettings();
    expect(gst.rateBasisPoints).toBe(0);
    expect(gst.enabled).toBe(false);
    expect(gst.label).toBe("GST @ 0%");
  });
});

describe("H2 - coupon preview uses the configured GST rate", () => {
  it("matches the order calculation instead of hardcoding 18%", async () => {
    const res = await validateOffer(makeRequest());
    const body = await res.json();

    expect(body.isValid).toBe(true);
    expect(body.discountPaise).toBe(10000);
    expect(body.taxableAmountPaise).toBe(90000);
    // 5% of 90,000 = 4,500 (not 18% = 16,200)
    expect(body.gstAmountPaise).toBe(4500);
    expect(body.netAmountPaise).toBe(94500);
    expect(body.gstRateBasisPoints).toBe(500);
    expect(body.gstRateLabel).toBe("GST @ 5%");
  });
});
