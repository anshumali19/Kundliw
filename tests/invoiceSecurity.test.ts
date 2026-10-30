import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * C3: invoice HTML must escape all interpolated values, must derive the payment
 * status and GST rate from order data (not hardcoded strings), and must be
 * served with protective headers. The PDF generator must do the same.
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

const sessionState = vi.hoisted(() => ({
  current: null as null | { user: { id: string } },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(async () => sessionState.current),
}));

const pdfCapture = vi.hoisted(() => ({ texts: [] as string[] }));

vi.mock("pdfkit", () => {
  class FakePDFDocument {
    handlers: Record<string, (...args: unknown[]) => void> = {};
    constructor(_options?: unknown) {}
    on(event: string, cb: (...args: unknown[]) => void) {
      this.handlers[event] = cb;
      return this;
    }
    registerFont() { return this; }
    image() { return this; }
    save() { return this; }
    restore() { return this; }
    rotate() { return this; }
    fontSize() { return this; }
    fillColor() { return this; }
    opacity() { return this; }
    text(value: string) { pdfCapture.texts.push(String(value)); return this; }
    font() { return this; }
    strokeColor() { return this; }
    lineWidth() { return this; }
    moveTo() { return this; }
    lineTo() { return this; }
    stroke() { return this; }
    rect() { return this; }
    fill() { return this; }
    end() { this.handlers.end?.(); }
  }
  return { default: FakePDFDocument };
});

import { prisma } from "@/lib/prisma";
import { GET } from "@/app/api/invoice/[id]/route";
import { generateInvoicePdf, InvoicePdfData } from "@/lib/billing/invoicePdf";

const MALICIOUS_NAME = '<script>alert("xss")</script>';

const USER = {
  id: "user-1",
  name: "Customer",
  email: "customer@example.com",
  phone: "+919999900002",
  role: "USER",
};

const ORDER = {
  id: "order-1",
  userId: USER.id,
  orderNumber: "MKJK-2026-0042",
  invoiceNumber: "INV-2026-0042",
  createdAt: new Date("2026-10-23T10:00:00Z"),
  jatakaDetails: {
    name: MALICIOUS_NAME,
    phone: "+919999900002",
    email: "customer@example.com",
  },
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
  user: { name: "Customer", phone: "+919999900002", email: "customer@example.com" },
};

const SETTINGS = {
  id: "default",
  siteNameEn: "Maharshi Kanad Jyotish Kendra",
  addressEn: "Dashashwamedh Ghat, Varanasi",
  phone1: "+91-9827991224",
  email: "vedic@kanad-jyotish.in",
  gstin: "09AAATM1234F1Z5",
};

beforeEach(() => {
  vi.clearAllMocks();
  pdfCapture.texts.length = 0;
  sessionState.current = { user: { id: USER.id } };
  (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(USER);
  (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(ORDER);
  (prisma.adminSettings.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(SETTINGS);
});

describe("C3 - invoice HTML hardening", () => {
  it("escapes customer-controlled values and derives status and GST rate", async () => {
    const res = await GET(
      new NextRequest("http://localhost:3000/api/invoice/order-1?format=html"),
      { params: Promise.resolve({ id: "order-1" }) }
    );

    expect(res.status).toBe(200);
    const html = await res.text();

    // Stored XSS must be neutralised.
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");

    // Status and GST label must come from order data.
    expect(html).toContain("(PENDING)");
    expect(html).not.toContain("(PAID)");
    expect(html).toContain("GST (5%)");
    expect(html).not.toContain("GST (18%)");

    // Protective headers.
    expect(res.headers.get("content-security-policy")).toContain("default-src 'none'");
    // Only the Print button's own script is allowed, by its fingerprint: never inline scripts in general
    const csp = res.headers.get("content-security-policy") || "";
    expect(csp).toMatch(/script-src 'sha256-[A-Za-z0-9+/=]+'/);
    expect(csp).not.toMatch(/script-src[^;]*unsafe/);
    expect(html.match(/<script>/g)?.length).toBe(1);
    expect(res.headers.get("content-disposition")).toContain("inline; filename=");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("renders PAID only when the order is actually paid", async () => {
    (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...ORDER,
      paymentStatus: "PAID",
    });

    const res = await GET(
      new NextRequest("http://localhost:3000/api/invoice/order-1?format=html"),
      { params: Promise.resolve({ id: "order-1" }) }
    );

    const html = await res.text();
    expect(html).toContain("(PAID)");
  });
});

describe("C3 - invoice PDF status and GST label", () => {
  const baseData: InvoicePdfData = {
    invoiceNumber: "INV-2026-0042",
    orderNumber: "MKJK-2026-0042",
    date: new Date("2026-10-23T10:00:00Z"),
    siteName: "Maharshi Kanad Jyotish Kendra",
    siteAddress: "Dashashwamedh Ghat, Varanasi",
    sitePhone: "+91-9827991224",
    siteEmail: "vedic@kanad-jyotish.in",
    gstin: "09AAATM1234F1Z5",
    customerName: "Customer",
    customerPhone: "+919999900002",
    customerEmail: "customer@example.com",
    serviceTitle: "Complete Janampatri",
    planTitle: "Standard Tier",
    baseAmountPaise: 100000,
    discountAmountPaise: 0,
    taxableAmountPaise: 100000,
    gstAmountPaise: 5000,
    netAmountPaise: 105000,
    paymentMode: "RAZORPAY",
    offerCode: null,
  };

  it("uses the real payment status and GST rate instead of CONFIRMED / PAID and 18%", async () => {
    await generateInvoicePdf({
      ...baseData,
      paymentStatus: "PENDING",
      gstRateBasisPoints: 500,
    } as unknown as InvoicePdfData);

    const text = pdfCapture.texts.join("\n");
    expect(text).not.toContain("CONFIRMED / PAID");
    expect(text).toContain("PENDING");
    expect(text).toContain("GST @ 5%");
    expect(text).not.toContain("GST @ 18%");
  });
});
