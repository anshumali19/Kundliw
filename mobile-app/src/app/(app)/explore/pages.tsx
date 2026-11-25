import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ContentScreen, FadeIn } from "@/components/ContentKit";
import { Text } from "@/components/Text";
import { TapCard } from "@/components/ui";
import { useContent, type PagesContent } from "@/lib/content";
import { useLanguage } from "@/lib/i18n";
import { colors, space } from "@/theme";
import { StyleSheet } from "react-native";

/** The custom pages the admin made (Admin > Pages) and chose to show in the app. */
export default function PagesScreen() {
  const { pick } = useLanguage();
  const { data, error, reload, loading } = useContent<PagesContent>("pages");
  return (
    <ContentScreen loading={loading} error={error} reload={reload} empty={!!data && data.items.length === 0}>
      {data?.items.map((p, i) => (
        <FadeIn key={p.slug} index={i}>
          <TapCard onPress={() => router.push({ pathname: "/explore/page/[slug]", params: { slug: p.slug } } as never)} style={styles.row}>
            <Ionicons name="document-text" size={22} color={colors.maroon} />
            <Text style={styles.title}>{pick(p.titleEn, p.titleHi)}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.outline} />
          </TapCard>
        </FadeIn>
      ))}
    </ContentScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: space.md },
  title: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.heading, lineHeight: 22 },
});
