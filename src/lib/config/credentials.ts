import { prisma } from "@/lib/prisma";
import { decryptSecret, maskSecret } from "@/lib/security/crypto";

export type CredentialKey =
  | "RAZORPAY_KEY_ID"
  | "RAZORPAY_KEY_SECRET"
  | "RAZORPAY_WEBHOOK_SECRET"
  | "MSG91_AUTH_KEY"
  | "MSG91_SENDER_ID"
  | "MSG91_OTP_TEMPLATE_ID"
  | "SMTP_HOST"
  | "SMTP_PORT"
  | "SMTP_USER"
  | "SMTP_PASS"
  | "SMTP_FROM"
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET"
  | "FACEBOOK_APP_ID"
  | "FACEBOOK_APP_SECRET"
  | "ASTROSAGE_USER_ID"
  | "ASTROSAGE_API_KEY"
  | "GOOGLE_ANALYTICS_ID"
  | "GOOGLE_MAP_EMBED_URL";

interface CredentialMeta {
  key: CredentialKey;
  label: string;
  category: "PAYMENTS" | "SMS" | "EMAIL" | "AUTH" | "ASTRO" | "ANALYTICS" | "MAPS";
  description: string;
  envVar: string;
  isSecret: boolean;
}

export const CREDENTIALS_METADATA: Record<CredentialKey, CredentialMeta> = {
  RAZORPAY_KEY_ID: {
    key: "RAZORPAY_KEY_ID",
    label: "Razorpay Key ID",
    category: "PAYMENTS",
    description: "Publishable Key ID for client and server order generation (rzp_live_... or rzp_test_...).",
    envVar: "RAZORPAY_KEY_ID",
    isSecret: false,
  },
  RAZORPAY_KEY_SECRET: {
    key: "RAZORPAY_KEY_SECRET",
    label: "Razorpay Key Secret",
    category: "PAYMENTS",
    description: "Private secret key for cryptographic HMAC-SHA256 signature verification.",
    envVar: "RAZORPAY_KEY_SECRET",
    isSecret: true,
  },
  RAZORPAY_WEBHOOK_SECRET: {
    key: "RAZORPAY_WEBHOOK_SECRET",
    label: "Razorpay Webhook Secret",
    category: "PAYMENTS",
    description: "Signing secret configured in Razorpay Dashboard for webhook authenticity validation.",
    envVar: "RAZORPAY_WEBHOOK_SECRET",
    isSecret: true,
  },
  MSG91_AUTH_KEY: {
    key: "MSG91_AUTH_KEY",
    label: "MSG91 Auth Key",
    category: "SMS",
    description: "Authentication token for enterprise SMS OTP and transactional alerts.",
    envVar: "MSG91_AUTH_KEY",
    isSecret: true,
  },
  MSG91_SENDER_ID: {
    key: "MSG91_SENDER_ID",
    label: "MSG91 Sender ID",
    category: "SMS",
    description: "6-character DLT registered Sender Header (e.g. KANADJ).",
    envVar: "MSG91_SENDER_ID",
    isSecret: false,
  },
  MSG91_OTP_TEMPLATE_ID: {
    key: "MSG91_OTP_TEMPLATE_ID",
    label: "MSG91 DLT Template ID",
    category: "SMS",
    description: "Govt DLT approved template identifier for OTP delivery.",
    envVar: "MSG91_OTP_TEMPLATE_ID",
    isSecret: false,
  },
  SMTP_HOST: {
    key: "SMTP_HOST",
    label: "SMTP Host",
    category: "EMAIL",
    description: "Outgoing mail server hostname (e.g. smtp.gmail.com or email-smtp.ap-south-1.amazonaws.com).",
    envVar: "SMTP_HOST",
    isSecret: false,
  },
  SMTP_PORT: {
    key: "SMTP_PORT",
    label: "SMTP Port",
    category: "EMAIL",
    description: "SMTP port (587 for TLS, 465 for SSL).",
    envVar: "SMTP_PORT",
    isSecret: false,
  },
  SMTP_USER: {
    key: "SMTP_USER",
    label: "SMTP Username",
    category: "EMAIL",
    description: "Username / email for authenticating with mail server.",
    envVar: "SMTP_USER",
    isSecret: false,
  },
  SMTP_PASS: {
    key: "SMTP_PASS",
    label: "SMTP Password",
    category: "EMAIL",
    description: "Password or App-Specific Password for SMTP service.",
    envVar: "SMTP_PASS",
    isSecret: true,
  },
  SMTP_FROM: {
    key: "SMTP_FROM",
    label: "Default From Email",
    category: "EMAIL",
    description: "Sender address (e.g. Maharshi Kanad Kendra <contact@kanadastro.org>).",
    envVar: "SMTP_FROM",
    isSecret: false,
  },
  GOOGLE_CLIENT_ID: {
    key: "GOOGLE_CLIENT_ID",
    label: "Google Client ID",
    category: "AUTH",
    description: "OAuth 2.0 Web Client ID from Google Cloud Console.",
    envVar: "GOOGLE_CLIENT_ID",
    isSecret: false,
  },
  GOOGLE_CLIENT_SECRET: {
    key: "GOOGLE_CLIENT_SECRET",
    label: "Google Client Secret",
    category: "AUTH",
    description: "OAuth 2.0 Client Secret from Google Cloud Console.",
    envVar: "GOOGLE_CLIENT_SECRET",
    isSecret: true,
  },
  FACEBOOK_APP_ID: {
    key: "FACEBOOK_APP_ID",
    label: "Facebook App ID",
    category: "AUTH",
    description: "Meta for Developers Application ID for social sign-in.",
    envVar: "FACEBOOK_APP_ID",
    isSecret: false,
  },
  FACEBOOK_APP_SECRET: {
    key: "FACEBOOK_APP_SECRET",
    label: "Facebook App Secret",
    category: "AUTH",
    description: "Meta for Developers Application Secret.",
    envVar: "FACEBOOK_APP_SECRET",
    isSecret: true,
  },
  ASTROSAGE_USER_ID: {
    key: "ASTROSAGE_USER_ID",
    label: "AstroSage User ID",
    category: "ASTRO",
    description: "AstroSage Cloud Vedic Astrology API account ID.",
    envVar: "ASTROSAGE_USER_ID",
    isSecret: false,
  },
  ASTROSAGE_API_KEY: {
    key: "ASTROSAGE_API_KEY",
    label: "AstroSage API Key",
    category: "ASTRO",
    description: "Secret authorization key for astronomical planetary ephemeris API.",
    envVar: "ASTROSAGE_API_KEY",
    isSecret: true,
  },
  GOOGLE_ANALYTICS_ID: {
    key: "GOOGLE_ANALYTICS_ID",
    label: "Google Analytics 4 Measurement ID",
    category: "ANALYTICS",
    description: "GA4 Stream Measurement ID (e.g. G-XXXXXXXXXX).",
    envVar: "GOOGLE_ANALYTICS_ID",
    isSecret: false,
  },
  GOOGLE_MAP_EMBED_URL: {
    key: "GOOGLE_MAP_EMBED_URL",
    label: "Google Map Embed URL",
    category: "MAPS",
    description: "Standard iframe embed link from Google Maps (zero API costs required).",
    envVar: "GOOGLE_MAP_EMBED_URL",
    isSecret: false,
  },
};

