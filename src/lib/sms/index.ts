export interface SendSmsInput {
  phone: string;
  message: string;
  otp?: string;
  templateId?: string;
}

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SmsProvider {
  name: string;
  sendSms(input: SendSmsInput): Promise<SmsSendResult>;
}

/**
 * Developer Console implementation for local development and staging.
 */
export class DevConsoleSmsProvider implements SmsProvider {
  name = "DevConsoleSmsProvider";

  async sendSms(input: SendSmsInput): Promise<SmsSendResult> {
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n========================================`);
      console.log(`[DEV SMS GATEWAY] Recipient: ${input.phone}`);
      console.log(`Message: ${input.message}`);
      if (input.otp) {
        console.log(`OTP Payload: ${input.otp}`);
      }
      console.log(`========================================\n`);
    }
    return { success: true, messageId: `dev-msg-${Date.now()}` };
  }
}

/**
 * MSG91 SMS Provider placeholder for production SMS gateway.
 */
export class Msg91SmsProvider implements SmsProvider {
  name = "Msg91SmsProvider";
  private authKey: string;
  private senderId: string;

  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY || "";
    this.senderId = process.env.MSG91_SENDER_ID || "MKANAD";
  }

  async sendSms(input: SendSmsInput): Promise<SmsSendResult> {
    if (!this.authKey) {
      throw new Error("MSG91_AUTH_KEY is not configured in environment variables.");
    }

    try {
      // Production MSG91 API call
      const response = await fetch("https://control.msg91.com/api/v5/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey: this.authKey,
        },
        body: JSON.stringify({
          template_id: input.templateId || process.env.MSG91_OTP_TEMPLATE_ID,
          mobile: input.phone.replace("+", ""),
          otp: input.otp,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.type === "error") {
        return { success: false, error: data.message || "Failed to dispatch via MSG91" };
      }

      return { success: true, messageId: data.request_id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error during SMS dispatch",
      };
    }
  }
}

/**
 * Factory function returning the appropriate SMS provider.
 * Fails loudly in production if no provider credentials are configured.
 */
export function getSmsProvider(): SmsProvider {
  if (process.env.NODE_ENV === "production") {
    if (process.env.MSG91_AUTH_KEY) {
      return new Msg91SmsProvider();
    }
    throw new Error(
      "CRITICAL CONFIGURATION ERROR: No SMS provider configured for production environment. Set MSG91_AUTH_KEY or configure provider."
    );
  }

  return new DevConsoleSmsProvider();
}
