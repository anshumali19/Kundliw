import { Pressable, StyleSheet, View } from "react-native";
import { FadeIn, Picture } from "@/components/ContentKit";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui";
import type { HomeContent } from "@/lib/home";
import { useLanguage } from "@/lib/i18n";
import { openLink, resolveLink } from "@/lib/links";
import { colors, radius, space } from "@/theme";

type Banner = NonNullable<HomeContent["banners"]>[number];

/**
 * The website's banners (Admin > Banners). TOP ones are a slim announcement strip, the others are cards with their
 * picture. Pass the positions to show, so the home screen can place each group where the website does.
 */
export function Banners({ banners, positions }: { banners: HomeContent["banners"]; positions: Banner["position"][] }) {
  const { t, pick } = useLanguage();
  const list = (banners ?? []).filter((b) => positions.includes(b.position));
  if (list.length === 0) return null;
  return (
    <View style={{ gap: space.md }}>
      {list.map((b, i) => {
        const title = pick(b.titleEn, b.titleHi);
        const sub = pick(b.subtitleEn, b.subtitleHi);
        const goes = resolveLink(b.linkUrl).type !== "none";
        if (b.position === "TOP") {
          return (
            <FadeIn key={b.id} index={i}>
              <Pressable accessibilityRole={goes ? "button" : "text"} disabled={!goes} onPress={() => openLink(b.linkUrl)} style={styles.strip}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{t("bannerBadge")}</Text>
                </View>
                <Text style={styles.stripText} numberOfLines={2}>
                  {title}
                </Text>
              </Pressable>
            </FadeIn>
          );
        }
        return (
          <FadeIn key={b.id} index={i}>
            <View style={styles.card}>
              <Picture src={b.imageUrl} height={150} />
              <View style={{ padding: space.lg, gap: space.sm }}>
                <View style={[styles.badge, { alignSelf: "flex-start", backgroundColor: colors.primaryContainer }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>{t("bannerBadge")}</Text>
                </View>
                <Text style={styles.cardTitle}>{title}</Text>
                {sub ? <Text style={styles.cardSub}>{sub}</Text> : null}
                {goes ? <Button label={t("viewDetails")} variant="outline" onPress={() => openLink(b.linkUrl)} /> : null}
              </View>
            </View>
          </FadeIn>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: { flexDirection: "row", alignItems: "center", gap: space.md, backgroundColor: colors.goldSoft, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm + 2, borderWidth: 1, borderColor: colors.gold },
  badge: { backgroundColor: colors.brand, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: "700", color: colors.onBrand, textTransform: "uppercase" },
  stripText: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.maroonDeep },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.outlineVariant },
  cardTitle: { fontSize: 18, fontWeight: "700", color: colors.heading, lineHeight: 25 },
  cardSub: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
});
