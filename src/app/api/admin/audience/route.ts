import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { AUDIENCE_KEY, loadAudience, normalizeAudience, type AudienceKind } from "@/lib/audience";
import { HERO_SLIDES_KEY, normalizeHeroSlides } from "@/lib/content/heroSlides";
import { isCorePageSlug } from "@/lib/content/pages";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  title: string;
  /** a second line, for example the Hindi title */
  note?: string;
}

const cut = (s: string | null | undefined, n = 90) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

/** Every item the admin can choose a place for, by kind, with the choices saved so far. */
export async function GET() {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  try {
    const [services, other, offers, testimonials, blogs, faqs, gallery, marquee, banners, slides, pages, audience] = await Promise.all([
      prisma.service.findMany({ orderBy: { orderIndex: "asc" }, select: { id: true, titleEn: true, titleHi: true } }),
      prisma.otherService.findMany({ orderBy: { orderIndex: "asc" }, select: { id: true, titleEn: true, titleHi: true } }),
      prisma.offer.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, code: true, titleEn: true } }),
      prisma.testimonial.findMany({ orderBy: { orderIndex: "asc" }, select: { id: true, authorNameEn: true, quoteEn: true } }),
      prisma.blogPost.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, titleEn: true, titleHi: true } }),
      prisma.faqItem.findMany({ orderBy: { orderIndex: "asc" }, select: { id: true, questionEn: true } }),
      prisma.mediaGalleryItem.findMany({ orderBy: { orderIndex: "asc" }, select: { id: true, titleEn: true, mediaType: true } }),
      prisma.marqueeItem.findMany({ orderBy: { orderIndex: "asc" }, select: { id: true, textEn: true, position: true } }),
      prisma.banner.findMany({ orderBy: { orderIndex: "asc" }, select: { id: true, titleEn: true, position: true } }),
      prisma.siteConfig.findUnique({ where: { key: HERO_SLIDES_KEY } }).then((r) => normalizeHeroSlides(r?.value)),
      prisma.staticPage.findMany({ orderBy: { slug: "asc" }, select: { id: true, slug: true, titleEn: true, titleHi: true } }),
      loadAudience(),
    ]);

    const lists: Record<AudienceKind, Row[]> = {
      service: services.map((x) => ({ id: x.id, title: x.titleEn, note: x.titleHi })),
      otherService: other.map((x) => ({ id: x.id, title: x.titleEn, note: x.titleHi })),
      offer: offers.map((x) => ({ id: x.id, title: `${x.code} - ${cut(x.titleEn)}` })),
      testimonial: testimonials.map((x) => ({ id: x.id, title: x.authorNameEn, note: cut(x.quoteEn, 70) })),
      blog: blogs.map((x) => ({ id: x.id, title: x.titleEn, note: x.titleHi })),
      faq: faqs.map((x) => ({ id: x.id, title: cut(x.questionEn) })),
      gallery: gallery.map((x) => ({ id: x.id, title: cut(x.titleEn) || x.mediaType, note: x.mediaType })),
      marquee: marquee.map((x) => ({ id: x.id, title: cut(x.textEn), note: x.position })),
      banner: banners.map((x) => ({ id: x.id, title: x.titleEn, note: x.position })),
      slide: slides.map((x) => ({ id: x.id, title: cut(x.titleEn) || cut(x.titleHi) || x.id })),
      page: pages.filter((x) => !isCorePageSlug(x.slug)).map((x) => ({ id: x.id, title: x.titleEn, note: `/${x.slug}` })),
    };
    return NextResponse.json({ success: true, lists, audience });
  } catch (error) {
    console.error("[API Admin Audience GET] Error:", error);
    return NextResponse.json({ error: "Failed to load." }, { status: 500 });
  }
}

/** Saves where each item is shown. Body: { audience: { offer: { "<id>": "WEB" | "APP" }, ... } }. Items not listed are shown in both. */
export async function PUT(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;
  try {
    const body = (await request.json().catch(() => null)) as { audience?: unknown } | null;
    const audience = normalizeAudience(body?.audience);
    await prisma.siteConfig.upsert({
      where: { key: AUDIENCE_KEY },
      create: { key: AUDIENCE_KEY, value: audience as object },
      update: { value: audience as object },
    });
    return NextResponse.json({ success: true, audience });
  } catch (error) {
    console.error("[API Admin Audience PUT] Error:", error);
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }
}
