import { Link } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { getSection } from "@/lib/siteConfig/service";
import { RichText } from "@/components/content/RichText";
import { Band, SectionHead } from "@/components/home/HomeParts";
import { InstallPrompt } from "@/components/home/InstallPrompt";
import { stripRich } from "@/lib/content/richText";
import { isSafeImageSrc } from "@/lib/content/media";
import { BadgeCheck, BookOpen, FileText, HeartHandshake, Languages, Lock, MessageCircle, ScrollText, Sparkles } from "lucide-react";

type Cfg = Record<string, string | boolean | number>;

const card = "bg-surface-container-lowest border border-outline-variant shadow-[0_18px_45px_rgba(73,38,24,0.09)]";

function helpers(cfg: Cfg, isHindi: boolean) {
  const tr = (en: string, hi: string) => (isHindi ? hi : en);
  // The admin's own wording when set, the standard wording otherwise
  const h = (key: string, en: string, hi: string) => String(cfg[key + (isHindi ? "Hi" : "En")] || "").trim() || tr(en, hi);
  return { tr, h };
}

/** Numbers and 'why choose us'. Sits right after the About block. */
export async function HomeTrustBands({ locale }: { locale: string }) {
  const isHindi = locale === "hi";
  const cfg = (await getSection("homeExtras")) as Cfg;
  const { tr, h } = helpers(cfg, isHindi);

  const stats = [1, 2, 3, 4]
    .map((n) => ({ value: String(cfg[`stat${n}Value`] || "").trim(), label: h(`stat${n}Label`, "", "") }))
    .filter((s) => s.value && s.label);

  const icons = [Sparkles, HeartHandshake, Lock, BadgeCheck, MessageCircle, Languages];
  const whyDefaults: [string, string, string, string][] = [
    ["Traditional Vedic approach", "पारंपरिक वैदिक पद्धति", "Guidance built on established Jyotish principles.", "स्थापित ज्योतिष सिद्धांतों पर आधारित मार्गदर्शन।"],
    ["Personal attention", "व्यक्तिगत ध्यान", "Every reading uses your own birth details and your question.", "हर परामर्श आपके अपने जन्म विवरण और प्रश्न पर आधारित है।"],
    ["Your details stay private", "आपकी जानकारी सुरक्षित", "Your birth details and files are kept private and shared with no one.", "आपके जन्म विवरण और फ़ाइलें निजी रखी जाती हैं।"],
    ["Clear prices, proper invoice", "स्पष्ट मूल्य, उचित रसीद", "See the price before you pay and get an invoice for every order.", "भुगतान से पहले मूल्य देखें और हर ऑर्डर की रसीद पाएँ।"],
    ["Support on WhatsApp", "व्हाट्सऐप पर सहयोग", "Ask a question, share details or follow up directly on WhatsApp.", "सीधे व्हाट्सऐप पर प्रश्न पूछें, विवरण भेजें और जानकारी लें।"],
    ["Hindi and English", "हिंदी और अंग्रेज़ी", "The whole site and your reports are available in both languages.", "पूरी साइट और रिपोर्ट दोनों भाषाओं में उपलब्ध हैं।"],
  ];
  const why = whyDefaults.map((d, i) => ({
    Icon: icons[i],
    title: h(`why${i + 1}Title`, d[0], d[1]),
    text: h(`why${i + 1}Text`, d[2], d[3]),
  }));

  const showStats = cfg.showStats === true && stats.length > 0;
  const showWhy = cfg.showWhy !== false;
  if (!showStats && !showWhy) return null;

  return (
    <>
      {showStats && (
        <section id="numbers" className="bg-maroon text-white py-12 scroll-mt-28">
          <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
            {(String(cfg.statsTitleEn || cfg.statsTitleHi || "").trim() || String(cfg.statsLabelEn || cfg.statsLabelHi || "").trim()) && (
              <SectionHead dark label={h("statsLabel", "", "")} title={h("statsTitle", "", "")} />
            )}
            <dl className={`grid grid-cols-2 ${stats.length > 2 ? "lg:grid-cols-4" : ""} gap-6 text-center`}>
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-serif text-4xl sm:text-5xl font-bold text-gold">{s.value}</dd>
                  <div className="mt-1 text-xs uppercase tracking-widest text-white/80" aria-hidden="true">{s.label}</div>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {showWhy && (
        <Band id="why-us" tone="soft">
          <SectionHead
            label={h("whyLabel", "Why Choose Us", "हमें क्यों चुनें")}
            title={h("whyTitle", "Trust Built on Care and Clarity", "भरोसा, जो सावधानी और स्पष्टता से बना है")}
            intro={cfg.whyIntroEn || cfg.whyIntroHi ? <RichText text={h("whyIntro", "", "")} /> : undefined}
          />
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {why.map(({ Icon, title, text }) => (
              <li key={title} className={`${card} p-6 flex gap-4`}>
                <span className="grid h-11 w-11 shrink-0 place-items-center bg-primary-container text-primary" aria-hidden="true">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex flex-col gap-1 min-w-0">
                  <strong className="font-serif text-xl font-bold text-secondary">{title}</strong>
                  <small className="text-xs leading-relaxed text-on-surface-variant">{text}</small>
                </span>
              </li>
            ))}
          </ul>
          <p className="sr-only">{tr("Reasons to choose Maharshi Kanad Jyotish Kendra", "महर्षि कणाद ज्योतिष केंद्र को चुनने के कारण")}</p>
        </Band>
      )}
    </>
  );
}

/** Guidance, credentials, blog, founder and the install tip. Sits before the FAQ. */
export async function HomeMoreBands({ locale }: { locale: string }) {
  const isHindi = locale === "hi";
  const cfg = (await getSection("homeExtras")) as Cfg;
  const { tr, h } = helpers(cfg, isHindi);

  const tipDefaults: [string, string, string, string][] = [
    ["Keep your birth details ready", "जन्म विवरण तैयार रखें", "Date, exact time and place of birth. A birth certificate or hospital record is the best source.", "जन्म की तारीख, सही समय और स्थान। जन्म प्रमाणपत्र या अस्पताल का रिकॉर्ड सबसे भरोसेमंद है।"],
    ["Write your question clearly", "अपना प्रश्न स्पष्ट लिखें", "One focused question, such as marriage, career or health, gives a clearer answer.", "विवाह, करियर या स्वास्थ्य जैसा एक स्पष्ट प्रश्न बेहतर उत्तर देता है।"],
    ["Choose a quiet time for the call", "कॉल के लिए शांत समय चुनें", "Pick a slot when you can talk without interruption and keep a pen and paper nearby.", "ऐसा समय चुनें जब आप बिना रुकावट बात कर सकें, और पास में कलम-कागज़ रखें।"],
    ["Keep your order number", "ऑर्डर नंबर साथ रखें", "Your order number lets you track the order and reach us quickly with any question.", "ऑर्डर नंबर से आप ऑर्डर ट्रैक कर सकते हैं और किसी भी प्रश्न पर जल्दी संपर्क कर सकते हैं।"],
  ];
  const tips = tipDefaults.map((d, i) => ({ title: h(`tip${i + 1}Title`, d[0], d[1]), text: h(`tip${i + 1}Text`, d[2], d[3]) }));

  const showTips = cfg.showTips !== false;
  const showCred = cfg.showCredentials !== false;
  const showBlog = cfg.showBlog !== false;
  const showFounder = cfg.showFounder !== false;
  const showInstall = cfg.showInstall !== false;

  const [creds, posts, founder] = await Promise.all([
    showCred ? prisma.credential.findMany({ where: { isActive: true }, orderBy: { orderIndex: "asc" }, take: 8 }).catch(() => []) : Promise.resolve([]),
    showBlog ? prisma.blogPost.findMany({ where: { isPublished: true }, orderBy: { publishedAt: "desc" }, take: 3 }).catch(() => []) : Promise.resolve([]),
    showFounder ? prisma.founderProfile.findUnique({ where: { id: "default" } }).catch(() => null) : Promise.resolve(null),
  ]);

  // Template text from a fresh database is never shown to visitors
  const founderReady =
    !!founder && founder.isActive && founder.nameEn.trim() !== "" && founder.nameEn !== "Founder Name" && !/admin panel/i.test(founder.bioEn) && !/एडमिन/.test(founder.bioHi);

  return (
    <>
      {showTips && (
        <Band id="guidance">
          <SectionHead label={h("tipsLabel", "Before You Book", "बुकिंग से पहले")} title={h("tipsTitle", "Get the Most From Your Consultation", "अपने परामर्श का पूरा लाभ लें")} />
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tips.map((t, i) => (
              <li key={t.title} className={`${card} p-6 flex gap-4`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-saffron text-on-saffron font-bold" aria-hidden="true">{i + 1}</span>
                <span className="flex flex-col gap-1 min-w-0">
                  <strong className="font-serif text-xl font-bold text-secondary">{t.title}</strong>
                  <small className="text-xs leading-relaxed text-on-surface-variant">{t.text}</small>
                </span>
              </li>
            ))}
          </ol>
        </Band>
      )}

      {showCred && creds.length > 0 && (
        <Band id="credentials" tone="soft">
          <SectionHead label={h("credLabel", "Credentials", "प्रमाणपत्र")} title={h("credTitle", "Registered and Verified", "पंजीकृत और सत्यापित")} />
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {creds.map((c) => (
              <li key={c.id}>
                <Link href="/credentials" className={`${card} p-5 h-full flex flex-col gap-2 hover:border-saffron transition-colors`}>
                  <ScrollText className="h-6 w-6 text-primary" aria-hidden="true" />
                  <strong className="font-serif text-lg font-bold text-secondary">{isHindi ? c.titleHi : c.titleEn}</strong>
                  {c.documentNumber && <span className="text-xs text-on-surface-variant break-all">{c.documentNumber}</span>}
                  <span className="mt-auto pt-2 text-xs font-bold text-primary">{tr("View document →", "दस्तावेज़ देखें →")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Band>
      )}

      {showBlog && posts.length > 0 && (
        <Band id="blog">
          <SectionHead label={h("blogLabel", "From the Blog", "ब्लॉग से")} title={h("blogTitle", "Guidance and Insights", "मार्गदर्शन और जानकारी")} />
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((p) => {
              const excerpt = stripRich((isHindi ? p.excerptHi : p.excerptEn) || "");
              return (
                <li key={p.id}>
                  <Link href={`/blogs/${p.slug}`} className={`${card} h-full flex flex-col overflow-hidden hover:border-saffron transition-colors`}>
                    <div className="h-40 bg-gradient-to-br from-gold/40 via-saffron/20 to-maroon/20 relative">
                      {p.coverImage && isSafeImageSrc(p.coverImage) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.coverImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="p-5 flex flex-col gap-2 flex-1">
                      <strong className="font-serif text-xl font-bold text-secondary">{isHindi ? p.titleHi : p.titleEn}</strong>
                      {excerpt && <p className="text-xs leading-relaxed text-on-surface-variant line-clamp-3">{excerpt}</p>}
                      <span className="mt-auto pt-2 text-xs font-bold text-primary inline-flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                        {tr("Read more →", "आगे पढ़ें →")}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-8">
            <Link href="/blogs" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              <FileText className="h-4 w-4" aria-hidden="true" />
              {tr("All articles", "सभी लेख")}
            </Link>
          </div>
        </Band>
      )}

      {showFounder && founderReady && founder && (
        <Band id="founder-block" tone="soft">
          <div className={`${card} grid grid-cols-1 md:grid-cols-[260px_1fr] gap-0 overflow-hidden`}>
            <div className="bg-gradient-to-br from-gold/40 via-saffron/20 to-maroon/20 min-h-[220px] relative">
              {founder.photoUrl && isSafeImageSrc(founder.photoUrl) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={founder.photoUrl} alt={isHindi ? founder.nameHi : founder.nameEn} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              )}
            </div>
            <div className="p-7 sm:p-10 flex flex-col gap-3 justify-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{h("founderLabel", "Meet Our Founder", "हमारे संस्थापक से मिलें")}</span>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">{isHindi ? founder.nameHi : founder.nameEn}</h3>
              <div className="text-sm text-on-surface-variant">{isHindi ? founder.designationHi : founder.designationEn}</div>
              {(cfg.founderQuoteEn || cfg.founderQuoteHi) && (
                <blockquote className="border-l-4 border-saffron pl-4 text-sm italic leading-relaxed text-on-surface">{h("founderQuote", "", "")}</blockquote>
              )}
              <div>
                <Link href="/founder" className="inline-flex items-center justify-center min-h-[48px] px-6 rounded bg-brand text-on-brand text-xs font-bold uppercase tracking-wider">
                  {h("founderButton", "Read More", "आगे पढ़ें")}
                </Link>
              </div>
            </div>
          </div>
        </Band>
      )}

      {showInstall && (
        <InstallPrompt
          title={h("installTitle", "Keep this site on your phone", "इस साइट को अपने फ़ोन में रखें")}
          text={h("installText", "Add it to your home screen for one-tap booking and order tracking.", "होम स्क्रीन पर जोड़ें, ताकि एक टैप में बुकिंग और ऑर्डर ट्रैकिंग हो सके।")}
          installLabel={tr("Install", "इंस्टॉल करें")}
          iosText={tr("On iPhone: tap the Share button, then 'Add to Home Screen'.", "iPhone पर: Share बटन दबाएँ, फिर 'Add to Home Screen' चुनें।")}
          closeLabel={tr("Close", "बंद करें")}
        />
      )}
    </>
  );
}
