import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { isWebUrl } from "@/lib/content/media";
import { PAGE_DEMOS_KEY, PAGE_HELP } from "@/lib/admin/pageHelp";

const bodySchema = z.object({
  path: z.string().refine((p) => p in PAGE_HELP, "Unknown page."),
  url: z.string().trim().max(1000).refine((u) => u === "" || isWebUrl(u), "The demo needs a web address starting with https://"),
});

/** Saves (or removes, when empty) the demo shown on one admin page. */
export async function PUT(req: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(req);
  if (!csrf.isValid) return csrf.errorResponse;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 400 });

  const row = await prisma.siteConfig.findUnique({ where: { key: PAGE_DEMOS_KEY } });
  const map: Record<string, string> = row && typeof row.value === "object" && row.value && !Array.isArray(row.value) ? { ...(row.value as Record<string, string>) } : {};
  if (parsed.data.url) map[parsed.data.path] = parsed.data.url;
  else delete map[parsed.data.path];

  await prisma.siteConfig.upsert({ where: { key: PAGE_DEMOS_KEY }, update: { value: map }, create: { key: PAGE_DEMOS_KEY, value: map } });
  return NextResponse.json({ success: true });
}
