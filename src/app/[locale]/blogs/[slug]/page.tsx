import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { BookOpen, Calendar, ArrowLeft } from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(props: BlogPostPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale,
    slug
  } = params;

  const isHindi = locale === "hi";
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Article Not Found" };

  return {
    title: `${isHindi ? post.titleHi : post.titleEn} • Maharshi Kanad Jyotish Kendra`,
    description: (isHindi ? post.excerptHi : post.excerptEn) || undefined,
  };
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const params = await props.params;

  const {
    locale,
    slug
  } = params;

  const isHindi = locale === "hi";
  const post = await prisma.blogPost.findUnique({ where: { slug } });

  if (!post || (!post.isPublished && process.env.NODE_ENV === "production")) {
    notFound();
  }

  const title = isHindi ? post.titleHi : post.titleEn;
  const content = isHindi ? post.contentHi : post.contentEn;
  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(isHindi ? "hi-IN" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="w-full min-h-[70vh] py-12 px-4 sm:px-6 max-w-4xl mx-auto text-left space-y-8">
      <div>
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-outline hover:text-secondary uppercase tracking-wider mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isHindi ? "← सभी आलेख" : "← Back to Articles"}</span>
        </Link>

        {dateStr && (
          <div className="flex items-center gap-2 text-xs text-outline mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{dateStr}</span>
          </div>
        )}

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary leading-tight">
          {title}
        </h1>
      </div>

      {post.coverImage && (
        <div className="w-full h-72 sm:h-96 rounded-lg overflow-hidden bg-surface-container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6 sm:p-10 rounded-lg bg-surface border border-outline-variant/40 shadow-sm leading-relaxed whitespace-pre-line text-sm sm:text-base text-on-surface space-y-4">
        {content}
      </div>
    </div>
  );
}
