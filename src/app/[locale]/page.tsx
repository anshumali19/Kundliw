import { activePlanWhere } from "@/lib/content/packages";
import { kendraEmail } from "@/lib/content/contact";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { getSection } from "@/lib/siteConfig/service";
import { SocialLinks } from "@/components/content/SocialLinks";
import { RichText } from "@/components/content/RichText";
import { BannerSlot } from "@/components/banners/BannerSlot";
import { Band, SectionHead, rupees } from "@/components/home/HomeParts";
import { HeroSlider } from "@/components/home/HeroSlider";
import { HomeTrustBands, HomeMoreBands } from "@/components/home/HomeExtras";
import { HERO_SLIDES_KEY, normalizeHeroSlides, slideIsShowable } from "@/lib/content/heroSlides";
import { KundliRequestForm } from "@/components/home/KundliRequestForm";
import { whatsappLink } from "@/lib/content/whatsapp";
import { safeHref, stripRich } from "@/lib/content/richText";
import { pageAlternates } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArrowUpRight, Check, Phone, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const isHindi = locale === "hi";
  return {
    title: isHindi
      ? "वैदिक ज्योतिष, जन्म कुंडली, प्रश्न कुंडली, कुंडली मिलान, पूजा एवं वास्तु | महर्षि कणाद ज्योतिष केंद्र"
      : "Vedic Astrology, Janam Kundli, Prashn Kundli, Kundli Matching, Puja & Vastu | Maharshi Kanad Jyotish Kendra",
    description: isHindi
      ? "जन्म कुंडली, प्रश्न कुंडली, कुंडली मिलान, पूजा, पाठ, यज्ञ और वास्तु परामर्श। निःशुल्क पंचांग और कुंडली, ऑनलाइन बुकिंग और व्हाट्सऐप पर सीधी बात।"
      : "Janam Kundli, Prashn Kundli, Kundli matching, Puja, Paath, Yagya and Vastu guidance. Free Panchang and Kundli, online booking and direct WhatsApp support.",
    alternates: pageAlternates(locale, ""),
  };
}

type Cfg = Record<string, string | boolean | number>;

