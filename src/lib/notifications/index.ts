import { KENDRA_EMAIL } from "@/lib/content/contact";
import nodemailer from "nodemailer";
import { getCredential } from "@/lib/config/credentials";

export interface NotificationInput {
  email?: string | null;
  phone?: string | null;
  subject: string;
  message: string;
}

export interface NotificationResult {
  emailSent: boolean;
  /** Why nothing was sent, for logs only (never shown to visitors). */
  skipped?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Sends a transactional notification by email using the SMTP details the admin
 * saved under API Keys (or SMTP_* environment variables).
 *
 * This never throws: a failed notification must not fail the booking, approval
 * or payment that triggered it. SMS needs a DLT-approved template per message
 * type, so it is connected separately once the client has registered one.
 */
export async function sendNotification(input: NotificationInput): Promise<NotificationResult> {
  if (!input.email) return { emailSent: false, skipped: "no recipient email" };

  try {
    const [host, port, user, pass, from] = await Promise.all([
      getCredential("SMTP_HOST"),
      getCredential("SMTP_PORT"),
      getCredential("SMTP_USER"),
      getCredential("SMTP_PASS"),
      getCredential("SMTP_FROM"),
    ]);

    if (!host || !user || !pass) {
      return { emailSent: false, skipped: "SMTP is not configured" };
    }

    const portNumber = Number(port) || 587;
    const transport = nodemailer.createTransport({
      host,
      port: portNumber,
      secure: portNumber === 465,
      auth: { user, pass },
    });

    const safe = escapeHtml(input.message).replace(/\n/g, "<br>");
    await transport.sendMail({
      from: from || user,
      to: input.email,
      replyTo: KENDRA_EMAIL,
      subject: input.subject,
      text: `${input.message}\n\nMaharshi Kanad Jyotish Kendra\n${KENDRA_EMAIL}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1a0000">${safe}<br><br><strong>Maharshi Kanad Jyotish Kendra</strong><br><a href="mailto:${KENDRA_EMAIL}" style="color:#800000">${KENDRA_EMAIL}</a></div>`,
    });
    return { emailSent: true };
  } catch (error) {
    console.error("[Notifications] Email failed:", error instanceof Error ? error.message : error);
    return { emailSent: false, skipped: "send failed" };
  }
}
