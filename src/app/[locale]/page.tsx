import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { getSection } from "@/lib/siteConfig/service";
import { SocialLinks } from "@/components/content/SocialLinks";
import { LocationMap } from "@/components/content/LocationMap";
import { BannerSlot } from "@/components/banners/BannerSlot";
import { Band, SectionHead, rupees } from "@/components/home/HomeParts";
import { KundliRequestForm } from "@/components/home/KundliRequestForm";
import { whatsappLink } from "@/lib/content/whatsapp";
import { pageAlternates } from "@/lib/seo";
import { ArrowUpRight, Check, Mail, MapPin, Phone, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const isHindi = locale === "hi";
  return {
    title: isHindi
      ? "वैदिक ज्योतिष, कुंडली, पूजा एवं वास्तु | महर्षि कणाद ज्योतिष केंद्र, भिलाई"
      : "Vedic Astrology, Kundli, Puja and Vastu | Maharshi Kanad Jyotish Kendra, Bhilai",
    description: isHindi
      ? "जन्म कुंडली, प्रश्न कुंडली, कुंडली मिलान, पूजा, पाठ, यज्ञ और वास्तु परामर्श। ऑनलाइन बुकिंग और व्हाट्सऐप पर सीधी बात।"
      : "Janam Kundli, Prashn Kundli, Kundli matching, Puja, Paath, Yagya and Vastu guidance from Bhilai, Durg. Book online or talk on WhatsApp.",
    alternates: pageAlternates(locale, ""),
  };
}

