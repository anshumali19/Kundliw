import { describe, it, expect } from "vitest";
import * as crypto from "crypto";
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "../src/lib/payments/razorpay";

describe("Razorpay Signature Verification", () => {
  const keySecret = "test_razorpay_secret_12345";
  const orderId = "order_MKJK_9921";
  const paymentId = "pay_H83kdjw912";

  it("verifies genuine payment signature successfully", () => {
    const validSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isValid = verifyRazorpayPaymentSignature(
      { orderId, paymentId, signature: validSignature },
      keySecret
    );
    expect(isValid).toBe(true);
  });

  it("rejects forged or tampered payment signature", () => {
    const forgedSignature = "0000000000000000000000000000000000000000000000000000000000000000";

    const isValid = verifyRazorpayPaymentSignature(
      { orderId, paymentId, signature: forgedSignature },
      keySecret
    );
    expect(isValid).toBe(false);
  });

  it("verifies genuine webhook payload signature successfully", () => {
    const webhookSecret = "wh_secret_vedic_test";
    const rawBody = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: paymentId, amount: 210000 } } },
    });

    const validSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const isValid = verifyRazorpayWebhookSignature(
      rawBody,
      validSignature,
      webhookSecret
    );
    expect(isValid).toBe(true);
  });

  it("rejects webhook signature when body has been modified", () => {
    const webhookSecret = "wh_secret_vedic_test";
    const rawBody = JSON.stringify({ event: "payment.captured" });
    const tamperedBody = JSON.stringify({ event: "payment.failed" });

    const signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const isValid = verifyRazorpayWebhookSignature(
      tamperedBody,
      signature,
      webhookSecret
    );
    expect(isValid).toBe(false);
  });
});
