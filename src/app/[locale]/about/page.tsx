import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Sparkles, MapPin, Award } from "lucide-react";

interface AboutPageProps {
  params: {
    locale: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params: { locale } }: AboutPageProps): Promise<Metadata> {
  const isHindi = locale === "hi";
  return {
    title: isHindi
      ? "संस्था परिचय • महर्षि कणाद ज्योतिष केंद्र"
      : "About Us • Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "वाराणसी दशाश्वमेध घाट की ४२+ वर्षों की सुदीर्घ दैवज्ञ परंपरा एवं शुद्ध गणितीय ज्योतिष।"
      : "Varanasi astronomical lineage and high-precision Vedic astrology based on Surya Siddhanta rigor.",
  };
}

export default async function AboutPage({ params: { locale } }: AboutPageProps) {
  const isHindi = locale === "hi";
  const page = await prisma.staticPage.findUnique({ where: { slug: "about" } });

  const title = isHindi ? page?.titleHi || "महर्षि कणाद ज्योतिष केंद्र परिचय" : page?.titleEn || "About Maharshi Kanad Jyotish Kendra";
  const content = isHindi
    ? page?.contentHi ||
      "महर्षि कणाद ज्योतिष केंद्र वाराणसी की पवित्र भूमि, दशाश्वमेध घाट पर ४२ से अधिक वर्षों से कार्यरत एक प्रतिष्ठित ज्योतिष संस्थान है। यहाँ समस्त गणनाएं प्राचीन सूर्य सिद्धान्त एवं आधुनिक दृग्गणित के सूक्ष्म समन्वय पर आधारित हैं।"
    : page?.contentEn ||
      "Rooted in Varanasi's sacred astronomical tradition at Dashashwamedh Ghat for over 42 years, Maharshi Kanad Jyotish Kendra is dedicated to authentic mathematical Vedic astrology without superstition.";

  return (
    <div className="w-full min-h-[70vh] py-12 px-4 sm:px-8 lg:px-12 text-left space-y-8">
      <div>
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          <span>{isHindi ? "संस्था परिचय" : "About Our Kendra"}</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-secondary mt-1">{title}</h1>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-2">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span>Dashashwamedh Ghat, Varanasi, Uttar Pradesh</span>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-lg bg-surface border border-outline-variant/40 shadow-sm leading-relaxed whitespace-pre-line text-sm text-on-surface space-y-4">
        {content}
      </div>
    </div>
  );
}
