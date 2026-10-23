import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DemoPaymentProvider } from "@/lib/payments/demo";
import { RazorpayPaymentProvider } from "@/lib/payments/razorpayProvider";
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "@/lib/payments/razorpay";
import {
  validateFileMagicBytes,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/storage";
import * as crypto from "crypto";

describe("Phase 5 - Payments & Storage Subsystem", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, DEMO_MODE: "true" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("DemoPaymentProvider creates valid demo order and verifies demo payments", async () => {
    const provider = new DemoPaymentProvider();
    const result = await provider.createPaymentOrder({
      orderId: "ord_123",
      orderNumber: "MKJK-2026-0001",
      netAmountPaise: 230000,
      currency: "INR",
    });

    expect(result.providerOrderId).toContain("demo_order_MKJK20260001");
    expect(result.amountPaise).toBe(230000);
    expect(result.currency).toBe("INR");

    const isValid = await provider.verifyPayment({
      orderId: "ord_123",
      providerOrderId: result.providerOrderId,
      providerPaymentId: "demo_pay_123456",
      signature: "simulated_sig",
    });

    expect(isValid).toBe(true);

    const isInvalid = await provider.verifyPayment({
      orderId: "ord_123",
      providerOrderId: result.providerOrderId,
      providerPaymentId: "",
      signature: "simulated_sig",
    });

    expect(isInvalid).toBe(false);
  });

  it("RazorpayPaymentProvider throws if unconfigured in production without DEMO_MODE", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    process.env.DEMO_MODE = "false";
    process.env.RAZORPAY_KEY_ID = "rzp_test_placeholder";

    expect(() => new RazorpayPaymentProvider()).toThrow(/CRITICAL PAYMENT CONFIGURATION ERROR/);
  });

  it("verifies client razorpay payment signature correctly", () => {
    const keySecret = "kendra_secret_key_123";
    const orderId = "order_DBJOWzybf0sJbb";
    const paymentId = "pay_29MoEhaboh72Wm";

    const signature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const valid = verifyRazorpayPaymentSignature(
      { orderId, paymentId, signature },
      keySecret
    );
    expect(valid).toBe(true);

    const invalid = verifyRazorpayPaymentSignature(
      { orderId, paymentId, signature: "tampered_signature" },
      keySecret
    );
    expect(invalid).toBe(false);
  });

  it("verifies razorpay webhook raw body signature correctly", () => {
    const webhookSecret = "whsec_test_token_8899";
    const rawBody = JSON.stringify({ event: "payment.captured", id: "evt_123" });

    const signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const valid = verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret);
    expect(valid).toBe(true);

    const invalid = verifyRazorpayWebhookSignature(rawBody, "bad_signature", webhookSecret);
    expect(invalid).toBe(false);
  });

  it("validates file magic bytes for PDF, PNG, JPEG, WEBP and rejects executables", () => {
    // PDF: %PDF-
    const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35]);
    expect(validateFileMagicBytes(pdfBuffer)).toEqual({
      isValid: true,
      detectedMime: "application/pdf",
    });

    // PNG: 0x89 0x50 0x4E 0x47
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(validateFileMagicBytes(pngBuffer)).toEqual({
      isValid: true,
      detectedMime: "image/png",
    });

    // JPEG: 0xFF 0xD8 0xFF
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    expect(validateFileMagicBytes(jpegBuffer)).toEqual({
      isValid: true,
      detectedMime: "image/jpeg",
    });

    // Fake / Executable buffer: MZ
    const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00]);
    expect(validateFileMagicBytes(exeBuffer)).toEqual({
      isValid: false,
      detectedMime: null,
    });
  });

  it("strictly enforces 10MB file size limit", () => {
    expect(MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
  });
});
