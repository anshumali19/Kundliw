import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { BookOpen, Calendar, ArrowRight } from "lucide-react";

interface BlogsPageProps {
  params: {
    locale: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params: { locale } }: BlogsPageProps): Promise<Metadata> {
  const isHindi = locale === "hi";
  return {
    title: isHindi
      ? "वैदिक ज्योतिष शोध एवं आलेख • महर्षि कणाद ज्योतिष केंद्र"
      : "Vedic Astrology Research & Articles • Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "सूर्य सिद्धान्त, दृग्गणित, ग्रह गोचर एवं षोडशवर्ग चक्रों पर प्रामाणिक आलेख।"
      : "Authentic treatises on mathematical astronomy, planetary transits, and Vedic chart harmonics.",
  };
}

export default async function BlogsPage({ params: { locale } }: BlogsPageProps) {
  const isHindi = locale === "hi";

  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full min-h-[70vh] py-12 px-4 sm:px-6 max-w-5xl mx-auto text-left space-y-8">
      <div>
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <BookOpen className="w-4 h-4" />
          <span>{isHindi ? "सिद्धांत एवं शोध पत्रिका" : "Vedic Treatises & Journal"}</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-secondary mt-1">
          {isHindi ? "वैदिक ज्योतिष आलेख व कालनिर्णय" : "Vedic Astrology Articles & Transit Insights"}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          {isHindi
            ? "अंधविश्वास से परे, विशुद्ध गणितीय गणना एवं शास्त्रीय ग्रंथों पर आधारित ज्ञान।"
            : "Rigorous scholarly analysis rooted in Surya Siddhanta and classical Vedic astrology."}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="p-8 rounded-lg bg-surface border border-dashed border-outline-variant text-center text-xs text-outline">
          {isHindi
            ? "वर्तमान में कोई आलेख प्रकाशित नहीं है। शीघ्र ही नए शोध निबंध प्रकाशित किए जाएंगे।"
            : "No published articles available at this time. New treatises will appear shortly."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => {
            const title = isHindi ? post.titleHi : post.titleEn;
            const excerpt = isHindi ? post.excerptHi || post.excerptEn : post.excerptEn;
            const dateStr = post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString(isHindi ? "hi-IN" : "en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : null;

            return (
              <article
                key={post.id}
                className="bg-surface rounded-lg border border-outline-variant/40 hover:border-secondary/40 transition-colors overflow-hidden flex flex-col justify-between"
              >
                {post.coverImage && (
                  <div className="h-44 w-full bg-surface-container overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImage}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {dateStr && (
                      <div className="flex items-center gap-1.5 text-[11px] text-outline">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateStr}</span>
                      </div>
                    )}
                    <h2 className="font-serif text-lg font-bold text-secondary leading-snug">
                      {title}
                    </h2>
                    {excerpt && (
                      <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                        {excerpt}
                      </p>
                    )}
                  </div>

                  <div className="pt-3">
                    <Link
                      href={`/blogs/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-wider"
                    >
                      <span>{isHindi ? "विस्तृत पढ़ें" : "Read Full Treatise"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
