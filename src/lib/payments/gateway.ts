/** True when real Razorpay keys are set (Vercel > Environment Variables). Placeholders do not count. */
export function razorpayConfigured(): boolean {
  const id = process.env.RAZORPAY_KEY_ID || "";
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  return !!id && !!secret && id !== "rzp_test_placeholder" && !secret.includes("placeholder");
}
