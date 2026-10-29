import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { HERO_SLIDES_KEY, heroSlidesSchema, normalizeHeroSlides } from "@/lib/content/heroSlides";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  try {
    const row = await prisma.siteConfig.findUnique({ where: { key: HERO_SLIDES_KEY } });
    return NextResponse.json({ success: true, items: normalizeHeroSlides(row?.value) });
  } catch (error) {
    console.error("[API Admin HeroSlides GET]", error);
    return NextResponse.json({ error: "Failed to load hero slides." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const parsed = heroSlidesSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json({ error: `${first?.path.join(".") || "Slides"}: ${first?.message || "invalid"}` }, { status: 400 });
    }
    await prisma.siteConfig.upsert({
      where: { key: HERO_SLIDES_KEY },
      create: { key: HERO_SLIDES_KEY, value: parsed.data },
      update: { value: parsed.data },
    });
    return NextResponse.json({ success: true, items: parsed.data.items });
  } catch (error) {
    console.error("[API Admin HeroSlides PUT]", error);
    return NextResponse.json({ error: "Failed to save hero slides." }, { status: 500 });
  }
}
