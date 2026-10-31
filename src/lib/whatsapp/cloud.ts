import { createHmac, timingSafeEqual } from "crypto";
import { getCredential } from "@/lib/config/credentials";
import { prisma } from "@/lib/prisma";

const GRAPH = "https://graph.facebook.com/v21.0";

/** WhatsApp is switched on once the Access Token and the Phone Number ID are saved. */
export async function isWhatsAppActive(): Promise<boolean> {
  const [token, phoneId] = await Promise.all([getCredential("WHATSAPP_ACCESS_TOKEN"), getCredential("WHATSAPP_PHONE_NUMBER_ID")]);
  return Boolean(token && phoneId);
}

/** Checks Meta's X-Hub-Signature-256 header. Passes when no App Secret is saved yet. */
export async function verifyWebhookSignature(rawBody: string, header: string | null): Promise<boolean> {
  const secret = await getCredential("WHATSAPP_APP_SECRET");
  if (!secret) return true;
  if (!header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const given = header.slice(7);
  return given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

/** Sends a text message and writes it to the chat log. Returns an error text, or null on success. */
export async function sendWhatsAppText(toPhone: string, body: string): Promise<string | null> {
  const [token, phoneId] = await Promise.all([getCredential("WHATSAPP_ACCESS_TOKEN"), getCredential("WHATSAPP_PHONE_NUMBER_ID")]);
  if (!token || !phoneId) return "WhatsApp is not switched on yet. Add the keys in API keys & Analytics.";

  const to = toPhone.replace(/\D/g, "");
  let waMessageId: string | null = null;
  let error: string | null = null;
  try {
    const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body } }),
    });
    const data = (await res.json().catch(() => ({}))) as { messages?: Array<{ id: string }>; error?: { message?: string } };
    if (!res.ok) error = data.error?.message ?? `WhatsApp refused the message (${res.status}).`;
    else waMessageId = data.messages?.[0]?.id ?? null;
  } catch {
    error = "Could not reach WhatsApp. Try again.";
  }

  await prisma.whatsAppMessage.create({
    data: { waMessageId, contactPhone: to, direction: "OUT", body, status: error ? "FAILED" : "SENT" },
  });
  return error;
}
