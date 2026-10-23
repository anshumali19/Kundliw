export interface CreatePaymentOrderInput {
  orderId: string;
  orderNumber: string;
  netAmountPaise: number;
  currency?: string;
}

export interface PaymentOrderResult {
  providerOrderId: string;
  amountPaise: number;
  currency: string;
  keyId?: string;
}

export interface VerifyPaymentPayload {
  orderId: string;
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

export interface PaymentProvider {
  name: string;
  createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult>;
  verifyPayment(payload: VerifyPaymentPayload): Promise<boolean>;
}
