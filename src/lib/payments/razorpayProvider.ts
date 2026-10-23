import Razorpay from "razorpay";
import { CreatePaymentOrderInput, PaymentOrderResult, PaymentProvider, VerifyPaymentPayload } from "./types";
import { verifyRazorpayPaymentSignature } from "./razorpay";

export class RazorpayPaymentProvider implements PaymentProvider {
  name = "RazorpayPaymentProvider";
  private keyId: string;
  private keySecret: string;
  private instance: Razorpay | null = null;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    if (!this.keyId || !this.keySecret || this.keyId === "rzp_test_placeholder") {
      // In production without real keys, this must fail loudly
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "CRITICAL PAYMENT CONFIGURATION ERROR: Razorpay keys are missing or set to placeholder in production. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
        );
      }
    } else {
      this.instance = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret,
      });
    }
  }

  async createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
    if (!this.instance) {
      throw new Error("Razorpay client is not configured. Please add valid keys to environment.");
    }

    const options = {
      amount: input.netAmountPaise,
      currency: input.currency || "INR",
      receipt: input.orderNumber,
      notes: {
        orderId: input.orderId,
      },
    };

    const rzpOrder = await this.instance.orders.create(options);
    return {
      providerOrderId: rzpOrder.id,
      amountPaise: Number(rzpOrder.amount),
      currency: rzpOrder.currency,
      keyId: this.keyId,
    };
  }

  async verifyPayment(payload: VerifyPaymentPayload): Promise<boolean> {
    if (!this.keySecret) {
      throw new Error("Razorpay key secret is not configured.");
    }

    return verifyRazorpayPaymentSignature(
      {
        orderId: payload.providerOrderId,
        paymentId: payload.providerPaymentId,
        signature: payload.signature,
      },
      this.keySecret
    );
  }
}
