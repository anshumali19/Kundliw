import { pageAlternates } from "@/lib/seo";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Award, BookOpen, Compass, Shield, Users, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

interface AboutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(props: AboutPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const isHindi = locale === "hi";
  return {
    alternates: pageAlternates(locale, "/about"),
    title: isHindi
      ? "हमारे बारे में • महर्षि कणाद ज्योतिष केंद्र • काशी"
      : "About Us • Maharshi Kanad Jyotish Kendra • Varanasi",
    description: isHindi
      ? "वाराणसी के दशाश्वमेध घाट पर चार दशकों से संचालित प्रामाणिक दृश्य गणित ज्योतिष पीठ।"
      : "Authentic Vedic astrology and ephemeris calculation center in Varanasi with 40+ years heritage.",
  };
}

export default async function AboutPage(props: AboutPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const isHindi = locale === "hi";

  const page = await prisma.staticPage
    .findUnique({ where: { slug: "about" } })
    .catch(() => null);

  const title = isHindi ? page?.titleHi || "महर्षि कणाद ज्योतिष केंद्र परिचय" : page?.titleEn || "About Maharshi Kanad Jyotish Kendra";
  const content = isHindi
    ? page?.contentHi ||
      "महर्षि कणाद ज्योतिष केंद्र काशी (वाराणसी) की पवित्र धरा पर स्थित दृश्य गणित एवं वैदिक ज्योतिष का प्रामाणिक संस्थान है। वैशेषिक दर्शन के प्रणेता महर्षि कणाद के वैज्ञानिक दृष्टिकोण को आत्मसात करते हुए यह केंद्र शुद्ध पंचांग गणना एवं शास्त्रसम्मत मार्गदर्शन प्रदान करता है।"
    : page?.contentEn ||
      "Maharshi Kanad Jyotish Kendra is an authentic center of Vedic astronomy (Siddhanta) and predictive astrology (Hora) rooted in the holy city of Kashi (Varanasi). Dedicated to Maharshi Kanad, the ancient sage and philosopher of atomic science (Vaisheshika), the Kendra bridges ancient scriptural wisdom with modern calculation accuracy.";

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-left space-y-10">
      {/* Header */}
      <div className="border-b border-outline-variant/30 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <Compass className="w-4 h-4 text-primary" />
          <span>{isHindi ? "संस्थान परिचय एवं परंपरा" : "About Our Center & Lineage"}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          {isHindi
            ? "दशाश्वमेध घाट, वाराणसी • ४ दशकों से शुद्ध दृग्गणित एवं शास्त्रसम्मत ज्योतिषीय सेवा"
            : "Dashashwamedh Ghat, Varanasi • 40+ Years of Pure Astronomical Ephemeris & Vedic Ethics"}
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-outline-variant/40 shadow-sm leading-relaxed text-sm sm:text-base text-on-surface whitespace-pre-line space-y-4">
        {content}
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
          <Award className="w-5 h-5 text-primary" />
          <div className="font-serif font-bold text-sm text-secondary">
            {isHindi ? "विशुद्ध दृग्गणित पंचांग" : "Astronomical Ephemeris"}
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {isHindi
              ? "लाहिड़ी अयनांश एवं सूक्ष्म अक्षांश-रेखांश पर आधारित सत्य ग्रह स्थितियां।"
              : "Exact celestial coordinates based on Lahiri Ayanamsha and Varanasi apparent solar time."}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
          <Shield className="w-5 h-5 text-primary" />
          <div className="font-serif font-bold text-sm text-secondary">
            {isHindi ? "भयमुक्त नैतिक परामर्श" : "Fear-Free Ethical Guidance"}
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {isHindi
              ? "कालसर्प या मांगलिक के नाम पर भय-व्यापार नहीं, विशुद्ध कर्म एवं शास्त्रीय उपाय।"
              : "No superstitious fear-mongering; authentic karmic analysis and canonical remedies."}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
          <Users className="w-5 h-5 text-primary" />
          <div className="font-serif font-bold text-sm text-secondary">
            {isHindi ? "काशी विद्वत् पीठ" : "Kashi Scholarly Council"}
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {isHindi
              ? "संपूर्णानंद एवं बीएचयू के प्रामाणिक ज्योतिषाचार्यों का सतत सानिध्य।"
              : "Guided directly by senior initiated Daivajnas and Sanskrit university scholars."}
          </p>
        </div>
      </div>

      {/* Navigation Links to Founder & Services */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
        <Link
          href="/founder"
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-primary text-on-primary font-semibold text-xs sm:text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
        >
          <span>{isHindi ? "संस्थापक परिचय देखें" : "View Founder Lineage"}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/services"
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-surface-container text-on-surface font-semibold text-xs sm:text-sm hover:bg-surface-container-high border border-outline-variant/40 transition-all flex items-center justify-center gap-2"
        >
          <span>{isHindi ? "केंद्र की सेवाएं देखें" : "Explore Kendra Services"}</span>
        </Link>
      </div>
    </div>
  );
}
