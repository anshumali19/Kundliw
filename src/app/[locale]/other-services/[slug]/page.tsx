import { notFound } from "next/navigation";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ExternalLink, Facebook, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { pageAlternates } from "@/lib/seo";
import { RichText } from "@/components/content/RichText";
import { LinkList, YouTubeEmbed } from "@/components/content/MediaView";
import { PackageDetails } from "@/features/services/components/PackageDetails";
import { SubPageNav } from "@/components/layout/SubPageNav";
import { isSafeImageSrc, normalizeLinks } from "@/lib/content/media";

type Props = { params: Promise<{ locale: string; slug: string }> };

const OLD_DEFAULT_BUTTON = "Visit Portal / Learn More";

async function load(slug: string) {
  return prisma.otherService.findFirst({ where: { slug, isActive: true } }).catch(() => null);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const item = await load(slug);
  if (!item) return {};
  const isHindi = locale === "hi";
  return {
    alternates: pageAlternates(locale, `/other-services/${slug}`),
    title: `${isHindi ? item.titleHi : item.titleEn} • Maharshi Kanad Jyotish Kendra`,
    description: (isHindi ? item.descriptionHi : item.descriptionEn).slice(0, 160),
  };
}

export default async function OtherServiceDetailPage(props: Props) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const item = await load(slug);
  if (!item) notFound();

  const isHindi = locale === "hi";
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const title = isHindi ? item.titleHi : item.titleEn;
  const heading = isHindi ? item.taglineHi : item.taglineEn;
  const nature = isHindi ? item.natureHi || item.natureEn : item.natureEn || item.natureHi;
  const description = isHindi ? item.descriptionHi : item.descriptionEn;
  const savedText = isHindi ? item.actionTextHi : item.actionTextEn;
  const bookText = savedText && savedText !== OLD_DEFAULT_BUTTON && !savedText.startsWith("पोर्टल पर जाएं") ? savedText : t("Book Now", "अभी बुक करें");
  const bookable = item.serviceSlug
    ? !!(await prisma.service.findFirst({ where: { slug: item.serviceSlug, isActive: true }, select: { id: true } }).catch(() => null))
    : false;

  const btn = "inline-flex min-h-[48px] items-center justify-center gap-2 rounded bg-brand px-6 text-xs font-bold uppercase tracking-wider text-on-brand hover:bg-brand-hover";
  const btnGhost = "inline-flex min-h-[48px] items-center justify-center gap-2 rounded border border-outline-variant px-5 text-xs font-bold uppercase tracking-wider text-secondary hover:bg-surface-container-high";

  return (
    <div className="w-full flex flex-col text-left text-on-surface">
      <SubPageNav
        breadcrumbs={[{ label: t("Other Services", "अन्य सेवाएँ"), href: "/other-services" }, { label: title }]}
        backHref="/other-services"
        backLabel={t("All other services", "सभी अन्य सेवाएँ")}
        nextHref="/services"
        nextLabel={t("Main Services", "मुख्य सेवाएँ")}
        locale={locale}
      />

      <section className="w-full bg-surface px-4 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-3">
            {heading && <span className="text-xs font-bold uppercase tracking-wider text-primary">{heading}</span>}
            <h1 className="font-serif text-3xl font-bold text-secondary sm:text-4xl">{title}</h1>
            {nature && (
              <p className="text-sm">
                <span className="font-bold text-secondary">{t("Nature of service: ", "सेवा का स्वरूप: ")}</span>
                {nature}
              </p>
            )}
            <div className="space-y-2 text-sm leading-relaxed text-on-surface-variant">
              <RichText text={description} />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {item.actionUrl && (
                <a href={item.actionUrl} target="_blank" rel="noopener noreferrer" className={btn}>
                  {bookText} <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {bookable && (
                <Link href={`/services/${item.serviceSlug}` as never} className={btnGhost}>
                  {t("See packages, plans & book", "पैकेज, प्लान व बुकिंग देखें")}
                </Link>
              )}
              {item.youtubeUrl && (
                <a href="#video" className={btnGhost}>
                  {t("Watch Video", "वीडियो देखें")}
                </a>
              )}
              {item.facebookUrl && (
                <a href={item.facebookUrl} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                  <Facebook className="h-4 w-4" aria-hidden="true" /> Facebook
                </a>
              )}
              {item.whatsappGroupUrl && (
                <a href={item.whatsappGroupUrl} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> {t("WhatsApp group", "व्हाट्सएप ग्रुप")}
                </a>
              )}
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            {isSafeImageSrc(item.imageUrl) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt={title} className="w-full rounded-xl border border-outline-variant/40 object-cover" />
            )}
            <div id="video" className="scroll-mt-24">
              <YouTubeEmbed url={item.youtubeUrl} title={title} isHindi={isHindi} />
            </div>
            <LinkList links={normalizeLinks(item.additionalLinks)} isHindi={isHindi} />
          </div>
        </div>

        <div className="mx-auto max-w-6xl">
          <PackageDetails
            isHindi={isHindi}
            pkg={{
              id: item.id,
              titleEn: "Programme",
              titleHi: "कार्यक्रम",
              numberOfDays: item.numberOfDays,
              startDate: item.startDate?.toISOString() ?? null,
              endDate: item.endDate?.toISOString() ?? null,
              itineraryDays: item.itineraryDays,
            }}
          />
        </div>
      </section>
    </div>
  );
}
