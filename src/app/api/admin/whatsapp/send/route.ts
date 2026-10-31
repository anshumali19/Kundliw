import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { sendWhatsAppText } from "@/lib/whatsapp/cloud";

const schema = z.object({ phone: z.string().trim().min(8).max(20), body: z.string().trim().min(1).max(1000) });

export async function POST(req: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(req);
  if (!csrf.isValid) return csrf.errorResponse;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Write a message first." }, { status: 400 });

  const error = await sendWhatsAppText(parsed.data.phone, parsed.data.body);
  return error ? NextResponse.json({ error }, { status: 502 }) : NextResponse.json({ success: true });
}
