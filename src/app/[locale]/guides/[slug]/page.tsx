import { RichText } from "@/components/content/RichText";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAdmin } from "@/lib/auth/guards";
import { DEFAULT_GUIDES, GUIDE_SLUGS, guidePageSlug, type GuideSlug } from "@/lib/guides/defaults";
import { PrintButton } from "@/components/ui/PrintButton";
import { loadGuideVisuals } from "@/lib/guides/visuals";
import { YouTubeEmbed } from "@/components/content/MediaView";
import { isSafeImageSrc } from "@/lib/content/media";

export const dynamic = "force-dynamic";

interface GuidePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata(props: GuidePageProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const guide = DEFAULT_GUIDES[slug as GuideSlug];
  return {
    title: guide ? (locale === "hi" ? guide.titleHi : guide.titleEn) : "Guide",
    robots: { index: false, follow: false },
  };
}

export default async function GuidePage(props: GuidePageProps) {
  const { locale, slug } = await props.params;
  if (!GUIDE_SLUGS.includes(slug as GuideSlug)) notFound();
  const guideSlug = slug as GuideSlug;
  const isHindi = locale === "hi";

  // The Admin guide is for administrators only; the Associate guide for associates and admins.
  if (guideSlug === "admin") {
    await requireAdmin(`/guides/admin`, locale);
  } else if (guideSlug === "associate") {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ASSOCIATE && user.role !== Role.ADMIN)) {
      notFound();
    }
  }

  const stored = await prisma.staticPage.findUnique({ where: { slug: guidePageSlug(guideSlug) } }).catch(() => null);
  const fallback = DEFAULT_GUIDES[guideSlug];
  const title = isHindi ? stored?.titleHi || fallback.titleHi : stored?.titleEn || fallback.titleEn;
  const content = isHindi ? stored?.contentHi || fallback.contentHi : stored?.contentEn || fallback.contentEn;

  const visuals = await loadGuideVisuals(guideSlug);

  return (
    <article className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 text-left">
      <header className="border-b border-outline-variant/40 pb-4 mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            {isHindi ? "महर्षि कणाद ज्योतिष केंद्र" : "Maharshi Kanad Jyotish Kendra"}
          </p>
          <h1 className="font-serif text-3xl font-bold text-secondary mt-1">{title}</h1>
        </div>
        <PrintButton label={isHindi ? "प्रिंट / PDF सहेजें" : "Print / Save as PDF"} />
      </header>
      <div className="leading-relaxed text-base text-on-surface space-y-3"><RichText text={content} /></div>
      {visuals.length > 0 && (
        <div className="mt-8 space-y-6">
          {visuals.map((v, i) => {
            const caption = (isHindi ? v.labelHi || v.labelEn : v.labelEn || v.labelHi) || "";
            return (
              <figure key={i} className="space-y-2">
                {v.kind === "image" && isSafeImageSrc(v.url) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.url} alt={caption} loading="lazy" className="w-full rounded-lg border border-outline-variant/40" />
                ) : v.kind === "video" ? (
                  <YouTubeEmbed url={v.url} title={caption || "Guide video"} isHindi={isHindi} />
                ) : null}
                {caption && <figcaption className="text-sm text-on-surface-variant">{caption}</figcaption>}
              </figure>
            );
          })}
        </div>
      )}
    </article>
  );
}
