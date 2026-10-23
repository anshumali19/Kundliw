import { assertPlaceholderAllowed } from "@/lib/config/demo";
import { CreatePaymentOrderInput, PaymentOrderResult, PaymentProvider, VerifyPaymentPayload } from "./types";

/**
 * Demo / Simulation Payment Provider for Client MVP testing.
 * Strictly gated by DEMO_MODE=true.
 */
export class DemoPaymentProvider implements PaymentProvider {
  name = "DemoPaymentProvider";

  constructor() {
    assertPlaceholderAllowed("DemoPaymentProvider");
  }

  async createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
    return {
      providerOrderId: `demo_order_${input.orderNumber.replace(/[^a-zA-Z0-9]/g, "")}_${Date.now()}`,
      amountPaise: input.netAmountPaise,
      currency: input.currency || "INR",
      keyId: "demo_key_test_vedic",
    };
  }

  async verifyPayment(payload: VerifyPaymentPayload): Promise<boolean> {
    // In demo mode, verify that the simulated payment ID follows pattern
    if (!payload.providerPaymentId || payload.providerPaymentId.trim() === "") {
      return false;
    }
    return (
      payload.providerPaymentId.startsWith("demo_pay_") ||
      payload.providerPaymentId.startsWith("pay_")
    );
  }
}
