import { NextRequest, NextResponse } from "next/server";
import { getCredential } from "@/lib/config/credentials";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/whatsapp/cloud";

interface WaPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        contacts?: Array<{ wa_id: string; profile?: { name?: string } }>;
        messages?: Array<{ id: string; from: string; type: string; text?: { body?: string } }>;
      };
    }>;
  }>;
}

/** Meta calls this once when you add the webhook, to check the verify token. */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const expected = await getCredential("WHATSAPP_VERIFY_TOKEN");
  if (expected && p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === expected) {
    return new NextResponse(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

/** Incoming client messages are saved to the chat log. */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!(await verifyWebhookSignature(raw, req.headers.get("x-hub-signature-256")))) {
    return new NextResponse("Bad signature", { status: 401 });
  }
  let payload: WaPayload;
  try {
    payload = JSON.parse(raw) as WaPayload;
  } catch {
    return NextResponse.json({ ok: true });
  }

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const names = new Map((change.value?.contacts ?? []).map((c) => [c.wa_id, c.profile?.name ?? null]));
      for (const m of change.value?.messages ?? []) {
        const body = m.type === "text" ? m.text?.body ?? "" : `[${m.type}]`;
        await prisma.whatsAppMessage
          .upsert({
            where: { waMessageId: m.id },
            update: {},
            create: { waMessageId: m.id, contactPhone: m.from, contactName: names.get(m.from) ?? null, direction: "IN", body },
          })
          .catch((e) => console.error("[WhatsApp webhook] save failed", e));
      }
    }
  }
  return NextResponse.json({ ok: true });
}
