import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Award, BookOpen } from "lucide-react";

interface FounderPageProps {
  params: {
    locale: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params: { locale } }: FounderPageProps): Promise<Metadata> {
  const isHindi = locale === "hi";
  return {
    title: isHindi
      ? "संस्थापक एवं दैवज्ञ परंपरा • महर्षि कणाद ज्योतिष केंद्र"
      : "Founder Lineage • Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "काशी की अविच्छिन्न सिद्धांत ज्योतिष परंपरा एवं संस्थापक परिचय।"
      : "Vedic lineage and founder background rooted in Varanasi ephemeris scholarship.",
  };
}

export default async function FounderPage({ params: { locale } }: FounderPageProps) {
  const isHindi = locale === "hi";
  const page = await prisma.staticPage.findUnique({ where: { slug: "founder" } });

  const title = isHindi ? page?.titleHi || "संस्थापक एवं दैवज्ञ परंपरा" : page?.titleEn || "Founder Lineage & Scholarly Tradition";
  const content = isHindi
    ? page?.contentHi ||
      "केंद्र के संस्थापक वरिष्ठ दैवज्ञों ने काशी हिंदू विश्वविद्यालय एवं संपूर्णानंद संस्कृत विश्वविद्यालय से वेदांग ज्योतिष में आचार्य पद प्राप्त कर पिछले चार दशकों में हजारों जातकों का मार्गदर्शन किया है।"
    : page?.contentEn ||
      "Founded by senior Daivajnas trained in the classical Vedanga Jyotish tradition of Kashi, our Kendra preserves authentic Siddhanta calculations and ethical predictive consultations.";

  return (
    <div className="w-full min-h-[70vh] py-12 px-4 sm:px-6 max-w-4xl mx-auto text-left space-y-8">
      <div>
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <Award className="w-4 h-4" />
          <span>{isHindi ? "संस्थापक परंपरा" : "Founder Lineage"}</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-secondary mt-1">{title}</h1>
      </div>

      <div className="p-6 sm:p-8 rounded-lg bg-surface border border-outline-variant/40 shadow-sm leading-relaxed whitespace-pre-line text-sm text-on-surface space-y-4">
        {content}
      </div>
    </div>
  );
}
