import { getCredential } from "@/lib/config/credentials";

export interface RazorpayKeys {
  keyId: string;
  keySecret: string;
}

/**
 * The Razorpay keys: the ones saved in Admin > API keys & Analytics first, then the Vercel environment.
 * Returns null while they are missing or still placeholders, so online payment stays off and UPI / QR / bank payment is shown.
 */
export async function getRazorpayKeys(): Promise<RazorpayKeys | null> {
  const [keyId, keySecret] = await Promise.all([getCredential("RAZORPAY_KEY_ID"), getCredential("RAZORPAY_KEY_SECRET")]);
  if (!keyId || !keySecret || keyId === "rzp_test_placeholder" || keySecret.includes("placeholder")) return null;
  return { keyId, keySecret };
}

/** True when real Razorpay keys are set. */
export async function razorpayConfigured(): Promise<boolean> {
  return (await getRazorpayKeys()) !== null;
}
