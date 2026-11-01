import { Link } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth/guards";
import { DEFAULT_GUIDES, GUIDE_SLUGS } from "@/lib/guides/defaults";
import { loadGuideVisuals } from "@/lib/guides/visuals";
import { GuideVisualsManager } from "@/features/admin/guides/GuideVisualsManager";

export const dynamic = "force-dynamic";

export default async function AdminGuidesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  await requireAdmin("/admin/guides", locale);
  const isHindi = locale === "hi";
  const t = (en: string, hi: string) => (isHindi ? hi : en);

  const guides = await Promise.all(
    GUIDE_SLUGS.map(async (slug) => ({
      slug,
      titleEn: DEFAULT_GUIDES[slug].titleEn,
      titleHi: DEFAULT_GUIDES[slug].titleHi,
      visuals: await loadGuideVisuals(slug),
    }))
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">{t("Guides & visuals", "गाइड व चित्र")}</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {t(
            "Users and associates view, download or print their guide from their dashboard. Here you add the pictures and videos. The words are edited in ",
            "उपयोगकर्ता और एसोसिएट अपने डैशबोर्ड से गाइड देख, डाउनलोड या प्रिंट कर सकते हैं। यहाँ चित्र और वीडियो जोड़ें। शब्द यहाँ बदलें: "
          )}
          <Link href="/admin/pages" className="font-bold text-primary hover:underline">{t("Pages & legal", "पेज व कानूनी")}</Link>.
        </p>
      </div>
      <GuideVisualsManager guides={guides} isHindi={isHindi} />
    </div>
  );
}