export default async function HomePage(props: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await props.params;
  const locale = rawLocale || "hi";
  const isHindi = locale === "hi";
  const tr = (en: string, hi: string) => (isHindi ? hi : en);

  const [homeCfg, heroCfg, animCfg, toolsCfg] = await Promise.all([
    getSection("home"),
    getSection("hero"),
    getSection("heroAnimation"),
    getSection("tools"),
  ]);
  const pick = (cfg: Record<string, string | boolean | number>, k: string, fallback: string) =>
    String(cfg[k + (isHindi ? "Hi" : "En")] || "").trim() || fallback;

  const [settings, services, others, gallery, faqs, testimonials, leftBanners, rightBanners] = await Promise.all([
    prisma.adminSettings
      .findUnique({
        where: { id: "default" },
        select: {
          phone1: true, email: true, addressEn: true, addressHi: true, city: true, whatsappNumber: true, socialWhatsapp: true,
          googleMapEmbedUrl: true, mapEnabled: true, mapZoom: true, mapLatitude: true, mapLongitude: true, latitude: true, longitude: true,
        },
      })
      .catch(() => null),
    prisma.service
      .findMany({
        where: { isActive: true, slug: { in: ["janam-kundli", "prashna-kundli", "kundli-matching"] } },
        orderBy: { orderIndex: "asc" },
        include: { plans: { where: { isActive: true }, orderBy: { pricePaise: "asc" } } },
      })
      .catch(() => []),
    prisma.otherService.findMany({ where: { isActive: true }, orderBy: { orderIndex: "asc" } }).catch(() => []),
    prisma.mediaGalleryItem.findMany({ where: { isActive: true, mediaType: "IMAGE" }, orderBy: { orderIndex: "asc" }, take: 5 }).catch(() => []),
    prisma.faqItem.findMany({ where: { isActive: true }, orderBy: { orderIndex: "asc" }, take: 8 }).catch(() => []),
    prisma.testimonial.findMany({ where: { isActive: true, isVerified: true }, orderBy: { orderIndex: "asc" }, take: 3 }).catch(() => []),
    prisma.banner.findMany({ where: { isActive: true, position: "LEFT" }, orderBy: { orderIndex: "asc" } }).catch(() => []),
    prisma.banner.findMany({ where: { isActive: true, position: "RIGHT" }, orderBy: { orderIndex: "asc" } }).catch(() => []),
  ]);

  const phone = settings?.phone1 || "+91 98279 91224";
  const email = settings?.email || "sntiwarigevra61@gmail.com";
  const place = (isHindi ? settings?.addressHi : settings?.addressEn) || settings?.addressEn || "Bhilai, Durg, Chhattisgarh";
  const waNumber = settings?.whatsappNumber || settings?.socialWhatsapp || phone;
  const wa = (text: string) => whatsappLink(waNumber, text);

  const planGroups = (["janam-kundli", "prashna-kundli", "kundli-matching"] as const)
    .map((slug) => services.find((s) => s.slug === slug))
    .filter((s): s is NonNullable<typeof s> => !!s && s.plans.length > 0);

  const coreServices = services.map((s) => ({
    key: s.slug,
    title: isHindi ? s.titleHi : s.titleEn,
    desc: (isHindi ? s.taglineHi : s.taglineEn) || "",
    image: s.imageUrl || (s.slug === "prashna-kundli" ? "/ref/hero-1.webp" : s.slug === "kundli-matching" ? "/ref/hero-2.webp" : "/ref/astrology.webp"),
    href: `/services/${s.slug}`,
    external: null as string | null,
  }));
  const FALLBACK_IMAGES = ["/ref/astrology.webp", "/ref/hero-1.webp", "/ref/vastu.webp", "/ref/hero-2.webp"];
  const otherCards = others.map((o, idx) => ({
    key: o.slug,
    title: isHindi ? o.titleHi : o.titleEn,
    desc: isHindi ? o.descriptionHi : o.descriptionEn,
    image: o.imageUrl || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length],
    href: null as string | null,
    external: o.actionUrl,
  }));
  const allServices = [...coreServices, ...otherCards];

  const galleryItems =
    gallery.length > 0
      ? gallery.map((g) => ({ src: g.imageUrl, caption: isHindi ? g.titleHi : g.titleEn }))
      : [
          { src: "/ref/about.webp", caption: "Maharshi Kanad Jyotish Kendra" },
          { src: "/ref/hero-1.webp", caption: tr("Vedic Astrology", "वैदिक ज्योतिष") },
          { src: "/ref/hero-2.webp", caption: tr("Spiritual Guidance", "आध्यात्मिक मार्गदर्शन") },
          { src: "/ref/astrology.webp", caption: tr("Astrology", "ज्योतिष") },
          { src: "/ref/vastu.webp", caption: tr("Vastu", "वास्तु") },
        ];

  const faqList =
    faqs.length > 0
      ? faqs.map((f) => ({ q: isHindi ? f.questionHi : f.questionEn, a: isHindi ? f.answerHi : f.answerEn }))
      : [];

  const btn =
    "inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded bg-brand text-on-brand text-xs font-bold uppercase tracking-wider shadow-[0_12px_28px_rgba(174,55,25,0.24)] transition-transform hover:-translate-y-0.5";
  const btnGhost =
    "inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded border border-white/60 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors";

  const card = "bg-surface-container-lowest border border-outline-variant shadow-[0_18px_45px_rgba(73,38,24,0.09)]";

  return (
    <div className="flex flex-col w-full text-on-surface">
      {pick(homeCfg, "announcement", "") && (
        <div className="w-full bg-gold text-on-gold text-sm font-semibold px-5 sm:px-8 py-2">
          <div className="mx-auto max-w-[1240px]">{pick(homeCfg, "announcement", "")}</div>
        </div>
      )}

      {/* Hero */}
      <section id="home" className="relative min-h-[560px] lg:min-h-[680px] bg-maroon-deep overflow-hidden">
        {/* eslint-disable @next/next/no-img-element */}
        <img src="/ref/hero-1.webp" alt="" className="hero-fade-a absolute inset-0 h-full w-full object-cover" />
        {animCfg.enabled !== false && <img src="/ref/hero-2.webp" alt="" className="hero-fade-b absolute inset-0 h-full w-full object-cover" />}
        {/* eslint-enable @next/next/no-img-element */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(30,12,7,0.82),rgba(45,17,8,0.45),rgba(42,15,7,0.35))]" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[560px] lg:min-h-[680px] w-full max-w-[1240px] items-center px-5 sm:px-8 py-16">
          <div className="max-w-3xl">
            <span
              className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 text-gold"
              style={{ color: String(animCfg.accent || "") || undefined }}
            >
              {pick(heroCfg, "eyebrow", tr("Vedic Astrology • Rituals • Vastu", "वैदिक ज्योतिष • अनुष्ठान • वास्तु"))}
            </span>
            <h1
              className="font-serif font-semibold text-white text-5xl sm:text-6xl lg:text-7xl leading-[1.04] mb-5"
              style={animCfg.glow === true ? { textShadow: "0 0 28px rgba(216,163,65,0.55)" } : undefined}
            >
              {pick(heroCfg, "title", tr("Vedic Wisdom for a Balanced & Prosperous Life", "संतुलित एवं समृद्ध जीवन के लिए वैदिक ज्ञान"))}
            </h1>
            <p className="text-white/85 text-[15px] sm:text-base leading-[1.85] max-w-2xl mb-8">
              {pick(
                heroCfg,
                "lead",
                tr(
                  "Personalized guidance for Kundli, Prashn Kundli, matching, Puja, Paath, Yagya, Vastu, pilgrimage and important life decisions.",
                  "कुंडली, प्रश्न कुंडली, मिलान, पूजा, पाठ, यज्ञ, वास्तु, तीर्थ यात्रा और जीवन के महत्वपूर्ण निर्णयों के लिए व्यक्तिगत मार्गदर्शन।"
                )
              )}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/services" className={btn}>
                {tr("Book Your Consultation", "परामर्श बुक करें")}
              </Link>
              {toolsCfg.kundliEnabled !== false && (
                <Link href="/kundli" className={btnGhost}>
                  {tr("Free Kundli", "निःशुल्क कुंडली")}
                </Link>
              )}
            </div>
            {homeCfg.showSocialStrip !== false && <SocialLinks tone="light" className="mt-7" />}
          </div>
        </div>
      </section>

      {/* Three quick cards */}
      <section className="bg-surface-container">
        <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 md:grid-cols-3">
          <div className="flex items-start gap-4 bg-maroon text-white p-7 min-h-[138px]">
            <span className="grid h-12 w-12 shrink-0 place-items-center border border-white/50 text-2xl" aria-hidden="true">ॐ</span>
            <div>
              <h3 className="font-serif text-2xl font-bold mb-1">{tr("Connect With Us", "हमसे जुड़ें")}</h3>
              <p className="text-xs text-white/80">
                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="hover:underline">{phone}</a> {"•"} {place}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-surface-container-lowest p-7 min-h-[138px]">
            <span className="grid h-12 w-12 shrink-0 place-items-center border border-primary text-primary text-2xl" aria-hidden="true">✦</span>
            <div>
              <h3 className="font-serif text-2xl font-bold text-secondary mb-1">{tr("Consultation", "परामर्श")}</h3>
              <p className="text-xs text-on-surface-variant">{tr("Personalized Vedic guidance for important life decisions.", "जीवन के महत्वपूर्ण निर्णयों के लिए व्यक्तिगत वैदिक मार्गदर्शन।")}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-saffron text-white p-7 min-h-[138px]">
            <span className="grid h-12 w-12 shrink-0 place-items-center border border-white/60 text-2xl" aria-hidden="true">✧</span>
            <div>
              <h3 className="font-serif text-2xl font-bold mb-1">{tr("Vedic & Support Services", "वैदिक एवं सहायता सेवाएँ")}</h3>
              <p className="text-xs text-white/90">{tr("Kundli, Vastu, Bharat Darshan, vehicle, driver and ITR help desk.", "कुंडली, वास्तु, भारत दर्शन, वाहन, ड्राइवर और आईटीआर हेल्प डेस्क।")}</p>
            </div>
          </div>
        </div>
      </section>

      {(leftBanners.length > 0 || rightBanners.length > 0) && (
        <section className="bg-surface py-8">
          <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 md:grid-cols-2 gap-6 px-5 sm:px-8">
            {leftBanners.length > 0 && <BannerSlot position="LEFT" initialBanners={leftBanners.map(toBanner)} className="h-full" />}
            {rightBanners.length > 0 && <BannerSlot position="RIGHT" initialBanners={rightBanners.map(toBanner)} className="h-full" />}
          </div>
        </section>
      )}

      {/* About */}
      <Band id="about">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative pb-8 pl-8">
            <div className="absolute bottom-0 left-0 h-3/4 w-[70%] bg-saffron" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ref/about.webp" alt={tr("Maharshi Kanad Jyotish Kendra", "महर्षि कणाद ज्योतिष केंद्र")} className="relative h-[360px] sm:h-[480px] lg:h-[540px] w-full object-cover" />
          </div>
          <div>
            <SectionHead
              label={tr("About Maharshi Kanad Jyotish Kendra", "महर्षि कणाद ज्योतिष केंद्र के बारे में")}
              title={tr("Ancient Wisdom. Personal Guidance.", "प्राचीन ज्ञान। व्यक्तिगत मार्गदर्शन।")}
              intro={tr(
                "Maharshi Kanad Jyotish Kendra provides Vedic astrology, Janam Kundli, Prashn Kundli, Kundli Matching, Puja, Paath, Yagya, Vastu and connected support services from Bhilai, Durg, Chhattisgarh.",
                "महर्षि कणाद ज्योतिष केंद्र भिलाई, दुर्ग, छत्तीसगढ़ से वैदिक ज्योतिष, जन्म कुंडली, प्रश्न कुंडली, कुंडली मिलान, पूजा, पाठ, यज्ञ, वास्तु और संबद्ध सहायता सेवाएँ प्रदान करता है।"
              )}
            />
            <ul className="grid gap-4 mb-8 -mt-4">
              {[
                [tr("Traditional Vedic Approach", "पारंपरिक वैदिक पद्धति"), tr("Consultations structured around established Jyotish principles.", "स्थापित ज्योतिष सिद्धांतों पर आधारित परामर्श।")],
                [tr("Personalized Guidance", "व्यक्तिगत मार्गदर्शन"), tr("Guidance is based on your submitted details and specific requirements.", "मार्गदर्शन आपके दिए विवरण और विशेष आवश्यकताओं पर आधारित है।")],
                [tr("Online & Offline Support", "ऑनलाइन एवं ऑफलाइन सहयोग"), tr("Book online or continue directly through WhatsApp.", "ऑनलाइन बुक करें या सीधे व्हाट्सऐप पर बात करें।")],
              ].map(([t1, t2]) => (
                <li key={t1} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center bg-primary-container text-primary" aria-hidden="true"><Check className="h-4 w-4" /></span>
                  <span className="flex flex-col">
                    <strong className="font-serif text-xl font-bold text-secondary">{t1}</strong>
                    <small className="text-xs text-on-surface-variant">{t2}</small>
                  </span>
                </li>
              ))}
            </ul>
            <a href={wa(tr("Namaste, I would like to speak with the astrologer.", "नमस्ते, मैं ज्योतिषी से बात करना चाहता हूँ।"))} target="_blank" rel="noopener noreferrer" className={btn}>
              {tr("Speak With Astrologer", "ज्योतिषी से बात करें")}
            </a>
          </div>
        </div>
      </Band>

      {/* All services */}
      <Band id="services" tone="soft">
        <SectionHead
          label={tr("Our Services", "हमारी सेवाएँ")}
          title={tr("Vedic, Spiritual & Support Services", "वैदिक, आध्यात्मिक एवं सहायता सेवाएँ")}
          intro={tr("Choose any service and enquire directly on WhatsApp.", "कोई भी सेवा चुनें और सीधे व्हाट्सऐप पर पूछताछ करें।")}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allServices.map((s, i) => (
            <article key={s.key} className={`${card} group overflow-hidden transition-all duration-300 hover:-translate-y-2 flex flex-col`}>
              <div className="h-56 overflow-hidden bg-maroon">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt={s.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="relative flex flex-1 flex-col p-6">
                <span className="absolute -top-6 right-5 grid h-12 w-12 place-items-center border-4 border-white bg-maroon text-gold font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-serif text-[26px] font-bold leading-[1.1] text-secondary mb-3 pr-14">{s.title}</h3>
                <p className="text-xs leading-[1.75] text-on-surface-variant mb-5">{s.desc}</p>
                <div className="mt-auto flex flex-wrap items-center gap-4">
                  {s.href ? (
                    <Link href={s.href as never} className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
                      {tr("View plans", "योजनाएँ देखें")} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  ) : (
                    <a href={wa(`${tr("Namaste, I would like to know about", "नमस्ते, मुझे जानकारी चाहिए:")} ${s.title}`)} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary hover:underline">
                      {tr("Consult Now", "अभी परामर्श लें")}
                    </a>
                  )}
                  {s.external && (
                    <a href={s.external} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-secondary hover:underline inline-flex items-center gap-1">
                      {tr("Visit Website", "वेबसाइट देखें")} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Band>

      {/* Plan sections */}
      {planGroups.map((g, gi) => {
        const dark = gi === 1;
        return (
          <Band key={g.slug} id={g.slug} tone={dark ? "dark" : gi === 2 ? "light" : "light"}>
            <SectionHead
              dark={dark}
              label={isHindi ? g.titleHi : g.titleEn}
              title={
                g.slug === "janam-kundli"
                  ? tr("Birth Kundli Plans", "जन्म कुंडली योजनाएँ")
                  : g.slug === "prashna-kundli"
                    ? tr("Prashn Kundli – 3 Customized Plans", "प्रश्न कुंडली – 3 अनुकूल योजनाएँ")
                    : tr("Kundli Matching Plans", "कुंडली मिलान योजनाएँ")
              }
              intro={
                g.slug === "janam-kundli"
                  ? tr("Choose a plan according to the depth of report and consultation required.", "रिपोर्ट और परामर्श की गहराई के अनुसार योजना चुनें।")
                  : g.slug === "prashna-kundli"
                    ? tr("For one clear question, choose the required depth of analysis.", "एक स्पष्ट प्रश्न के लिए आवश्यक गहराई की योजना चुनें।")
                    : tr("Traditional compatibility analysis for marriage planning.", "विवाह की योजना के लिए पारंपरिक अनुकूलता विश्लेषण।")
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {g.plans.map((p) => {
                const featured = p.isPopular;
                const feats = (isHindi ? p.featuresHi : p.featuresEn) ?? [];
                return (
                  <article
                    key={p.id}
                    className={`flex flex-col p-8 border min-h-[400px] ${
                      featured ? "bg-maroon text-white border-maroon md:-translate-y-2.5 shadow-[0_24px_60px_rgba(64,36,28,0.35)]" : dark ? "bg-white/5 border-white/15 text-white" : `${card} text-on-surface`
                    }`}
                  >
                    <h3 className={`font-serif text-[26px] font-bold ${featured || dark ? "text-white" : "text-secondary"}`}>{isHindi ? p.titleHi : p.titleEn}</h3>
                    <div className={`font-serif text-5xl font-bold my-3 ${featured || dark ? "text-gold" : "text-primary"}`}>{rupees(p.pricePaise)}</div>
                    <ul className="mb-6 mt-2">
                      {feats.map((f) => (
                        <li key={f} className={`py-2.5 border-b text-xs ${featured || dark ? "border-white/15" : "border-outline-variant"}`}>{f}</li>
                      ))}
                    </ul>
                    <Link
                      href={`/booking?service=${g.slug}&plan=${p.slug}` as never}
                      className={`mt-auto ${featured ? "inline-flex items-center justify-center min-h-[48px] px-6 rounded bg-gold text-on-gold text-xs font-bold uppercase tracking-wider hover:brightness-110" : btn}`}
                    >
                      {tr("Select Plan", "योजना चुनें")}
                    </Link>
                  </article>
                );
              })}
            </div>
          </Band>
        );
      })}

      {/* Connected services */}
      {others.some((o) => o.actionUrl) && (
        <Band id="connected" tone="soft">
          <SectionHead
            label={tr("Connected Services", "संबद्ध सेवाएँ")}
            title={tr("Matrimonial & Bharat Darshan Services", "वैवाहिक एवं भारत दर्शन सेवाएँ")}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {others
              .filter((o) => o.actionUrl)
              .slice(0, 2)
              .map((o, i) => (
                <article key={o.slug} className={`flex flex-col p-8 sm:p-10 min-h-[300px] text-white ${i % 2 ? "bg-[linear-gradient(135deg,#BD3C20,#D95A24)]" : "bg-maroon"}`}>
                  <h3 className="font-serif text-4xl font-bold mb-3">{isHindi ? o.titleHi : o.titleEn}</h3>
                  <p className="text-[13px] leading-[1.8] text-white/80">{isHindi ? o.descriptionHi : o.descriptionEn}</p>
                  <a href={o.actionUrl as string} target="_blank" rel="noopener noreferrer" className="my-3 break-all text-xs text-[#FFD37A] hover:underline">
                    {o.actionUrl} {"↗"}
                  </a>
                  <a
                    href={wa(`${tr("Namaste, I would like an enquiry about", "नमस्ते, मुझे पूछताछ करनी है:")} ${isHindi ? o.titleHi : o.titleEn}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto self-start inline-flex items-center min-h-[48px] px-6 rounded bg-gold text-on-gold text-xs font-bold uppercase tracking-wider hover:brightness-110"
                  >
                    {o.slug.includes("matrimonial") ? tr("Matrimonial Enquiry", "वैवाहिक पूछताछ") : tr("Pilgrimage Enquiry", "तीर्थ यात्रा पूछताछ")}
                  </a>
                </article>
              ))}
          </div>
        </Band>
      )}

      {/* Free tools */}
      <Band id="tools">
        <SectionHead
          label={tr("Free Tools", "निःशुल्क उपकरण")}
          title={tr("Panchang, Kundli & Matching", "पंचांग, कुंडली एवं मिलान")}
          intro={tr("Use the free tools right here. No sign-in needed.", "ये निःशुल्क उपकरण यहीं उपयोग करें। साइन-इन की ज़रूरत नहीं।")}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            toolsCfg.panchangEnabled !== false && { href: "/panchang", t: tr("Hindi Panchang Calendar", "हिंदी पंचांग कैलेंडर"), d: tr("Tithi, nakshatra, Rahu Kaal and muhurat.", "तिथि, नक्षत्र, राहु काल और मुहूर्त।") },
            toolsCfg.kundliEnabled !== false && { href: "/kundli", t: tr("Free Kundli", "निःशुल्क कुंडली"), d: tr("Create your birth chart.", "अपनी जन्म कुंडली बनाएँ।") },
            toolsCfg.matchingEnabled !== false && { href: "/kundli/matching", t: tr("Kundli Matching", "कुंडली मिलान"), d: tr("36-guna matching for marriage.", "विवाह के लिए 36 गुण मिलान।") },
            { href: "/track", t: tr("Track Your Order", "अपना ऑर्डर ट्रैक करें"), d: tr("See the status of your booking.", "अपनी बुकिंग की स्थिति देखें।") },
          ]
            .filter(Boolean)
            .map((x) => {
              const tool = x as { href: string; t: string; d: string };
              return (
                <Link key={tool.href} href={tool.href as never} className={`${card} group p-6 flex flex-col gap-2 transition-all hover:-translate-y-1 hover:border-saffron`}>
                  <h3 className="font-serif text-2xl font-bold text-secondary">{tool.t}</h3>
                  <p className="text-xs text-on-surface-variant leading-[1.75]">{tool.d}</p>
                  <span className="mt-2 text-xs font-bold text-primary inline-flex items-center gap-1">{tr("Open", "खोलें")} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
                </Link>
              );
            })}
        </div>
      </Band>

      {/* Kundli request */}
      <Band id="generator" tone="soft">
        <SectionHead
          label={tr("Online Kundli", "ऑनलाइन कुंडली")}
          title={tr("Kundli Request Form", "कुंडली अनुरोध फ़ॉर्म")}
          intro={tr("Enter your birth details to prepare your Kundli request.", "अपनी कुंडली का अनुरोध तैयार करने के लिए जन्म विवरण भरें।")}
        />
        <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] bg-surface-container-lowest shadow-[0_20px_55px_rgba(76,42,25,0.12)]">
          <aside className="bg-maroon text-white p-8 sm:p-10 flex flex-col gap-5 justify-center">
            <span className="grid h-32 w-32 place-items-center rounded-full border border-gold/40 text-gold text-6xl" aria-hidden="true">ॐ</span>
            <h3 className="font-serif text-4xl font-bold">{tr("Birth Chart Request", "जन्म कुंडली अनुरोध")}</h3>
            <p className="text-sm text-white/75 max-w-xs">{tr("Share accurate birth details. The Kendra will contact you to confirm the plan and fee.", "सही जन्म विवरण दें। केंद्र योजना और शुल्क की पुष्टि के लिए आपसे संपर्क करेगा।")}</p>
          </aside>
          <KundliRequestForm isHindi={isHindi} whatsappHref={wa(tr("Namaste, I submitted a Kundli request on the website.", "नमस्ते, मैंने वेबसाइट पर कुंडली अनुरोध भेजा है।"))} />
        </div>
      </Band>

      {/* Gallery */}
      <Band id="gallery">
        <SectionHead
          label={tr("Gallery", "गैलरी")}
          title={tr("Sacred Moments & Spiritual Journey", "पवित्र क्षण एवं आध्यात्मिक यात्रा")}
        />
        <div className="grid grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr] gap-3">
          {galleryItems.map((g, i) => (
            <figure key={g.src + i} className={`relative overflow-hidden bg-maroon m-0 ${i === 0 ? "col-span-2 lg:col-span-1 lg:row-span-2 h-[260px] lg:h-[502px]" : "h-[200px] lg:h-[245px]"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.src} alt={g.caption} loading="lazy" className="h-full w-full object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 p-3 text-[11px] text-white bg-gradient-to-t from-black/65 to-transparent">{g.caption}</figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/gallery" className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
            {tr("See the full gallery", "पूरी गैलरी देखें")} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </Band>

      {/* Booking flow */}
      <Band id="booking" tone="soft">
        <SectionHead
          label={tr("Booking", "बुकिंग")}
          title={tr("Simple Booking & Consultation Flow", "सरल बुकिंग एवं परामर्श प्रक्रिया")}
          intro={tr("Service selection, booking, payment and delivery are kept clear and separate.", "सेवा चयन, बुकिंग, भुगतान और डिलीवरी अलग-अलग और स्पष्ट रखे गए हैं।")}
        />
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            [tr("Choose Service / Plan", "सेवा / योजना चुनें"), tr("Select the required service or plan.", "आवश्यक सेवा या योजना चुनें।")],
            [tr("Enter Your Details", "अपना विवरण भरें"), tr("Sign in and enter your birth and contact details.", "साइन-इन करें और जन्म एवं संपर्क विवरण भरें।")],
            [tr("Confirm Fee & Pay", "शुल्क देखें और भुगतान करें"), tr("Check the final amount and pay by UPI or bank.", "अंतिम राशि देखें और UPI या बैंक से भुगतान करें।")],
            [tr("Track & Receive", "ट्रैक करें और प्राप्त करें"), tr("Follow the status and receive your report.", "स्थिति देखें और अपनी रिपोर्ट प्राप्त करें।")],
          ].map(([h, d], i) => (
            <li key={h} className="bg-surface-container-lowest border-t-[3px] border-saffron p-7 min-h-[230px] list-none">
              <span className="font-serif text-5xl font-bold text-[#EADBD0]">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-serif text-2xl font-bold text-secondary mt-3 mb-2">{h}</h3>
              <p className="text-xs leading-[1.75] text-on-surface-variant">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <Link href="/services" className={btn}>{tr("Start Booking", "बुकिंग शुरू करें")}</Link>
        </div>
      </Band>

      {/* Payment */}
      <Band id="payment">
        <SectionHead
          label={tr("Payment", "भुगतान")}
          title={tr("Clear & Confirmed Payment Process", "स्पष्ट एवं पुष्ट भुगतान प्रक्रिया")}
          intro={tr("Confirm the selected service and the final payable amount before payment.", "भुगतान से पहले चुनी गई सेवा और अंतिम देय राशि की पुष्टि करें।")}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className={`${card} p-8 sm:p-10`}>
            <h3 className="font-serif text-3xl font-bold text-secondary mb-4">{tr("Before You Pay", "भुगतान से पहले")}</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm leading-7 text-on-surface mb-6">
              <li>{tr("Select the required service or plan.", "आवश्यक सेवा या योजना चुनें।")}</li>
              <li>{tr("Enter your details and apply a promo code if you have one.", "अपना विवरण भरें और प्रोमो कोड हो तो लगाएँ।")}</li>
              <li>{tr("Pay by UPI, QR or bank transfer and enter the payment reference.", "UPI, QR या बैंक ट्रांसफर से भुगतान करें और भुगतान संदर्भ संख्या भरें।")}</li>
            </ol>
            <Link href="/offers" className="text-xs font-bold text-primary hover:underline">{tr("See current offers", "वर्तमान ऑफ़र देखें")}</Link>
          </article>
          <article className="bg-maroon text-white p-8 sm:p-10">
            <h3 className="font-serif text-3xl font-bold mb-4">{tr("Payment Gateway", "पेमेंट गेटवे")}</h3>
            <p className="text-sm leading-7 text-white/80">
              {tr(
                "Razorpay, UPI or another payment gateway can be connected when merchant credentials are available. Until then, payments are verified by the Kendra after you enter your payment reference.",
                "मर्चेंट क्रेडेंशियल मिलने पर रेज़रपे, UPI या अन्य पेमेंट गेटवे जोड़ा जा सकता है। तब तक भुगतान संदर्भ संख्या भरने के बाद केंद्र द्वारा सत्यापित किया जाता है।"
              )}
            </p>
          </article>
        </div>
      </Band>

      {/* Reviews */}
      {testimonials.length > 0 && (
        <Band id="reviews" tone="soft">
          <SectionHead label={tr("Reviews", "समीक्षाएँ")} title={tr("Words From Our Visitors", "हमारे आगंतुकों के शब्द")} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <figure key={t.id} className={`${card} p-7 m-0`}>
                <blockquote className="text-sm leading-[1.85] text-on-surface mb-4">{isHindi ? t.quoteHi : t.quoteEn}</blockquote>
                <figcaption className="font-serif text-xl font-bold text-secondary">{isHindi ? t.authorNameHi : t.authorNameEn}</figcaption>
              </figure>
            ))}
          </div>
        </Band>
      )}

      {/* FAQ */}
      {faqList.length > 0 && (
        <Band id="faq">
          <SectionHead label={tr("FAQ", "सामान्य प्रश्न")} title={tr("Frequently Asked Questions", "अक्सर पूछे जाने वाले प्रश्न")} />
          <div className="max-w-4xl">
            {faqList.map((f) => (
              <details key={f.q} className="group border-b border-outline-variant">
                <summary className="flex min-h-[76px] cursor-pointer list-none items-center justify-between gap-4 font-serif text-xl sm:text-2xl font-bold text-secondary">
                  <span>{f.q}</span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center border border-primary text-primary transition-transform group-open:rotate-45 group-open:bg-primary group-open:text-white" aria-hidden="true">
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <p className="pb-6 pr-12 text-sm leading-[1.85] text-on-surface-variant">{f.a}</p>
              </details>
            ))}
          </div>
        </Band>
      )}

      {/* Contact */}
      <Band id="contact" tone="soft">
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] shadow-[0_20px_55px_rgba(76,42,25,0.12)]">
          <div className="bg-maroon text-white p-8 sm:p-12 flex flex-col gap-6">
            <div>
              <span className="block text-xs font-bold uppercase tracking-[0.2em] mb-3 text-gold">{tr("Reach Out & Connect", "संपर्क करें")}</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-semibold leading-[1.05] mb-3">{tr("Begin Your Consultation", "अपना परामर्श शुरू करें")}</h2>
              <p className="text-sm leading-[1.85] text-white/75">
                {tr("Contact Maharshi Kanad Jyotish Kendra for all astrology, ritual, travel and support enquiries.", "ज्योतिष, अनुष्ठान, यात्रा और सहायता संबंधी सभी पूछताछ के लिए महर्षि कणाद ज्योतिष केंद्र से संपर्क करें।")}
              </p>
            </div>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3"><Phone className="h-4 w-4 mt-1 text-gold" aria-hidden="true" /><div><div className="text-[11px] font-bold uppercase tracking-wider text-gold">{tr("Phone", "फ़ोन")}</div><a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="hover:underline">{phone}</a></div></li>
              <li className="flex items-start gap-3"><Mail className="h-4 w-4 mt-1 text-gold" aria-hidden="true" /><div><div className="text-[11px] font-bold uppercase tracking-wider text-gold">{tr("Email", "ईमेल")}</div><a href={`mailto:${email}`} className="hover:underline break-all">{email}</a></div></li>
              <li className="flex items-start gap-3"><MapPin className="h-4 w-4 mt-1 text-gold" aria-hidden="true" /><div><div className="text-[11px] font-bold uppercase tracking-wider text-gold">{tr("Location", "स्थान")}</div>{place}</div></li>
            </ul>
            <div className="mt-auto flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center min-h-[48px] px-6 rounded bg-gold text-on-gold text-xs font-bold uppercase tracking-wider hover:brightness-110">{tr("Open Enquiry Form", "पूछताछ फ़ॉर्म खोलें")}</Link>
              <a href={wa(tr("Namaste, I would like to book a consultation.", "नमस्ते, मैं परामर्श बुक करना चाहता हूँ।"))} target="_blank" rel="noopener noreferrer" className={btnGhost}>WhatsApp</a>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 sm:p-8">
            <LocationMap
              settings={settings ?? {}}
              title={tr("Find us", "हमारा स्थान")}
              isHindi={isHindi}
            />
          </div>
        </div>
      </Band>
    </div>
  );
}

function toBanner(b: {
  id: string;
  titleEn: string;
  titleHi: string;
  subtitleEn: string | null;
  subtitleHi: string | null;
  imageUrl: string;
  linkUrl: string | null;
  position: string;
  type: string;
  isActive: boolean;
  orderIndex: number;
}) {
  return { ...b, position: b.position as "LEFT" | "RIGHT", type: b.type as "STATIC" | "CAROUSEL" };
}