/**
 * Resolves a credential value with precedence:
 * 1. Decrypted database value from AdminSettings (if set)
 * 2. Environment variable fallback (process.env[...])
 */
export async function getCredential(key: CredentialKey): Promise<string | null> {
  try {
    const settings = await prisma.adminSettings.findUnique({
      where: { id: "default" },
    });

    if (settings) {
      let dbValue: string | null = null;
      switch (key) {
        case "RAZORPAY_KEY_ID":
          dbValue = decryptSecret(settings.encRazorpayKeyId);
          break;
        case "RAZORPAY_KEY_SECRET":
          dbValue = decryptSecret(settings.encRazorpayKeySecret);
          break;
        case "RAZORPAY_WEBHOOK_SECRET":
          dbValue = decryptSecret(settings.encRazorpayWebhookSecret);
          break;
        case "MSG91_AUTH_KEY":
          dbValue = decryptSecret(settings.encMsg91AuthKey);
          break;
        case "MSG91_SENDER_ID":
          dbValue = settings.encMsg91SenderId;
          break;
        case "MSG91_OTP_TEMPLATE_ID":
          dbValue = settings.encMsg91OtpTemplateId;
          break;
        case "SMTP_HOST":
          dbValue = settings.encSmtpHost;
          break;
        case "SMTP_PORT":
          dbValue = settings.encSmtpPort ? String(settings.encSmtpPort) : null;
          break;
        case "SMTP_USER":
          dbValue = decryptSecret(settings.encSmtpUser);
          break;
        case "SMTP_PASS":
          dbValue = decryptSecret(settings.encSmtpPass);
          break;
        case "SMTP_FROM":
          dbValue = settings.encSmtpFrom;
          break;
        case "GOOGLE_CLIENT_ID":
          dbValue = settings.encGoogleClientId;
          break;
        case "GOOGLE_CLIENT_SECRET":
          dbValue = decryptSecret(settings.encGoogleClientSecret);
          break;
        case "FACEBOOK_APP_ID":
          dbValue = settings.encFacebookAppId;
          break;
        case "FACEBOOK_APP_SECRET":
          dbValue = decryptSecret(settings.encFacebookAppSecret);
          break;
        case "ASTROSAGE_USER_ID":
          dbValue = settings.encAstrosageUserId;
          break;
        case "ASTROSAGE_API_KEY":
          dbValue = decryptSecret(settings.encAstrosageApiKey);
          break;
        case "GOOGLE_ANALYTICS_ID":
          dbValue = settings.googleAnalyticsId;
          break;
        case "GOOGLE_MAP_EMBED_URL":
          dbValue = settings.googleMapEmbedUrl;
          break;
      }

      if (dbValue && dbValue.trim()) {
        return dbValue.trim();
      }
    }
  } catch (error) {
    console.warn(`[Credentials] Error reading DB credential for ${key}, checking env:`, error);
  }

  // Fallback to process.env
  const meta = CREDENTIALS_METADATA[key];
  const envVal = process.env[meta.envVar] || process.env[key];
  return envVal ? envVal.trim() : null;
}

