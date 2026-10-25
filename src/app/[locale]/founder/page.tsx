import { pageAlternates } from "@/lib/seo";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import {
  Award,
  BookOpen,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Video,
  Star,
  Sparkles,
} from "lucide-react";

interface FounderPageProps {
  params: {
    locale: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params: { locale } }: FounderPageProps): Promise<Metadata> {
  const isHindi = locale === "hi";
  return {
    alternates: pageAlternates(locale, "/founder"),
    title: isHindi
      ? "संस्थापक एवं दैवज्ञ परंपरा • महर्षि कणाद ज्योतिष केंद्र"
      : "Founder Lineage • Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "शास्त्रसम्मत सिद्धांत ज्योतिष परंपरा, वैदिक अनुभव एवं संस्थापक परिचय।"
      : "Scholarly Vedic astrology lineage and background of the founder.",
  };
}

export default async function FounderPage({ params: { locale } }: FounderPageProps) {
  const isHindi = locale === "hi";

  const founder = await prisma.founderProfile
    .findUnique({ where: { id: "default" } })
    .catch(() => null);

  const fallbackPage = !founder
    ? await prisma.staticPage.findUnique({ where: { slug: "founder" } }).catch(() => null)
    : null;

  const name = isHindi
    ? founder?.nameHi || fallbackPage?.titleHi || "संस्थापक का नाम"
    : founder?.nameEn || fallbackPage?.titleEn || "Founder Name";

  const designation = isHindi
    ? founder?.designationHi || "संस्थापक एवं मुख्य ज्योतिषाचार्य"
    : founder?.designationEn || "Founder & Chief Astrologer";

  const role = isHindi
    ? founder?.roleHi || "वैदिक ज्योतिष मार्गदर्शन एवं दिशा-निर्देशन"
    : founder?.roleEn || "Vedic Astrological Guidance & Direction";

  const bio = isHindi
    ? founder?.bioHi ||
      fallbackPage?.contentHi ||
      "केंद्र के संस्थापक का विस्तृत परिचय, शास्त्रीय पृष्ठभूमि एवं अनुभव एडमिन पैनल से संपादन योग्य है।"
    : founder?.bioEn ||
      fallbackPage?.contentEn ||
      "Detailed background, credentials, and astrological experience of the founder are fully editable via the Admin Panel.";

  const footerNote = isHindi
    ? founder?.footerNoteHi ||
      "नोट: समस्त परामर्श शास्त्रसम्मत दक्षिणा पद्धति से संपन्न होते हैं। केंद्र पर किसी भी प्रकार के अंधविश्वास, भय अथवा मिथ्या दावों का पूर्ण निषेध है।"
    : founder?.footerNoteEn ||
      "Note: Consultations follow the traditional Dakshina code. No black magic, fear-mongering, or misleading claims are entertained at the Kendra.";

  const additionalLinks = (founder?.additionalLinks as Array<{
    labelEn: string;
    labelHi: string;
    url: string;
  }>) || [];

  return (
    <div className="w-full min-h-[75vh] py-10 px-4 sm:px-6 lg:px-12 text-left space-y-10 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="border-b border-outline-variant/40 pb-6 space-y-3">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <Award className="w-4 h-4 text-primary" />
          <span>{isHindi ? "संस्थापक दैवज्ञ परंपरा" : "Founder Lineage & Scholarly Background"}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary leading-tight">
          {name}
        </h1>
        <p className="text-sm sm:text-base font-semibold text-primary">
          {designation}
        </p>
        <p className="text-xs sm:text-sm text-on-surface-variant italic">
          {role}
        </p>
      </div>

      {/* Main Two-Column Broadsheet Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Photo, Direct Consultation CTA & Video */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl overflow-hidden border border-outline-variant/50 bg-surface shadow-sm">
            {founder?.photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={founder.photoUrl}
                alt={name}
                className="w-full h-80 sm:h-96 object-cover object-top"
              />
            ) : (
              <div className="w-full h-80 sm:h-96 bg-surface-container flex flex-col items-center justify-center text-center p-6 space-y-3">
                <span className="w-20 h-20 rounded-full border-2 border-secondary/30 flex items-center justify-center font-serif text-3xl text-secondary bg-surface font-bold">
                  ॐ
                </span>
                <span className="font-serif text-xl font-bold text-secondary">{name}</span>
                <span className="text-xs text-on-surface-variant max-w-xs">{designation}</span>
              </div>
            )}

            <div className="p-5 bg-surface-container-low border-t border-outline-variant/30 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>{isHindi ? "काशी विद्वत् परिषद एवं शास्त्रीय निष्ठा" : "Kashi Scholarly Council Certified"}</span>
              </div>

              <Link
                href="/booking"
                className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-semibold text-xs sm:text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>{isHindi ? "प्रत्यक्ष परामर्श बुक करें" : "Book Direct Consultation"}</span>
              </Link>
            </div>
          </div>

          {/* YouTube Video Section if configured */}
          {founder?.youtubeUrl && (
            <div className="p-5 rounded-2xl bg-surface border border-outline-variant/40 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider">
                <Video className="w-4 h-4 text-primary" />
                <span>{isHindi ? "संस्थापक व्याख्यान / वीडियो" : "Founder Video Discourse"}</span>
              </div>
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-outline-variant/30">
                {founder.youtubeUrl.includes("youtube.com") || founder.youtubeUrl.includes("youtu.be") ? (
                  <iframe
                    src={
                      founder.youtubeUrl.includes("embed")
                        ? founder.youtubeUrl
                        : founder.youtubeUrl.replace("watch?v=", "embed/").split("&")[0]
                    }
                    title="Founder Video"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-on-surface-variant">
                    <a
                      href={founder.youtubeUrl}
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
            </div>
          )}
        </div>

        {/* Right Column: Biography, Scholarly Pillars & Additional Links */}
        <div className="lg:col-span-7 space-y-8">
          {/* Biography */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-outline-variant/40 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>{isHindi ? "जीवन दर्शन एवं दैवज्ञ यात्रा" : "Philosophy and Background"}</span>
            </div>
            <div className="text-sm sm:text-base leading-relaxed text-on-surface whitespace-pre-line space-y-4">
              {bio}
            </div>
          </div>

          {/* Canonical Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1">
              <Sparkles className="w-4 h-4 text-primary mb-1" />
              <div className="font-serif font-bold text-xs text-secondary">
                {isHindi ? "सूर्य सिद्धान्त" : "Surya Siddhanta"}
              </div>
              <p className="text-[11px] text-on-surface-variant">
                {isHindi ? "विशुद्ध दृग्गणित एवं खगोलीय चक्र" : "Pure mathematical ephemeris"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1">
              <Star className="w-4 h-4 text-primary mb-1" />
              <div className="font-serif font-bold text-xs text-secondary">
                {isHindi ? "बृहत् पराशर होरा" : "Parashara Hora"}
              </div>
              <p className="text-[11px] text-on-surface-variant">
                {isHindi ? "षोडशवर्ग एवं विंशोत्तरी दशा" : "16 divisional charts analysis"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1">
              <ShieldCheck className="w-4 h-4 text-primary mb-1" />
              <div className="font-serif font-bold text-xs text-secondary">
                {isHindi ? "नैतिक संहिता" : "Ethical Code"}
              </div>
              <p className="text-[11px] text-on-surface-variant">
                {isHindi ? "भयमुक्त एवं कल्याणकारी परामर्श" : "Fear-free truth-based guidance"}
              </p>
            </div>
          </div>

          {/* Additional Links & Affiliations */}
          {additionalLinks.length > 0 && (
            <div className="p-5 rounded-2xl bg-surface border border-outline-variant/40 space-y-3">
              <div className="text-xs font-bold text-secondary uppercase tracking-wider">
                {isHindi ? "संबद्ध संस्थान एवं अतिरिक्त संदर्भ" : "Affiliated Portals & References"}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {additionalLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 transition-all flex items-center justify-between text-xs text-on-surface group"
                  >
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {isHindi ? link.labelHi : link.labelEn}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Footer Note Card */}
          {footerNote && (
            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs sm:text-sm text-on-surface space-y-1">
              <div className="font-semibold text-amber-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>{isHindi ? "केंद्र की आचार संहिता" : "Sanctum Code of Ethics"}</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {footerNote}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
