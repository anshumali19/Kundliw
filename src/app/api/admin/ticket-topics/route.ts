import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { TICKET_TOPICS_KEY } from "@/lib/tickets/topics";

const schema = z.object({
  topics: z
    .array(z.object({ en: z.string().trim().min(2, "Each question needs English words.").max(150), hi: z.string().trim().max(150) }))
    .max(30, "At most 30 questions."),
});

/** Saves the ready-made questions customers can pick when raising a ticket. */
export async function PUT(req: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(req);
  if (!csrf.isValid) return csrf.errorResponse;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the questions." }, { status: 400 });

  const value = parsed.data.topics.map((t, i) => ({
    id: `q${i + 1}-${t.en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30)}`,
    en: t.en,
    hi: t.hi || t.en,
  }));
  await prisma.siteConfig.upsert({ where: { key: TICKET_TOPICS_KEY }, update: { value }, create: { key: TICKET_TOPICS_KEY, value } });
  return NextResponse.json({ success: true });
}

/** Removes the saved list so the standard questions return. */
export async function DELETE(req: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(req);
  if (!csrf.isValid) return csrf.errorResponse;
  await prisma.siteConfig.deleteMany({ where: { key: TICKET_TOPICS_KEY } });
  return NextResponse.json({ success: true });
}
