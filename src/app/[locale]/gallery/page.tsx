import { pageAlternates } from "@/lib/seo";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Image as ImageIcon, Play } from "lucide-react";
import { LinkList, YouTubeEmbed } from "@/components/content/MediaView";
import { isSafeImageSrc, isWebUrl, normalizeLinks } from "@/lib/content/media";

interface GalleryPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(props: GalleryPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const isHindi = locale === "hi";
  return {
    alternates: pageAlternates(locale, "/gallery"),
    title: isHindi
      ? "चित्र एवं वीडियो दीर्घा • महर्षि कणाद ज्योतिष केंद्र"
      : "Gallery • Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "महर्षि कणाद ज्योतिष केंद्र की तस्वीरें और वीडियो।"
      : "Photos and videos from Maharshi Kanad Jyotish Kendra.",
  };
}

export default async function GalleryPage(props: GalleryPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const isHindi = locale === "hi";
  const items = await prisma.mediaGalleryItem.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: "asc" },
  });

  return (
    <div className="w-full min-h-[70vh] py-10 px-4 sm:px-6 lg:px-12 text-left space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-outline-variant/30 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <ImageIcon className="w-4 h-4 text-primary" />
          <span>{isHindi ? "चित्र एवं वीडियो दीर्घा" : "Photos and videos"}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
          {isHindi ? "गैलरी" : "Gallery"}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-3xl">
          {isHindi
            ? "केंद्र से जुड़ी तस्वीरें और वीडियो।"
            : "Photos and videos from the Kendra."}
        </p>
      </div>

      {/* Grid of Media Items */}
      {items.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-dashed border-outline-variant text-center text-xs text-outline space-y-2">
          <ImageIcon className="w-8 h-8 mx-auto opacity-50" />
          <div>{isHindi ? "दीर्घा में वर्तमान में कोई चित्र अथवा वीडियो उपलब्ध नहीं है।" : "No gallery media published yet."}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const title = isHindi ? item.titleHi : item.titleEn;
            const caption = isHindi ? item.captionHi : item.captionEn;
            const isYouTube = item.mediaType === "YOUTUBE" && item.videoUrl;

            return (
              <div
                key={item.id}
                className="bg-surface rounded-2xl border border-outline-variant/40 overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
              >
                <div>
                  {isYouTube ? (
                    <div className="p-3">
                      <YouTubeEmbed url={item.videoUrl} title={title} isHindi={isHindi} />
                    </div>
                  ) : (
                    <div className="h-60 w-full bg-surface-container overflow-hidden relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={isSafeImageSrc(item.imageUrl) ? item.imageUrl : ""}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isWebUrl(item.videoUrl) && (
                        <a
                          href={item.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="p-3 rounded-full bg-brand text-on-brand shadow-lg">
                            <Play className="w-5 h-5 fill-current" />
                          </span>
                        </a>
                      )}
                    </div>
                  )}

                  <div className="p-5 space-y-2 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-serif font-bold text-sm sm:text-base text-secondary">
                        {title}
                      </h2>
                      {item.mediaType === "YOUTUBE" && (
                        <span className="px-2 py-0.5 rounded-full bg-red-600/10 text-on-error-container font-mono text-[10px] font-bold shrink-0">
                          Video
                        </span>
                      )}
                    </div>

                    {caption && (
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {caption}
                      </p>
                    )}
                  </div>
                </div>

                {(item.externalLink || normalizeLinks(item.additionalLinks).length > 0) && (
                  <div className="px-5 pb-4 pt-3 border-t border-outline-variant/20">
                    <LinkList
                      links={[
                        ...(isWebUrl(item.externalLink)
                          ? [{ labelEn: "View details", labelHi: "संबद्ध विवरण देखें", url: item.externalLink }]
                          : []),
                        ...normalizeLinks(item.additionalLinks),
                      ]}
                      isHindi={isHindi}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
