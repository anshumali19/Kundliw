import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { generateInvoicePdf, InvoicePdfData } from "@/lib/billing/invoicePdf";
import { calculateGst } from "@/lib/billing/gst";

describe("Phase 6 - Billing & PDF Invoices", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, DEMO_MODE: "true" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("generates a valid binary PDF document with %PDF- header magic bytes", async () => {
    const sampleData: InvoicePdfData = {
      invoiceNumber: "INV-2026-0042",
      orderNumber: "MKJK-2026-0089",
      date: new Date("2026-10-23T10:00:00Z"),
      siteName: "Maharshi Kanad Jyotish Kendra",
      siteAddress: "Dashashwamedh Ghat, Varanasi, UP 221001",
      sitePhone: "+91-9827991224",
      siteEmail: "vedic@kanad-jyotish.in",
      gstin: "09AAATM1234F1Z5",
      customerName: "Aditya Narayan Sharma",
      customerPhone: "+917509124672",
      customerEmail: "aditya.sharma@example.com",
      serviceTitle: "Complete Janampatri & Lifetime Kundli",
      planTitle: "Deep Navamsha Dossier",
      baseAmountPaise: 280000,
      discountAmountPaise: 50000,
      taxableAmountPaise: 230000,
      gstAmountPaise: 41400,
      netAmountPaise: 271400,
      paymentMode: "RAZORPAY",
      offerCode: "JYOTISH500",
    };

    const pdfBuffer = await generateInvoicePdf(sampleData);

    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.length).toBeGreaterThan(1000);

    // Verify PDF Magic Bytes: %PDF- (0x25 0x50 0x44 0x46 0x2D)
    expect(pdfBuffer[0]).toBe(0x25);
    expect(pdfBuffer[1]).toBe(0x50);
    expect(pdfBuffer[2]).toBe(0x44);
    expect(pdfBuffer[3]).toBe(0x46);
    expect(pdfBuffer[4]).toBe(0x2d);
  });

  it("calculates 0 GST when GSTIN is unset or tax rate is 0 bps", () => {
    const result = calculateGst({
      baseAmountPaise: 210000,
      discountAmountPaise: 0,
      gstRateBasisPoints: 0,
    });

    expect(result.taxableAmountPaise).toBe(210000);
    expect(result.gstAmountPaise).toBe(0);
    expect(result.netAmountPaise).toBe(210000);
  });

  it("calculates standard 18% GST correctly when GSTIN is present", () => {
    const result = calculateGst({
      baseAmountPaise: 200000, // Rs 2,000.00
      discountAmountPaise: 50000, // Rs 500.00
      gstRateBasisPoints: 1800, // 18%
    });

    expect(result.taxableAmountPaise).toBe(150000); // Rs 1,500.00
    expect(result.gstAmountPaise).toBe(27000); // Rs 270.00
    expect(result.netAmountPaise).toBe(177000); // Rs 1,770.00
  });
});
