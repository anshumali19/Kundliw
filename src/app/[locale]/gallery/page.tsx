import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Image as ImageIcon } from "lucide-react";

interface GalleryPageProps {
  params: {
    locale: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params: { locale } }: GalleryPageProps): Promise<Metadata> {
  const isHindi = locale === "hi";
  return {
    title: isHindi
      ? "चित्र दीर्घा • महर्षि कणाद ज्योतिष केंद्र"
      : "Sanctum Gallery • Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "काशी दशाश्वमेध घाट ज्योतिष पीठ, पांडुलिपि संग्रह एवं वैदिक अनुष्ठान।"
      : "Visual archive of our sacred Varanasi sanctum, manuscripts, and astronomical observations.",
  };
}

export default async function GalleryPage({ params: { locale } }: GalleryPageProps) {
  const isHindi = locale === "hi";
  const items = await prisma.mediaGalleryItem.findMany({
    orderBy: { orderIndex: "asc" },
  });

  return (
    <div className="w-full min-h-[70vh] py-12 px-4 sm:px-6 max-w-6xl mx-auto text-left space-y-8">
      <div>
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <ImageIcon className="w-4 h-4" />
          <span>{isHindi ? "चित्र दीर्घा" : "Visual Archive"}</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-secondary mt-1">
          {isHindi ? "पीठ एवं पांडुलिपि दीर्घा" : "Sanctum & Astrological Archives"}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          {isHindi
            ? "दशाश्वमेध घाट वाराणसी स्थित केंद्र, हस्तलिखित पंचांग एवं वैदिक साधना।"
            : "Photographs of our Dashashwamedh Ghat center, handwritten ephemerides, and ritual ceremonies."}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="p-8 rounded-lg bg-surface border border-dashed border-outline-variant text-center text-xs text-outline">
          {isHindi ? "दीर्घा में वर्तमान में कोई चित्र उपलब्ध नहीं है।" : "No gallery images uploaded yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item) => {
            const title = isHindi ? item.titleHi : item.titleEn;
            const caption = isHindi ? item.captionHi : item.captionEn;

            return (
              <div
                key={item.id}
                className="bg-surface rounded-lg border border-outline-variant/40 overflow-hidden space-y-3 pb-3"
              >
                <div className="h-56 w-full bg-surface-container overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="px-4 space-y-1">
                  <h3 className="font-serif font-bold text-sm text-secondary">{title}</h3>
                  {caption && (
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {caption}
                    </p>
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
