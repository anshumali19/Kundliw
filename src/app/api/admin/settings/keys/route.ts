import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import {
  getMaskedCredentialsSummary,
  CREDENTIALS_METADATA,
  CredentialKey,
} from "@/lib/config/credentials";
import { encryptSecret } from "@/lib/security/crypto";
import { z } from "zod";

const updateKeysSchema = z.record(z.string(), z.string().nullable().optional());

export async function GET() {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  try {
    const summary = await getMaskedCredentialsSummary();
    return NextResponse.json({ success: true, credentials: summary });
  } catch (error) {
    console.error("[API Admin Settings Keys GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to load credentials summary." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const csrf = validateCsrfOrigin(req);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const body = await req.json();
    const parsed = updateKeysSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload format." },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updateData: Record<string, any> = {};

    for (const [key, rawValue] of Object.entries(data)) {
      if (!rawValue || typeof rawValue !== "string" || !rawValue.trim()) {
        continue;
      }
      const trimmed = rawValue.trim();
      const meta = CREDENTIALS_METADATA[key as CredentialKey];
      if (!meta) continue;

      switch (key as CredentialKey) {
        case "RAZORPAY_KEY_ID":
          updateData.encRazorpayKeyId = encryptSecret(trimmed);
          break;
        case "RAZORPAY_KEY_SECRET":
          updateData.encRazorpayKeySecret = encryptSecret(trimmed);
          break;
        case "RAZORPAY_WEBHOOK_SECRET":
          updateData.encRazorpayWebhookSecret = encryptSecret(trimmed);
          break;
        case "MSG91_AUTH_KEY":
          updateData.encMsg91AuthKey = encryptSecret(trimmed);
          break;
        case "MSG91_SENDER_ID":
          updateData.encMsg91SenderId = trimmed;
          break;
        case "MSG91_OTP_TEMPLATE_ID":
          updateData.encMsg91OtpTemplateId = trimmed;
          break;
        case "SMTP_HOST":
          updateData.encSmtpHost = trimmed;
          break;
        case "SMTP_PORT":
          updateData.encSmtpPort = parseInt(trimmed, 10) || 587;
          break;
        case "SMTP_USER":
          updateData.encSmtpUser = encryptSecret(trimmed);
          break;
        case "SMTP_PASS":
          updateData.encSmtpPass = encryptSecret(trimmed);
          break;
        case "SMTP_FROM":
          updateData.encSmtpFrom = trimmed;
          break;
        case "GOOGLE_CLIENT_ID":
          updateData.encGoogleClientId = trimmed;
          break;
        case "GOOGLE_CLIENT_SECRET":
          updateData.encGoogleClientSecret = encryptSecret(trimmed);
          break;
        case "ASTROSAGE_USER_ID":
          updateData.encAstrosageUserId = trimmed;
          break;
        case "ASTROSAGE_API_KEY":
          updateData.encAstrosageApiKey = encryptSecret(trimmed);
          break;
        case "GOOGLE_ANALYTICS_ID":
          updateData.googleAnalyticsId = trimmed;
          break;
        case "GOOGLE_MAP_EMBED_URL":
          updateData.googleMapEmbedUrl = trimmed;
          break;
        case "WHATSAPP_ACCESS_TOKEN":
          updateData.encWhatsappAccessToken = encryptSecret(trimmed);
          break;
        case "WHATSAPP_PHONE_NUMBER_ID":
          updateData.encWhatsappPhoneNumberId = trimmed;
          break;
        case "WHATSAPP_VERIFY_TOKEN":
          updateData.encWhatsappVerifyToken = encryptSecret(trimmed);
          break;
        case "WHATSAPP_APP_SECRET":
          updateData.encWhatsappAppSecret = encryptSecret(trimmed);
          break;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.adminSettings.upsert({
        where: { id: "default" },
        update: updateData,
        create: {
          id: "default",
          ...updateData,
        },
      });
    }

    const updatedSummary = await getMaskedCredentialsSummary();
    return NextResponse.json({
      success: true,
      message: "Credentials encrypted and saved successfully at rest.",
      credentials: updatedSummary,
    });
  } catch (error) {
    console.error("[API Admin Settings Keys POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to update encrypted credentials." },
      { status: 500 }
    );
  }
}
