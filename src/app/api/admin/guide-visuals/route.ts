import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { demosInputSchema } from "@/lib/content/demos";
import { GUIDE_SLUGS } from "@/lib/guides/defaults";
import { guideVisualsKey } from "@/lib/guides/visuals";

const bodySchema = z.object({
  slug: z.enum(GUIDE_SLUGS as [string, ...string[]]),
  visuals: demosInputSchema.refine((list) => list.every((d) => d.kind === "image" || d.kind === "video"), "Only pictures and videos can be added to a guide."),
});

/** Saves the pictures and videos shown with one guide. */
export async function PUT(req: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(req);
  if (!csrf.isValid) return csrf.errorResponse;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 400 });

  const key = guideVisualsKey(parsed.data.slug as "user" | "associate" | "admin");
  await prisma.siteConfig.upsert({ where: { key }, update: { value: parsed.data.visuals }, create: { key, value: parsed.data.visuals } });
  return NextResponse.json({ success: true });
}
