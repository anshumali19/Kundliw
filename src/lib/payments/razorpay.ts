import * as crypto from "crypto";

export interface RazorpaySignaturePayload {
  orderId: string;
  paymentId: string;
  signature: string;
}

/**
 * Pure function verifying client-side Razorpay payment signature
 * against HMAC SHA256(order_id + "|" + razorpay_payment_id, key_secret).
 */
export function verifyRazorpayPaymentSignature(
  { orderId, paymentId, signature }: RazorpaySignaturePayload,
  keySecret: string
): boolean {
  if (!orderId || !paymentId || !signature || !keySecret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "utf-8"),
    Buffer.from(expectedSignature, "utf-8")
  );
}

/**
 * Pure function verifying Razorpay webhook signature
 * against HMAC SHA256(rawBody, webhookSecret).
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  webhookSecret: string
): boolean {
  if (!rawBody || !signatureHeader || !webhookSecret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader, "utf-8"),
      Buffer.from(expectedSignature, "utf-8")
    );
  } catch {
    return false;
  }
}
