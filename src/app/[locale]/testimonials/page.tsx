import { setRequestLocale } from "next-intl/server";
import { stripRich } from "@/lib/content/richText";
import { pageAlternates } from "@/lib/seo";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Star, ShieldCheck, MessageSquare } from "lucide-react";
import { LinkList, YouTubeEmbed } from "@/components/content/MediaView";
import { isSafeImageSrc, normalizeLinks } from "@/lib/content/media";

interface TestimonialsPageProps {
  params: Promise<{
    locale: string;
  }>;
}


export async function generateMetadata(props: TestimonialsPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const isHindi = locale === "hi";
  return {
    alternates: pageAlternates(locale, "/testimonials"),
    title: isHindi
      ? "ग्राहक अनुभव एवं संस्तुतियाँ • महर्षि कणाद ज्योतिष केंद्र"
      : "Client Experiences & Testimonials • Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "महर्षि कणाद ज्योतिष केंद्र के ग्राहकों के अनुभव और समीक्षाएँ, कुंडली, परामर्श और पूजा सेवाओं के बारे में।"
      : "Client feedback and reviews for Maharshi Kanad Jyotish Kendra on Kundli, consultation and puja services.",
  };
}

export default async function TestimonialsPage(props: TestimonialsPageProps) {
  const params = await props.params;
  setRequestLocale(params.locale);

  const {
    locale
  } = params;

  const isHindi = locale === "hi";
  const testimonials = await prisma.testimonial.findMany({
    where: { isActive: true, isVerified: true },
    orderBy: { orderIndex: "asc" },
  });

  return (
    <div className="w-full min-h-[70vh] py-12 px-4 sm:px-8 lg:px-12 text-left space-y-8">
      <div>
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <MessageSquare className="w-4 h-4" />
          <span>{isHindi ? "परामर्शार्थी संस्तुतियाँ" : "Client Testimonials"}</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-secondary mt-1">
          {isHindi ? "अनुभव एवं विश्वास" : "Testimonials & Experiences"}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          {isHindi
            ? "हमारी सेवाएँ लेने वाले ग्राहकों के अनुभव।"
            : "Feedback from clients who have used our services."}
        </p>
      </div>

      {testimonials.length === 0 ? (
        <div className="p-8 rounded-lg bg-surface border border-dashed border-outline-variant text-center text-xs text-outline">
          {isHindi ? "वर्तमान में कोई संस्तुति उपलब्ध नहीं है।" : "Client feedback will be shown here soon."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => {
            const author = isHindi ? t.authorNameHi : t.authorNameEn;
            const title = isHindi ? t.authorTitleHi : t.authorTitleEn;
            const city = isHindi ? t.cityHi : t.cityEn;
            const quote = isHindi ? t.quoteHi : t.quoteEn;

            return (
              <div
                key={t.id}
                className="p-6 rounded-lg bg-surface border border-outline-variant/40 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-primary">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm italic text-on-surface leading-relaxed">
                    &ldquo;{stripRich(quote)}&rdquo;
                  </p>
                  <YouTubeEmbed url={t.youtubeUrl} title={author} isHindi={isHindi} />
                  <LinkList links={normalizeLinks(t.additionalLinks)} isHindi={isHindi} />
                </div>

                <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isSafeImageSrc(t.photoUrl) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.photoUrl}
                        alt={author}
                        loading="lazy"
                        className="w-12 h-12 rounded-full object-cover border border-outline-variant/60"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-xs text-secondary">{author}</h3>
                      <p className="text-[11px] text-outline">
                        {title} • {city}
                      </p>
                    </div>
                  </div>

                  {t.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{isHindi ? "सत्यापित ग्राहक" : "Verified Client"}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
