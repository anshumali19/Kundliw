import { isDemoMode } from "@/lib/config/demo";
import { PaymentProvider } from "./types";
import { DemoPaymentProvider } from "./demo";
import { RazorpayPaymentProvider } from "./razorpayProvider";

export function getPaymentProvider(): PaymentProvider {
  if (process.env.NODE_ENV === "production" && !isDemoMode()) {
    return new RazorpayPaymentProvider();
  }

  // In demo mode or local development
  return new DemoPaymentProvider();
}