export interface MaskedCredentialStatus {
  key: CredentialKey;
  label: string;
  category: "PAYMENTS" | "SMS" | "EMAIL" | "AUTH" | "ASTRO" | "ANALYTICS" | "MAPS";
  description: string;
  envVar: string;
  source: "DATABASE" | "ENVIRONMENT" | "NOT_CONFIGURED";
  isSet: boolean;
  masked: string;
}

/**
 * Returns a masked summary of all third-party credentials for the admin settings UI.
 * Never leaks raw secrets.
 */
export async function getMaskedCredentialsSummary(): Promise<MaskedCredentialStatus[]> {
  const settings = await prisma.adminSettings
    .findUnique({
      where: { id: "default" },
    })
    .catch(() => null);

  const results: MaskedCredentialStatus[] = [];

  for (const [key, meta] of Object.entries(CREDENTIALS_METADATA)) {
    const credKey = key as CredentialKey;
    let dbValue: string | null = null;

    if (settings) {
      switch (credKey) {
        case "RAZORPAY_KEY_ID":
          dbValue = decryptSecret(settings.encRazorpayKeyId);
          break;
        case "RAZORPAY_KEY_SECRET":
          dbValue = decryptSecret(settings.encRazorpayKeySecret);
          break;
        case "RAZORPAY_WEBHOOK_SECRET":
          dbValue = decryptSecret(settings.encRazorpayWebhookSecret);
          break;
        case "MSG91_AUTH_KEY":
          dbValue = decryptSecret(settings.encMsg91AuthKey);
          break;
        case "MSG91_SENDER_ID":
          dbValue = settings.encMsg91SenderId;
          break;
        case "MSG91_OTP_TEMPLATE_ID":
          dbValue = settings.encMsg91OtpTemplateId;
          break;
        case "SMTP_HOST":
          dbValue = settings.encSmtpHost;
          break;
        case "SMTP_PORT":
          dbValue = settings.encSmtpPort ? String(settings.encSmtpPort) : null;
          break;
        case "SMTP_USER":
          dbValue = decryptSecret(settings.encSmtpUser);
          break;
        case "SMTP_PASS":
          dbValue = decryptSecret(settings.encSmtpPass);
          break;
        case "SMTP_FROM":
          dbValue = settings.encSmtpFrom;
          break;
        case "GOOGLE_CLIENT_ID":
          dbValue = settings.encGoogleClientId;
          break;
        case "GOOGLE_CLIENT_SECRET":
          dbValue = decryptSecret(settings.encGoogleClientSecret);
          break;
        case "FACEBOOK_APP_ID":
          dbValue = settings.encFacebookAppId;
          break;
        case "FACEBOOK_APP_SECRET":
          dbValue = decryptSecret(settings.encFacebookAppSecret);
          break;
        case "ASTROSAGE_USER_ID":
          dbValue = settings.encAstrosageUserId;
          break;
        case "ASTROSAGE_API_KEY":
          dbValue = decryptSecret(settings.encAstrosageApiKey);
          break;
        case "GOOGLE_ANALYTICS_ID":
          dbValue = settings.googleAnalyticsId;
          break;
        case "GOOGLE_MAP_EMBED_URL":
          dbValue = settings.googleMapEmbedUrl;
          break;
      }
    }

    const envVal = process.env[meta.envVar] || process.env[credKey];

    if (dbValue && dbValue.trim()) {
      const maskInfo = maskSecret(dbValue);
      results.push({
        ...meta,
        source: "DATABASE",
        isSet: true,
        masked: meta.isSecret ? maskInfo.masked : dbValue.trim(),
      });
    } else if (envVal && envVal.trim()) {
      const maskInfo = maskSecret(envVal);
      results.push({
        ...meta,
        source: "ENVIRONMENT",
        isSet: true,
        masked: meta.isSecret ? maskInfo.masked : envVal.trim(),
      });
    } else {
      results.push({
        ...meta,
        source: "NOT_CONFIGURED",
        isSet: false,
        masked: "Not Configured",
      });
    }
  }

  return results;
}
