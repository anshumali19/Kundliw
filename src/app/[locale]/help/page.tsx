import { kendraEmail } from "@/lib/content/contact";
import { RichText } from "@/components/content/RichText";
import { pageAlternates } from "@/lib/seo";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BlocksView } from "@/components/content/MediaView";
import { normalizeBlocks } from "@/lib/content/media";
import { HelpCircle, Phone, Mail, Clock, MessageSquare, Search, FileText } from "lucide-react";
import { Link } from "@/i18n/routing";

interface HelpPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(props: HelpPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const isHindi = locale === "hi";
  return {
    alternates: pageAlternates(locale, "/help"),
    title: isHindi
      ? "सहायता एवं ग्राहक समर्थन • महर्षि कणाद ज्योतिष केंद्र"
      : "Help & Customer Support • Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "बुकिंग, रिपोर्ट डाउनलोड, दक्षिणा रसीद एवं परामर्श संबंधी सहायता केंद्र।"
      : "Help center for bookings, horoscope report downloads, receipts, and consultation inquiries.",
  };
}

export default async function HelpPage(props: HelpPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const isHindi = locale === "hi";

  const [page, settings] = await Promise.all([
    prisma.staticPage.findUnique({ where: { slug: "help" } }).catch(() => null),
    prisma.adminSettings.findFirst().catch(() => null),
  ]);

  const title = isHindi ? page?.titleHi || "सहायता एवं संपर्क केंद्र" : page?.titleEn || "Help & Customer Support";
  const content = isHindi
    ? page?.contentHi ||
      "बुकिंग, रिपोर्ट डाउनलोड या ऑर्डर की स्थिति में सहायता के लिए हमें कॉल करें, सहायता चैट का उपयोग करें या पूछताछ भेजें।"
    : page?.contentEn ||
      "Need help with your booking, report download or order status? Call us, use Help Chat, or send an enquiry.";

  const phone1 = settings?.phone1;
  const phone2 = settings?.phone2;
  const email = kendraEmail(settings?.email);

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-left space-y-10">
      {/* Header */}
      <div className="border-b border-outline-variant/30 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <HelpCircle className="w-4 h-4 text-primary" />
          <span>{isHindi ? "सहायता एवं समर्थन" : "Help & Guidance Portal"}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          {isHindi
            ? "बुकिंग, रिपोर्ट डाउनलोड, दक्षिणा सत्यापन एवं परामर्श सहायता"
            : "Assistance with consultations, PDF vault downloads, payments, and order tracking"}
        </p>
      </div>

      {/* Intro Message */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-outline-variant/40 shadow-sm leading-relaxed text-sm sm:text-base text-on-surface space-y-3 space-y-4">
        <RichText text={content} />
      </div>

      <BlocksView blocks={normalizeBlocks(page?.blocks)} isHindi={isHindi} />

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          href="/faq"
          className="p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 transition-all space-y-2 group"
        >
          <Search className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          <div className="font-serif font-bold text-sm text-secondary">
            {isHindi ? "प्रायः पूछे जाने वाले प्रश्न (FAQ)" : "Read FAQs"}
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {isHindi
              ? "कुण्डली, दक्षिणा, मुहूर्त एवं अनुष्ठान से जुड़े सामान्य प्रश्नों के उत्तर।"
              : "Instant answers regarding horoscopes, Dakshina, muhurtas, and rituals."}
          </p>
        </Link>

        <Link
          href="/track"
          className="p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 transition-all space-y-2 group"
        >
          <FileText className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          <div className="font-serif font-bold text-sm text-secondary">
            {isHindi ? "बुकिंग स्थिति जांचें" : "Track Your Booking"}
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {isHindi
              ? "अपने 6-चरणीय कुण्डली निर्माण एवं प्रेषण की लाइव स्थिति देखें।"
              : "Check the real-time 6-stage lifecycle of your Kundli preparation and dispatch."}
          </p>
        </Link>

        <Link
          href="/contact"
          className="p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 transition-all space-y-2 group"
        >
          <Mail className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          <div className="font-serif font-bold text-sm text-secondary">
            {isHindi ? "संदेश / पूछताछ भेजें" : "Submit Enquiry"}
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {isHindi
              ? "केंद्र दल को सीधे संदेश भेजें, २४ घंटे के भीतर संपर्क किया जाएगा।"
              : "Send a direct query to our team."}
          </p>
        </Link>
      </div>

      {/* Direct Contact Details from AdminSettings */}
      {(phone1 || email) && (
        <div className="p-6 rounded-2xl bg-surface border border-outline-variant/40 space-y-4">
          <div className="font-serif font-bold text-sm text-secondary uppercase tracking-wider">
            {isHindi ? "प्रत्यक्ष संपर्क सूत्र" : "Contact details"}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-on-surface">
            {phone1 && (
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <div className="text-[10px] uppercase text-outline">{isHindi ? "हेल्पलाइन १" : "Helpline 1"}</div>
                  <a href={`tel:${phone1.replace(/\s+/g, "")}`} className="font-semibold text-secondary hover:underline">
                    {phone1}
                  </a>
                </div>
              </div>
            )}
            {phone2 && (
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <div className="text-[10px] uppercase text-outline">{isHindi ? "हेल्पलाइन २" : "Helpline 2"}</div>
                  <a href={`tel:${phone2.replace(/\s+/g, "")}`} className="font-semibold text-secondary hover:underline">
                    {phone2}
                  </a>
                </div>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <div className="text-[10px] uppercase text-outline">{isHindi ? "ईमेल संपर्क" : "Email Support"}</div>
                  <a href={`mailto:${email}`} className="font-semibold text-secondary hover:underline">
                    {email}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
