import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/siteConfig/service";
import { SECTIONS, normalizeSection, normalizeSocial } from "@/lib/siteConfig/definitions";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  try {
    return NextResponse.json({ success: true, ...(await getSiteConfig()) });
  } catch (error) {
    console.error("[API Admin SiteConfig GET] Error:", error);
    return NextResponse.json({ error: "Failed to load settings." }, { status: 500 });
  }
}

/** Saves one section: { section: "seo", values: {...} } or { section: "social", values: { items: [...] } }. */
export async function PUT(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const body = (await request.json()) as { section?: string; values?: unknown };
    const id = String(body.section || "");

    let value: unknown;
    if (id === "social") {
      const r = normalizeSocial(body.values);
      if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
      value = { items: r.items };
    } else {
      const def = SECTIONS.find((s) => s.id === id);
      if (!def) return NextResponse.json({ error: "Unknown section." }, { status: 400 });
      const r = normalizeSection(def, body.values);
      if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
      value = r.values;
    }

    await prisma.siteConfig.upsert({
      where: { key: id },
      create: { key: id, value: value as object },
      update: { value: value as object },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Admin SiteConfig PUT] Error:", error);
    return NextResponse.json({ error: "Failed to save settings." }, { status: 500 });
  }
}
