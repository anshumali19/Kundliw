import { RichText } from "@/components/content/RichText";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlocksView } from "@/components/content/MediaView";
import { normalizeBlocks } from "@/lib/content/media";
import { isCorePageSlug } from "@/lib/content/pages";

export const dynamic = "force-dynamic";

interface CustomPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

async function loadPage(slug: string) {
  // Built-in pages have their own routes; only custom pages are served here.
  if (isCorePageSlug(slug)) return null;
  const page = await prisma.staticPage.findUnique({ where: { slug } }).catch(() => null);
  return page && page.isActive ? page : null;
}

export async function generateMetadata(props: CustomPageProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const page = await loadPage(slug);
  if (!page) return { title: "Page not found" };
  const desc = (locale === "hi" ? page.metaDescHi || page.metaDescEn : page.metaDescEn || page.metaDescHi) || undefined;
  return {
    title: `${locale === "hi" ? page.titleHi : page.titleEn} • Maharshi Kanad Jyotish Kendra`,
    ...(desc ? { description: desc } : {}),
  };
}

export default async function CustomPage(props: CustomPageProps) {
  const { locale, slug } = await props.params;
  const isHindi = locale === "hi";
  const page = await loadPage(slug);
  if (!page) notFound();

  const title = isHindi ? page.titleHi : page.titleEn;
  const content = isHindi ? page.contentHi : page.contentEn;

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-left space-y-8">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary border-b border-outline-variant/30 pb-4">
        {title}
      </h1>
      <div className="leading-relaxed text-base text-on-surface space-y-3"><RichText text={content} /></div>
      <BlocksView blocks={normalizeBlocks(page.blocks)} isHindi={isHindi} />
    </div>
  );
}
