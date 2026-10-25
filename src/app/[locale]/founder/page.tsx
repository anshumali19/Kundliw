import { pageAlternates } from "@/lib/seo";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { BookOpen, Calendar, ExternalLink, Video } from "lucide-react";

interface FounderPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(props: FounderPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const isHindi = locale === "hi";
  return {
    alternates: pageAlternates(locale, "/founder"),
    title: isHindi
      ? "संस्थापक परिचय | महर्षि कणाद ज्योतिष केंद्र"
      : "About the Founder | Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "महर्षि कणाद ज्योतिष केंद्र के संस्थापक का परिचय।"
      : "Background of the founder of Maharshi Kanad Jyotish Kendra.",
  };
}

export default async function FounderPage(props: FounderPageProps) {
  const { locale } = await props.params;
  const isHindi = locale === "hi";

  const founder = await prisma.founderProfile
    .findUnique({ where: { id: "default" } })
    .catch(() => null);

  // The database ships with template text. Treat it as "not filled in yet" so the public
  // page never shows placeholder or instruction text.
  const isConfigured =
    !!founder &&
    founder.isActive &&
    founder.nameEn.trim() !== "" &&
    founder.nameEn !== "Founder Name" &&
    !/admin panel/i.test(founder.bioEn) &&
    !/एडमिन/.test(founder.bioHi);

  const pageTitle = isHindi ? "संस्थापक परिचय" : "About the Founder";

  if (!isConfigured || !founder) {
    return (
      <div className="w-full min-h-[60vh] py-12 px-4 sm:px-6 lg:px-12 text-left max-w-4xl mx-auto space-y-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">{pageTitle}</h1>
        <div className="p-8 rounded-lg bg-surface border border-outline-variant/50 space-y-4">
          <p className="text-base text-on-surface-variant leading-relaxed">
            {isHindi
              ? "संस्थापक का परिचय शीघ्र ही यहाँ प्रकाशित किया जाएगा।"
              : "The founder's profile will be published here soon."}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded bg-primary-container hover:bg-primary text-on-primary text-sm uppercase tracking-wider font-bold border border-primary min-h-[44px] transition-colors"
          >
            {isHindi ? "संपर्क करें" : "Contact us"}
          </Link>
        </div>
      </div>
    );
  }

  const name = isHindi ? founder.nameHi || founder.nameEn : founder.nameEn;
  const designation = isHindi ? founder.designationHi : founder.designationEn;
  const role = isHindi ? founder.roleHi : founder.roleEn;
  const bio = isHindi ? founder.bioHi || founder.bioEn : founder.bioEn;
  const footerNote = isHindi ? founder.footerNoteHi : founder.footerNoteEn;

  const additionalLinks =
    (founder.additionalLinks as Array<{ labelEn: string; labelHi: string; url: string }> | null) || [];

  const isYoutube = !!founder.youtubeUrl && /youtube\.com|youtu\.be/.test(founder.youtubeUrl);
  const embedUrl = founder.youtubeUrl
    ? founder.youtubeUrl.includes("embed")
      ? founder.youtubeUrl
      : founder.youtubeUrl.replace("watch?v=", "embed/").split("&")[0]
    : null;

  return (
    <div className="w-full min-h-[75vh] py-10 px-4 sm:px-6 lg:px-12 text-left space-y-10 max-w-7xl mx-auto">
      <div className="border-b border-outline-variant/40 pb-6 space-y-2">
        <p className="text-xs font-bold text-primary uppercase tracking-widest">{pageTitle}</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary leading-tight">{name}</h1>
        {designation && <p className="text-base font-semibold text-primary">{designation}</p>}
        {role && <p className="text-sm text-on-surface-variant">{role}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-lg overflow-hidden border border-outline-variant/50 bg-surface">
            {founder.photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={founder.photoUrl} alt={name} className="w-full h-80 sm:h-96 object-cover object-top" />
            ) : (
              <div className="w-full h-80 sm:h-96 bg-surface-container flex items-center justify-center">
                <span className="w-24 h-24 rounded-full border-2 border-secondary/30 flex items-center justify-center font-serif text-4xl text-secondary bg-surface font-bold">
                  ॐ
                </span>
              </div>
            )}
            <div className="p-5 bg-surface-container-low border-t border-outline-variant/30">
              <Link
                href="/services"
                className="w-full py-3 px-4 rounded bg-primary-container hover:bg-primary text-on-primary font-bold text-sm uppercase tracking-wider border border-primary transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Calendar className="w-4 h-4" />
                <span>{isHindi ? "परामर्श बुक करें" : "Book a consultation"}</span>
              </Link>
            </div>
          </div>

          {embedUrl && (
            <div className="p-5 rounded-lg bg-surface border border-outline-variant/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider">
                <Video className="w-4 h-4 text-primary" />
                <span>{isHindi ? "वीडियो" : "Video"}</span>
              </div>
              <div className="aspect-video w-full rounded overflow-hidden bg-black border border-outline-variant/30">
                {isYoutube ? (
                  <iframe
                    src={embedUrl}
                    title={name}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm">
                    <a
                      href={founder.youtubeUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-tertiary-fixed underline flex items-center gap-1"
                    >
                      <span>{isHindi ? "वीडियो देखें" : "Watch video"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-lg bg-surface border border-outline-variant/40 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>{isHindi ? "परिचय" : "Background"}</span>
            </div>
            <div className="text-base leading-relaxed text-on-surface whitespace-pre-line">{bio}</div>
          </div>

          {additionalLinks.length > 0 && (
            <div className="p-5 rounded-lg bg-surface border border-outline-variant/40 space-y-3">
              <div className="text-xs font-bold text-secondary uppercase tracking-wider">
                {isHindi ? "अतिरिक्त लिंक" : "Related links"}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {additionalLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 transition-colors flex items-center justify-between text-sm text-on-surface min-h-[44px]"
                  >
                    <span className="font-medium">{isHindi ? link.labelHi : link.labelEn}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-on-surface-variant" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {footerNote && (
            <p className="p-5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface-variant leading-relaxed">
              {footerNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
