import { pageAlternates } from "@/lib/seo";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SubPageNav } from "@/components/layout/SubPageNav";
import {
  Compass,
  ExternalLink,
  Video,
  Sparkles,
  MapPin,
  Heart,
  Youtube,
  Globe,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const isHindi = locale === "hi";
  return {
    alternates: pageAlternates(locale, "/other-services"),
    title: isHindi
      ? "अन्य धार्मिक एवं आध्यात्मिक सेवाएँ • महर्षि कणाद ज्योतिष केंद्र"
      : "Other Vedic & Allied Services • Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "भारत दर्शन तीर्थ यात्रा, वैदिक विवाह संस्कार एवं धार्मिक वीडियो प्रवचन।"
      : "Bharat Darshan Teerth Yatra, Vedic Matrimonial Services, and Astrological Video Discourses.",
  };
}

export default async function OtherServicesPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const isHindi = locale === "hi";

  const dbItems = await prisma.otherService
    .findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
    })
    .catch(() => []);

  // Canonical baseline items if none seeded in DB yet (#13)
  const defaultItems = [
    {
      id: "teerth-yatra",
      slug: "bharat-darshan-teerth-yatra",
      titleEn: "Bharat Darshan Teerth Yatra & Pilgrimage",
      titleHi: "भारत दर्शन तीर्थ यात्रा एवं पावन धाम दर्शन",
      taglineEn: "Sacred Pilgrimage Guided by Vedic Scholars",
      taglineHi: "विद्वानों के सानिध्य में शास्त्रसम्मत तीर्थ यात्रा",
      descriptionEn:
        "Comprehensive sacred pilgrimage coordination covering Kashi Vishwanath, Prayagraj Triveni Sangam, Ayodhya Ram Mandir, Vindhyachal Dham, and Gaya Shraddha Tarpana. Daily Sankalpa, temple pujas, and comfortable lodging arranged with reverence.",
      descriptionHi:
        "काशी विश्वनाथ, प्रयागराज त्रिवेणी संगम, अयोध्या श्रीराम जन्मभूमि, विंध्याचल शक्तिपीठ एवं गया श्राद्ध तर्पण हेतु शास्त्रसम्मत तीर्थ यात्रा का आयोजन। विद्वान ब्राह्मणों द्वारा नित्य संकल्प, दर्शन एवं सुगम व्यवस्था।",
      imageUrl: "/images/gallery-1.jpg",
      actionUrl: "https://kanadjyotishkendra.vercel.app/contact",
      actionTextEn: "Enquire About Yatra Schedule",
      actionTextHi: "यात्रा विवरण एवं तिथियों की जानकारी लें",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      id: "matrimonial",
      slug: "vindhya-vivah-sanskar",
      titleEn: "Vedic Matrimonial Services (Vindhya Vivah Sanskar)",
      titleHi: "वैदिक वैवाहिक संस्कार (विंध्य विवाह संस्कार)",
      taglineEn: "Affiliated Matrimonial & Gotra Alliance Portal",
      taglineHi: "संस्कारयुक्त परिवार एवं शुद्ध गोत्र मिलान",
      descriptionEn:
        "Authentic Vedic matrimonial matchmaking backed by 36-Guna Ashtakoot chart synchronization, Gotra verification, and spiritual family counseling through our sister portal Vindhya Vivah Sanskar.",
      descriptionHi:
        "शास्त्रसम्मत ३६ गुण मिलान, कुलीन गोत्र परीक्षा एवं पारिवारिक समन्वय पर आधारित विश्वसनीय वैवाहिक मंच। हमारे सहयोगी संस्थान विंध्य विवाह संस्कार के माध्यम से संस्कारी परिवारों का परस्पर मिलन।",
      imageUrl: "/images/gallery-2.jpg",
      actionUrl: "https://vindhyavivahsanskar.com",
      actionTextEn: "Visit Vindhya Vivah Sanskar Portal",
      actionTextHi: "विंध्य विवाह संस्कार पोर्टल पर जाएं",
      youtubeUrl: null,
    },
    {
      id: "youtube-discourses",
      slug: "vedic-astrology-discourses",
      titleEn: "Vedic Astrology Discourses & Video Lectures",
      titleHi: "धार्मिक व्याख्यान एवं ज्योतिष वीडियो प्रवचन",
      taglineEn: "Classical Wisdom from Dashashwamedh Sanctum",
      taglineHi: "काशी दशाश्वमेध घाट से शास्त्रीय ज्ञान",
      descriptionEn:
        "Watch authenticated lectures on planetary transits (Gochar), Sade Sati remedies, solar and lunar eclipse muhurtas, and ephemeris calculation methodology on our dedicated spiritual channels.",
      descriptionHi:
        "ग्रह गोचर प्रभाव, साढ़ेसाती शांति उपाय, सूर्य-चन्द्र ग्रहण काल एवं पंचांग गणित की सूक्ष्म गणनाओं पर दैवज्ञों के प्रामाणिक वीडियो व्याख्यान देखें।",
      imageUrl: "/images/gallery-3.jpg",
      actionUrl: "https://www.youtube.com",
      actionTextEn: "Explore YouTube Video Channel",
      actionTextHi: "यूट्यूब चैनल पर व्याख्यान देखें",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
  ];

  const items = dbItems.length > 0 ? dbItems : defaultItems;

  return (
    <div className="w-full flex flex-col text-on-surface text-left">
      {/* 1. Universal Back/Next Navigation Bar (#45) */}
      <SubPageNav
        breadcrumbs={[{ label: isHindi ? "अन्य सेवाएँ" : "Other Services" }]}
        backHref="/services"
        backLabel={isHindi ? "मुख्य सेवाएँ" : "Main Services"}
        nextHref="/kundli/astrosage"
        nextLabel={isHindi ? "एस्ट्रोसेज सॉफ्टवेयर" : "AstroSage Tool"}
        locale={locale}
      />

      {/* 2. Page Header */}
      <section className="w-full bg-surface border-b border-outline-variant/30 py-8 px-4 sm:px-8 lg:px-12 text-left">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold">
            <Sparkles className="w-4 h-4" />
            <span>{isHindi ? "संबद्ध आध्यात्मिक प्रकल्प (#13)" : "Allied Spiritual Initiatives (#13)"}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
            {isHindi ? "अन्य सेवाएँ एवं सहयोगी प्रकल्प" : "Other Services & Allied Projects"}
          </h1>

          <p className="text-sm text-on-surface-variant leading-relaxed">
            {isHindi
              ? "महर्षि कणाद ज्योतिष केंद्र के अंतर्गत संचालित तीर्थ यात्रा, वैवाहिक संस्कार मंच एवं धार्मिक व्याख्यान चैनल।"
              : "Explore our pilgrimage services, matrimonial alliances portal, and authenticated spiritual discourse channels."}
          </p>
        </div>
      </section>

      {/* 3. Items Cards & Video Grid */}
      <section className="w-full py-10 px-4 sm:px-8 lg:px-12 bg-surface-container-low/40">
        <div className="space-y-8 max-w-7xl mx-auto">
          {items.map((item, idx) => {
            const title = isHindi ? item.titleHi : item.titleEn;
            const tagline = isHindi ? item.taglineHi : item.taglineEn;
            const description = isHindi ? item.descriptionHi : item.descriptionEn;
            const actionText = isHindi ? item.actionTextHi : item.actionTextEn;

            return (
              <div
                key={item.id || idx}
                className="bg-surface rounded-2xl border border-outline-variant/50 p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row gap-8 items-start"
              >
                {/* Left/Main Column: Text & Outbound CTA */}
                <div className="flex-1 space-y-4 text-left">
                  <div className="space-y-1">
                    {tagline && (
                      <span className="text-xs uppercase tracking-wider text-primary font-bold">
                        {tagline}
                      </span>
                    )}
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">
                      {title}
                    </h2>
                  </div>

                  <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {description}
                  </p>

                  {item.actionUrl && (
                    <div className="pt-2">
                      <a
                        href={item.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors font-semibold text-xs shadow-sm"
                      >
                        <span>{actionText || (isHindi ? "पोर्टल पर जाएं" : "Visit Portal")}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Right Column: YouTube Video Embed or Image (#13, #47) */}
                <div className="w-full lg:w-96 shrink-0 space-y-3">
                  {item.youtubeUrl ? (
                    <div className="rounded-xl overflow-hidden border border-outline-variant/40 bg-black aspect-video shadow-xs">
                      {item.youtubeUrl.includes("youtube.com") || item.youtubeUrl.includes("youtu.be") ? (
                        <iframe
                          src={
                            item.youtubeUrl.includes("embed")
                              ? item.youtubeUrl
                              : item.youtubeUrl.replace("watch?v=", "embed/").split("&")[0]
                          }
                          title={title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-on-surface-variant">
                          <a
                            href={item.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline flex items-center gap-1"
                          >
                            <span>{isHindi ? "वीडियो देखें" : "Watch Video"}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  ) : item.imageUrl ? (
                    <div className="rounded-xl overflow-hidden border border-outline-variant/40 aspect-video bg-surface-container shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-secondary/20 bg-surface-container-low aspect-video flex items-center justify-center font-serif text-3xl text-secondary font-bold">
                      ॐ
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