export default async function HomePage(props: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await props.params;
  const locale = rawLocale || "hi";
  const isHindi = locale === "hi";
  const tr = (en: string, hi: string) => (isHindi ? hi : en);

  const [homeCfg, heroCfg, animCfg, toolsCfg, secCfg, heroBox, cardsCfg, servCfg, procCfg, contCfg, floatCfg] = await Promise.all([
    getSection("home"),
    getSection("hero"),
    getSection("heroAnimation"),
    getSection("tools"),
    getSection("homeSections"),
    getSection("homeHero"),
    getSection("homeCards"),
    getSection("homeServices"),
    getSection("homeProcess"),
    getSection("homeContact"),
    getSection("floating"),
  ]);
  const pick = (cfg: Cfg, k: string, fallback: string) => String(cfg[k + (isHindi ? "Hi" : "En")] || "").trim() || fallback;
  // The admin's own wording when set, the standard wording otherwise
  const HC: Cfg = { ...cardsCfg, ...servCfg, ...procCfg, ...contCfg };
  const h = (key: string, en: string, hi: string) => pick(HC, key, tr(en, hi));
  const on = (k: string) => secCfg[k] !== false;
  const link = (v: unknown, fallback: string) => safeHref(String(v || ""))?.href ?? fallback;

  const [settings, services, others, gallery, faqs, testimonials, leftBanners, rightBanners, savedSlides] = await Promise.all([
    prisma.adminSettings
      .findUnique({
        where: { id: "default" },
        select: { phone1: true, email: true, whatsappNumber: true, socialWhatsapp: true },
      })
      .catch(() => null),
    prisma.service
      .findMany({
        where: { isActive: true, slug: { in: ["janam-kundli", "prashna-kundli", "kundli-matching"] } },
        orderBy: { orderIndex: "asc" },
        include: { plans: { where: activePlanWhere, orderBy: { pricePaise: "asc" } } },
      })
      .catch(() => []),
    prisma.otherService.findMany({ where: { isActive: true }, orderBy: { orderIndex: "asc" } }).catch(() => []),
    prisma.mediaGalleryItem.findMany({ where: { isActive: true, mediaType: "IMAGE" }, orderBy: { orderIndex: "asc" }, take: 5 }).catch(() => []),
    prisma.faqItem.findMany({ where: { isActive: true }, orderBy: { orderIndex: "asc" }, take: 8 }).catch(() => []),
    prisma.testimonial.findMany({ where: { isActive: true, isVerified: true }, orderBy: { orderIndex: "asc" }, take: 3 }).catch(() => []),
    prisma.banner.findMany({ where: { isActive: true, position: "LEFT" }, orderBy: { orderIndex: "asc" } }).catch(() => []),
    prisma.banner.findMany({ where: { isActive: true, position: "RIGHT" }, orderBy: { orderIndex: "asc" } }).catch(() => []),
    prisma.siteConfig
      .findUnique({ where: { key: HERO_SLIDES_KEY } })
      .then((r) => normalizeHeroSlides(r?.value))
      .catch(() => []),
  ]);

  const phone = settings?.phone1 || "+91 98279 91224";
  const waNumber = String(floatCfg.whatsappNumber || "").trim() || settings?.whatsappNumber || settings?.socialWhatsapp || phone;
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

  const faqList = faqs.map((f) => ({ q: isHindi ? f.questionHi : f.questionEn, a: isHindi ? f.answerHi : f.answerEn }));

  const btn =
    "inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded bg-brand text-on-brand text-xs font-bold uppercase tracking-wider shadow-[0_12px_28px_rgba(174,55,25,0.24)] transition-transform hover:-translate-y-0.5";
  const btnGhost =
    "inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded border border-white/60 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors";
  const card = "bg-surface-container-lowest border border-outline-variant shadow-[0_18px_45px_rgba(73,38,24,0.09)]";
  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;

  // Admin > Home hero slides: up to 10 pictures, each may be tied to a service whose picture it can reuse
  const sliderSlides = savedSlides
    .map((sl) => {
      const svc = services.find((v) => v.slug === sl.serviceSlug);
      return { sl, svc, image: sl.imageUrl || svc?.imageUrl || "" };
    })
    .filter(({ sl, image }) => slideIsShowable(sl, image))
    .map(({ sl, svc, image }) => ({
      id: sl.id,
      image,
      title: (isHindi ? sl.titleHi || sl.titleEn : sl.titleEn || sl.titleHi).trim(),
      desc: (isHindi ? sl.descHi || sl.descEn : sl.descEn || sl.descHi).trim(),
      youtubeUrl: sl.youtubeUrl,
      serviceHref: svc ? `/services/${svc.slug}` : "",
      titleColor: sl.titleColor,
      descColor: sl.descColor,
      animation: sl.animation,
      animSpeed: sl.animSpeed,
    }));

  const heroImg1 = String(heroBox.image1 || "").trim() || "/ref/hero-1.webp";
  const heroImg2 = String(heroBox.image2 || "").trim() || "/ref/hero-2.webp";
  const overlay = Math.min(90, Math.max(0, Number(heroBox.overlay ?? 60)));
  const cta1Url = link(heroBox.cta1Url, "/services");
  const cta2Url = link(heroBox.cta2Url, "/kundli");
  const cta2Visible = heroBox.showCta2 !== false && (toolsCfg.kundliEnabled !== false || !!String(heroBox.cta2Url || "").trim());
  const anchorLink = (href: string, className: string, children: React.ReactNode) =>
    /^https?:/i.test(href) || href.startsWith("tel:") || href.startsWith("mailto:") ? (
      <a href={href} {...(/^https?:/i.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={className}>
        {children}
      </a>
    ) : (
      <Link href={href as never} className={className}>
        {children}
      </Link>
    );

  return (
    <div className="flex flex-col w-full text-on-surface">
      {faqList.length > 0 && on("showFaq") && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqList.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: stripRich(f.a) } })),
          }}
        />
      )}
      {pick(homeCfg, "announcement", "") && (
        <div className="w-full bg-gold text-on-gold text-sm font-semibold px-5 sm:px-8 py-2">
          <div className="mx-auto max-w-[1240px]">
            <RichText text={pick(homeCfg, "announcement", "")} />
          </div>
        </div>
      )}

      {/* Hero */}
      {sliderSlides.length > 0 ? (
        <HeroSlider slides={sliderSlides} isHindi={isHindi} overlay={overlay} />
      ) : (
      <section id="home" className="relative min-h-[560px] lg:min-h-[680px] bg-maroon-deep overflow-hidden">
        {/* eslint-disable @next/next/no-img-element */}
        <img src={heroImg1} alt="" className="hero-fade-a absolute inset-0 h-full w-full object-cover" />
        {animCfg.enabled !== false && <img src={heroImg2} alt="" className="hero-fade-b absolute inset-0 h-full w-full object-cover" />}
        {/* eslint-enable @next/next/no-img-element */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(90deg, rgba(30,12,7,${Math.min(0.95, overlay / 100 + 0.2).toFixed(2)}), rgba(45,17,8,${Math.max(0, overlay / 100 - 0.15).toFixed(2)}), rgba(42,15,7,${Math.max(0, overlay / 100 - 0.25).toFixed(2)}))` }}
          aria-hidden="true"
        />
        <div className="relative mx-auto flex min-h-[560px] lg:min-h-[680px] w-full max-w-[1240px] items-center px-5 sm:px-8 py-16">
          <div className="max-w-3xl hero-rise">
            <span className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 text-gold" style={{ color: String(animCfg.accent || "") || undefined }}>
              {pick(heroCfg, "eyebrow", tr("Vedic Astrology • Rituals • Vastu", "वैदिक ज्योतिष • अनुष्ठान • वास्तु"))}
            </span>
            <h1
              className="font-serif font-semibold text-white text-5xl sm:text-6xl lg:text-7xl leading-[1.04] mb-5"
              style={animCfg.glow === true ? { textShadow: "0 0 28px rgba(216,163,65,0.55)" } : undefined}
            >
              {pick(heroCfg, "title", tr("Vedic Wisdom for a Balanced & Prosperous Life", "संतुलित एवं समृद्ध जीवन के लिए वैदिक ज्ञान"))}
            </h1>
            <div className="text-white/85 text-[15px] sm:text-base leading-[1.85] max-w-2xl mb-8 space-y-3 [&_a]:!text-gold">
              <RichText
                text={pick(
                  heroCfg,
                  "lead",
                  tr(
                    "Personalized guidance for Kundli, Prashn Kundli, matching, Puja, Paath, Yagya, Vastu, pilgrimage and important life decisions.",
                    "कुंडली, प्रश्न कुंडली, मिलान, पूजा, पाठ, यज्ञ, वास्तु, तीर्थ यात्रा और जीवन के महत्वपूर्ण निर्णयों के लिए व्यक्तिगत मार्गदर्शन।"
                  )
                )}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {anchorLink(
                cta1Url,
                "inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-lg bg-gold text-on-gold text-sm uppercase tracking-wider font-bold transition-colors hover:brightness-110",
                pick(heroBox, "cta1Label", tr("Book Your Consultation", "परामर्श बुक करें"))
              )}
              {cta2Visible && anchorLink(cta2Url, btnGhost, pick(heroBox, "cta2Label", tr("Free Kundli", "निःशुल्क कुंडली")))}
            </div>
            {homeCfg.showSocialStrip !== false && <SocialLinks tone="light" className="mt-7" />}
          </div>
        </div>
      </section>
      )}

      {/* Three quick cards */}
      {on("showQuickCards") && (
        <section className="bg-surface-container">
          <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 md:grid-cols-3">
            <div className="bg-maroon text-white p-8 lg:p-10 flex flex-col gap-4 min-h-[250px]">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center border border-white/50 text-xl" aria-hidden="true">ॐ</span>
                <h3 className="font-serif text-2xl lg:text-[28px] font-bold leading-tight">{h("quick1Title", "Connect With Us", "हमसे जुड़ें")}</h3>
              </div>
              <div className="text-[13px] leading-[1.8] text-white/75 max-w-xs [&_a]:!text-gold">
                <RichText text={h("quick1Text", "Speak to the Kendra directly for consultations, bookings and any question.", "परामर्श, बुकिंग या किसी भी प्रश्न के लिए केंद्र से सीधे बात करें।")} />
              </div>
              <a href={telHref} className="font-serif text-3xl font-bold text-gold hover:underline w-fit">{phone}</a>
              <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold">
                <a href={telHref} className="text-white hover:text-gold">{tr("Call now", "अभी कॉल करें")} →</a>
                <a href={wa(tr("Namaste, I would like to talk to the Kendra.", "नमस्ते, मैं केंद्र से बात करना चाहता हूँ।"))} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gold">WhatsApp →</a>
                <a href={`mailto:${kendraEmail(settings?.email)}`} className="text-white hover:text-gold">{tr("Email", "ईमेल")} →</a>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-8 lg:p-10 flex flex-col gap-4 min-h-[250px]">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center border border-primary text-primary text-xl" aria-hidden="true">✦</span>
                <h3 className="font-serif text-2xl lg:text-[28px] font-bold leading-tight text-secondary">{h("quick2Title", "Consultation", "परामर्श")}</h3>
              </div>
              <div className="text-[13px] leading-[1.8] text-on-surface-variant max-w-xs">
                <RichText text={h("quick2Text", "Personalized Vedic guidance for important life decisions. Plans start at:", "जीवन के महत्वपूर्ण निर्णयों के लिए व्यक्तिगत वैदिक मार्गदर्शन। योजनाएँ यहाँ से शुरू:")} />
              </div>
              <ul className="text-sm divide-y divide-outline-variant">
                {planGroups.map((g) => (
                  <li key={g.slug} className="flex items-baseline justify-between gap-3 py-2">
                    <span className="text-secondary font-semibold">{isHindi ? g.titleHi : g.titleEn}</span>
                    <span className="font-serif text-xl font-bold text-primary">{rupees(g.plans[0].pricePaise)}</span>
                  </li>
                ))}
              </ul>
              <Link href="/services" className="mt-auto text-xs font-bold text-primary hover:underline w-fit">{tr("Book your consultation", "परामर्श बुक करें")} →</Link>
            </div>

            <div className="bg-saffron text-white p-8 lg:p-10 flex flex-col gap-4 min-h-[250px]">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center border border-white/60 text-xl" aria-hidden="true">✧</span>
                <h3 className="font-serif text-2xl lg:text-[28px] font-bold leading-tight">{h("quick3Title", "Vedic & Support Services", "वैदिक एवं सहायता सेवाएँ")}</h3>
              </div>
              <ul className="flex flex-wrap gap-2">
                {others.slice(0, 8).map((o) => (
                  <li key={o.slug} className="rounded-full border border-white/50 px-3 py-1 text-xs font-semibold">{isHindi ? o.titleHi : o.titleEn}</li>
                ))}
              </ul>
              <a href="#services" className="mt-auto text-xs font-bold text-white hover:underline w-fit">{tr("See all services", "सभी सेवाएँ देखें")} →</a>
            </div>
          </div>
        </section>
      )}

      {(leftBanners.length > 0 || rightBanners.length > 0) && (
        <section className="bg-surface py-8">
          <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 md:grid-cols-2 gap-6 px-5 sm:px-8">
            {leftBanners.length > 0 && <BannerSlot position="LEFT" initialBanners={leftBanners.map(toBanner)} className="h-full" />}
            {rightBanners.length > 0 && <BannerSlot position="RIGHT" initialBanners={rightBanners.map(toBanner)} className="h-full" />}
          </div>
        </section>
      )}

      {/* About */}
      {on("showAbout") && (
        <Band id="about">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative pb-8 pl-8">
              <div className="absolute bottom-0 left-0 h-3/4 w-[70%] bg-saffron" aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={String(cardsCfg.aboutImage || "").trim() || "/ref/about.webp"} alt={tr("Maharshi Kanad Jyotish Kendra", "महर्षि कणाद ज्योतिष केंद्र")} className="relative h-[360px] sm:h-[480px] lg:h-[540px] w-full object-cover" />
            </div>
            <div>
              <SectionHead
                label={h("aboutLabel", "About Maharshi Kanad Jyotish Kendra", "महर्षि कणाद ज्योतिष केंद्र के बारे में")}
                title={h("aboutTitle", "Ancient Wisdom. Personal Guidance.", "प्राचीन ज्ञान। व्यक्तिगत मार्गदर्शन।")}
                intro={
                  <RichText
                    text={h(
                      "aboutIntro",
                      "Maharshi Kanad Jyotish Kendra provides Vedic astrology, Janam Kundli, Prashn Kundli, Kundli Matching, Puja, Paath, Yagya, Vastu and connected support services.",
                      "महर्षि कणाद ज्योतिष केंद्र वैदिक ज्योतिष, जन्म कुंडली, प्रश्न कुंडली, कुंडली मिलान, पूजा, पाठ, यज्ञ, वास्तु और संबद्ध सहायता सेवाएँ प्रदान करता है।"
                    )}
                  />
                }
              />
              <ul className="grid gap-4 mb-8 -mt-4">
                {[
                  [h("feature1Title", "Traditional Vedic Approach", "पारंपरिक वैदिक पद्धति"), h("feature1Text", "Consultations structured around established Jyotish principles.", "स्थापित ज्योतिष सिद्धांतों पर आधारित परामर्श।")],
                  [h("feature2Title", "Personalized Guidance", "व्यक्तिगत मार्गदर्शन"), h("feature2Text", "Guidance is based on your submitted details and specific requirements.", "मार्गदर्शन आपके दिए विवरण और विशेष आवश्यकताओं पर आधारित है।")],
                  [h("feature3Title", "Online & Offline Support", "ऑनलाइन एवं ऑफलाइन सहयोग"), h("feature3Text", "Book online or continue directly through WhatsApp.", "ऑनलाइन बुक करें या सीधे व्हाट्सऐप पर बात करें।")],
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
              {String(cardsCfg.aboutButtonUrl || "").trim() && safeHref(String(cardsCfg.aboutButtonUrl))
                ? anchorLink(link(cardsCfg.aboutButtonUrl, "/"), btn, h("aboutButton", "Speak With Astrologer", "ज्योतिषी से बात करें"))
                : (
                    <a href={wa(tr("Namaste, I would like to speak with the astrologer.", "नमस्ते, मैं ज्योतिषी से बात करना चाहता हूँ।"))} target="_blank" rel="noopener noreferrer" className={btn}>
                      {h("aboutButton", "Speak With Astrologer", "ज्योतिषी से बात करें")}
                    </a>
                  )}
            </div>
          </div>
        </Band>
      )}

      <HomeTrustBands locale={locale} />

      {/* All services */}
      {on("showServices") && (
        <Band id="services" tone="soft">
          <SectionHead
            label={h("servicesLabel", "Our Services", "हमारी सेवाएँ")}
            title={h("servicesTitle", "Vedic, Spiritual & Support Services", "वैदिक, आध्यात्मिक एवं सहायता सेवाएँ")}
            intro={<RichText text={h("servicesIntro", "Choose any service and enquire directly on WhatsApp.", "कोई भी सेवा चुनें और सीधे व्हाट्सऐप पर पूछताछ करें।")} />}
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
                        {h("consultLabel", "Consult Now", "अभी परामर्श लें")}
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
      )}

      {/* Plan sections */}
      {on("showPlans") &&
        planGroups.map((g, gi) => {
          const dark = gi === 1;
          const titleKey = g.slug === "janam-kundli" ? "janamTitle" : g.slug === "prashna-kundli" ? "prashnTitle" : "matchingTitle";
          const introKey = g.slug === "janam-kundli" ? "janamIntro" : g.slug === "prashna-kundli" ? "prashnIntro" : "matchingIntro";
          return (
            <Band key={g.slug} id={g.slug} tone={dark ? "dark" : "light"}>
              <SectionHead
                dark={dark}
                label={isHindi ? g.titleHi : g.titleEn}
                title={
                  g.slug === "janam-kundli"
                    ? h(titleKey, "Birth Kundli Plans", "जन्म कुंडली योजनाएँ")
                    : g.slug === "prashna-kundli"
                      ? h(titleKey, "Prashn Kundli – 3 Customized Plans", "प्रश्न कुंडली – 3 अनुकूल योजनाएँ")
                      : h(titleKey, "Kundli Matching Plans", "कुंडली मिलान योजनाएँ")
                }
                intro={
                  <RichText
                    text={
                      g.slug === "janam-kundli"
                        ? h(introKey, "Choose a plan according to the depth of report and consultation required.", "रिपोर्ट और परामर्श की गहराई के अनुसार योजना चुनें।")
                        : g.slug === "prashna-kundli"
                          ? h(introKey, "For one clear question, choose the required depth of analysis.", "एक स्पष्ट प्रश्न के लिए आवश्यक गहराई की योजना चुनें।")
                          : h(introKey, "Traditional compatibility analysis for marriage planning.", "विवाह की योजना के लिए पारंपरिक अनुकूलता विश्लेषण।")
                    }
                  />
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
                        {h("selectPlanLabel", "Select Plan", "योजना चुनें")}
                      </Link>
                    </article>
                  );
                })}
              </div>
            </Band>
          );
        })}

      {/* Connected services */}
      {on("showConnected") && others.some((o) => o.actionUrl) && (
        <Band id="connected" tone="soft">
          <SectionHead
            label={h("connectedLabel", "Connected Services", "संबद्ध सेवाएँ")}
            title={h("connectedTitle", "Matrimonial & Bharat Darshan Services", "वैवाहिक एवं भारत दर्शन सेवाएँ")}
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
      {on("showTools") && (
        <Band id="tools">
          <SectionHead
            label={h("toolsLabel", "Free Tools", "निःशुल्क उपकरण")}
            title={h("toolsTitle", "Panchang, Kundli & Matching", "पंचांग, कुंडली एवं मिलान")}
            intro={<RichText text={h("toolsIntro", "Use the free tools right here. No sign-in needed.", "ये निःशुल्क उपकरण यहीं उपयोग करें। साइन-इन की ज़रूरत नहीं।")} />}
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
      )}

      {/* Kundli request */}
      {on("showRequestForm") && (
        <Band id="generator" tone="soft">
          <SectionHead
            label={h("formLabel", "Online Kundli", "ऑनलाइन कुंडली")}
            title={h("formTitle", "Kundli Request Form", "कुंडली अनुरोध फ़ॉर्म")}
            intro={<RichText text={h("formIntro", "Enter your birth details to prepare your Kundli request.", "अपनी कुंडली का अनुरोध तैयार करने के लिए जन्म विवरण भरें।")} />}
          />
          <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] bg-surface-container-lowest shadow-[0_20px_55px_rgba(76,42,25,0.12)]">
            <aside className="bg-maroon text-white p-8 sm:p-10 flex flex-col gap-5 justify-center">
              <span className="grid h-32 w-32 place-items-center rounded-full border border-gold/40 text-gold text-6xl" aria-hidden="true">ॐ</span>
              <h3 className="font-serif text-4xl font-bold">{h("formSideTitle", "Birth Chart Request", "जन्म कुंडली अनुरोध")}</h3>
              <div className="text-sm text-white/75 max-w-xs [&_a]:!text-gold">
                <RichText text={h("formSideText", "Share accurate birth details. The Kendra will contact you to confirm the plan and fee.", "सही जन्म विवरण दें। केंद्र योजना और शुल्क की पुष्टि के लिए आपसे संपर्क करेगा।")} />
              </div>
            </aside>
            <KundliRequestForm isHindi={isHindi} whatsappHref={wa(tr("Namaste, I submitted a Kundli request on the website.", "नमस्ते, मैंने वेबसाइट पर कुंडली अनुरोध भेजा है।"))} />
          </div>
        </Band>
      )}

      {/* Gallery */}
      {on("showGallery") && (
        <Band id="gallery">
          <SectionHead label={h("galleryLabel", "Gallery", "गैलरी")} title={h("galleryTitle", "Sacred Moments & Spiritual Journey", "पवित्र क्षण एवं आध्यात्मिक यात्रा")} />
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
      )}

      {/* Booking flow */}
      {on("showBooking") && (
        <Band id="booking" tone="soft">
          <SectionHead
            label={h("bookingLabel", "Booking", "बुकिंग")}
            title={h("bookingTitle", "Simple Booking & Consultation Flow", "सरल बुकिंग एवं परामर्श प्रक्रिया")}
            intro={<RichText text={h("bookingIntro", "Service selection, booking, payment and delivery are kept clear and separate.", "सेवा चयन, बुकिंग, भुगतान और डिलीवरी अलग-अलग और स्पष्ट रखे गए हैं।")} />}
          />
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              [h("step1Title", "Choose Service / Plan", "सेवा / योजना चुनें"), h("step1Text", "Select the required service or plan.", "आवश्यक सेवा या योजना चुनें।")],
              [h("step2Title", "Enter Your Details", "अपना विवरण भरें"), h("step2Text", "Sign in and enter your birth and contact details.", "साइन-इन करें और जन्म एवं संपर्क विवरण भरें।")],
              [h("step3Title", "Confirm Fee & Pay", "शुल्क देखें और भुगतान करें"), h("step3Text", "Check the final amount and pay by UPI or bank.", "अंतिम राशि देखें और UPI या बैंक से भुगतान करें।")],
              [h("step4Title", "Track & Receive", "ट्रैक करें और प्राप्त करें"), h("step4Text", "Follow the status and receive your report.", "स्थिति देखें और अपनी रिपोर्ट प्राप्त करें।")],
            ].map(([t1, d], i) => (
              <li key={i} className="bg-surface-container-lowest border-t-[3px] border-saffron p-7 min-h-[230px] list-none">
                <span className="font-serif text-5xl font-bold text-[#EADBD0]">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-serif text-2xl font-bold text-secondary mt-3 mb-2">{t1}</h3>
                <p className="text-xs leading-[1.75] text-on-surface-variant">{d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <Link href="/services" className={btn}>{h("bookingButton", "Start Booking", "बुकिंग शुरू करें")}</Link>
          </div>
        </Band>
      )}

      {/* Payment */}
      {on("showPayment") && (
        <Band id="payment">
          <SectionHead
            label={h("paymentLabel", "Payment", "भुगतान")}
            title={h("paymentTitle", "Clear & Confirmed Payment Process", "स्पष्ट एवं पुष्ट भुगतान प्रक्रिया")}
            intro={<RichText text={h("paymentIntro", "Confirm the selected service and the final payable amount before payment.", "भुगतान से पहले चुनी गई सेवा और अंतिम देय राशि की पुष्टि करें।")} />}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className={`${card} p-8 sm:p-10`}>
              <h3 className="font-serif text-3xl font-bold text-secondary mb-4">{h("payBeforeTitle", "Before You Pay", "भुगतान से पहले")}</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm leading-7 text-on-surface mb-6">
                {h(
                  "payBeforeText",
                  "Select the required service or plan.\nEnter your details and apply a promo code if you have one.\nPay by UPI, QR or bank transfer and enter the payment reference.",
                  "आवश्यक सेवा या योजना चुनें।\nअपना विवरण भरें और प्रोमो कोड हो तो लगाएँ।\nUPI, QR या बैंक ट्रांसफर से भुगतान करें और भुगतान संदर्भ संख्या भरें।"
                )
                  .split("\n")
                  .filter((l) => l.trim())
                  .map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
              </ol>
              <Link href="/offers" className="inline-flex items-center min-h-[44px] text-xs font-bold text-primary hover:underline">{tr("See current offers", "वर्तमान ऑफ़र देखें")}</Link>
            </article>
            <article className="bg-maroon text-white p-8 sm:p-10">
              <h3 className="font-serif text-3xl font-bold mb-4">{h("payGatewayTitle", "Payment Gateway", "पेमेंट गेटवे")}</h3>
              <div className="text-sm leading-7 text-white/80 space-y-3 [&_a]:!text-gold">
                <RichText
                  text={h(
                    "payGatewayText",
                    "Razorpay, UPI or another payment gateway can be connected when merchant credentials are available. Until then, payments are verified by the Kendra after you enter your payment reference.",
                    "मर्चेंट क्रेडेंशियल मिलने पर रेज़रपे, UPI या अन्य पेमेंट गेटवे जोड़ा जा सकता है। तब तक भुगतान संदर्भ संख्या भरने के बाद केंद्र द्वारा सत्यापित किया जाता है।"
                  )}
                />
              </div>
            </article>
          </div>
        </Band>
      )}

      {/* Reviews */}
      {on("showReviews") && testimonials.length > 0 && (
        <Band id="reviews" tone="soft">
          <SectionHead label={h("reviewsLabel", "Reviews", "समीक्षाएँ")} title={h("reviewsTitle", "Words From Our Visitors", "हमारे आगंतुकों के शब्द")} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <figure key={t.id} className={`${card} p-7 m-0`}>
                <blockquote className="text-sm leading-[1.85] text-on-surface mb-4">{stripRich(isHindi ? t.quoteHi : t.quoteEn)}</blockquote>
                <figcaption className="font-serif text-xl font-bold text-secondary">{isHindi ? t.authorNameHi : t.authorNameEn}</figcaption>
              </figure>
            ))}
          </div>
        </Band>
      )}

      <HomeMoreBands locale={locale} />

      {/* FAQ */}
      {on("showFaq") && faqList.length > 0 && (
        <Band id="faq">
          <SectionHead label={h("faqLabel", "FAQ", "सामान्य प्रश्न")} title={h("faqTitle", "Frequently Asked Questions", "अक्सर पूछे जाने वाले प्रश्न")} />
          <div className="max-w-4xl">
            {faqList.map((f) => (
              <details key={f.q} className="group border-b border-outline-variant">
                <summary className="flex min-h-[76px] cursor-pointer list-none items-center justify-between gap-4 font-serif text-xl sm:text-2xl font-bold text-secondary">
                  <span>{f.q}</span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center border border-primary text-primary transition-transform group-open:rotate-45 group-open:bg-primary group-open:text-white" aria-hidden="true">
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <div className="pb-6 pr-12 text-sm leading-[1.85] text-on-surface-variant space-y-2">
                  <RichText text={f.a} />
                </div>
              </details>
            ))}
          </div>
        </Band>
      )}

      {/* Contact */}
      {on("showContact") && (
        <Band id="contact" tone="soft">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] shadow-[0_20px_55px_rgba(76,42,25,0.12)]">
            <div className="bg-maroon text-white p-8 sm:p-12 flex flex-col gap-6">
              <div>
                <span className="block text-xs font-bold uppercase tracking-[0.2em] mb-3 text-gold">{h("contactLabel", "Reach Out & Connect", "संपर्क करें")}</span>
                <h2 className="font-serif text-4xl sm:text-5xl font-semibold leading-[1.05] mb-3">{h("contactTitle", "Begin Your Consultation", "अपना परामर्श शुरू करें")}</h2>
                <div className="text-sm leading-[1.85] text-white/75 max-w-md [&_a]:!text-gold space-y-2">
                  <RichText text={h("contactIntro", "Contact Maharshi Kanad Jyotish Kendra for all astrology, ritual, travel and support enquiries.", "ज्योतिष, अनुष्ठान, यात्रा और सहायता संबंधी सभी पूछताछ के लिए महर्षि कणाद ज्योतिष केंद्र से संपर्क करें।")} />
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Phone className="h-4 w-4 mt-1 text-gold" aria-hidden="true" />
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gold">{tr("Phone", "फ़ोन")}</div>
                  <a href={telHref} className="font-serif text-3xl font-bold hover:underline">{phone}</a>
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-3">
                <Link href="/contact" className="inline-flex items-center min-h-[48px] px-6 rounded bg-gold text-on-gold text-xs font-bold uppercase tracking-wider hover:brightness-110">{h("contactButton", "Open Enquiry Form", "पूछताछ फ़ॉर्म खोलें")}</Link>
                <a href={wa(tr("Namaste, I would like to book a consultation.", "नमस्ते, मैं परामर्श बुक करना चाहता हूँ।"))} target="_blank" rel="noopener noreferrer" className={btnGhost}>WhatsApp</a>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-8 sm:p-12 flex flex-col gap-5">
              <h3 className="font-serif text-3xl font-bold text-secondary">{h("helpTitle", "How we can help", "हम कैसे सहायता कर सकते हैं")}</h3>
              <ul className="grid gap-4 text-sm">
                {[
                  [h("help1Title", "Kundli, matching and Prashn", "कुंडली, मिलान और प्रश्न"), h("help1Text", "Choose a plan and book online.", "योजना चुनें और ऑनलाइन बुक करें।")],
                  [h("help2Title", "Puja, Paath, Yagya and Vastu", "पूजा, पाठ, यज्ञ और वास्तु"), h("help2Text", "Tell us your requirement on WhatsApp.", "अपनी आवश्यकता व्हाट्सऐप पर बताएँ।")],
                  [h("help3Title", "Travel and support services", "यात्रा एवं सहायता सेवाएँ"), h("help3Text", "Bharat Darshan, vehicle, driver and ITR help desk.", "भारत दर्शन, वाहन, ड्राइवर और आईटीआर हेल्प डेस्क।")],
                ].map(([t1, dd]) => (
                  <li key={t1} className="flex gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center bg-primary-container text-primary" aria-hidden="true"><Check className="h-4 w-4" /></span>
                    <span className="flex flex-col"><strong className="font-serif text-xl font-bold text-secondary">{t1}</strong><small className="text-xs text-on-surface-variant">{dd}</small></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Band>
      )}
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
