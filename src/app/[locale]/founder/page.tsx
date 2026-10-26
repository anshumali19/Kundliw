import { RichText } from "@/components/content/RichText";
import { pageAlternates } from "@/lib/seo";
import { BlocksView, LinkList, YouTubeEmbed } from "@/components/content/MediaView";
import { isSafeImageSrc, normalizeBlocks, normalizeLinks } from "@/lib/content/media";
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
            className="inline-flex items-center gap-2 px-5 py-3 rounded bg-brand hover:bg-brand-hover text-on-brand text-sm uppercase tracking-wider font-bold border border-primary min-h-[44px] transition-colors"
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

  const additionalLinks = normalizeLinks(founder.additionalLinks);
  const blocks = normalizeBlocks(founder.blocks);

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
            {isSafeImageSrc(founder.photoUrl) ? (
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
                className="w-full py-3 px-4 rounded bg-brand hover:bg-brand-hover text-on-brand font-bold text-sm uppercase tracking-wider border border-primary transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Calendar className="w-4 h-4" />
                <span>{isHindi ? "परामर्श बुक करें" : "Book a consultation"}</span>
              </Link>
            </div>
          </div>

          {founder.youtubeUrl && (
            <div className="p-5 rounded-lg bg-surface border border-outline-variant/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider">
                <Video className="w-4 h-4 text-primary" />
                <span>{isHindi ? "वीडियो" : "Video"}</span>
              </div>
              <YouTubeEmbed url={founder.youtubeUrl} title={name} isHindi={isHindi} />
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-lg bg-surface border border-outline-variant/40 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>{isHindi ? "परिचय" : "Background"}</span>
            </div>
            <div className="text-base leading-relaxed text-on-surface space-y-3"><RichText text={bio} /></div>
          </div>

          {additionalLinks.length > 0 && (
            <div className="p-5 rounded-lg bg-surface border border-outline-variant/40">
              <LinkList
                links={additionalLinks}
                isHindi={isHindi}
                heading={isHindi ? "अतिरिक्त लिंक" : "Related links"}
              />
            </div>
          )}

          <BlocksView blocks={blocks} isHindi={isHindi} />

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
