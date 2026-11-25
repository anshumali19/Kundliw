import { StyleSheet } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Blocks, ContentScreen, FadeIn, RichText } from "@/components/ContentKit";
import { Text } from "@/components/Text";
import { useContent, type CustomPageContent } from "@/lib/content";
import { useLanguage } from "@/lib/i18n";
import { colors, space } from "@/theme";

/** One custom page made in Admin > Pages: its words, then the pictures, videos and buttons the admin stacked on it. */
export default function CustomPageScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t, pick } = useLanguage();
  const { data, error, reload, loading } = useContent<CustomPageContent>(`page/${encodeURIComponent(String(slug))}`);
  return (
    <ContentScreen loading={loading} error={error} reload={reload}>
      <Stack.Screen options={{ title: data ? pick(data.titleEn, data.titleHi) : t("morePages") }} />
      {data ? (
        <>
          <FadeIn>
            <Text serif style={styles.title}>
              {pick(data.titleEn, data.titleHi)}
            </Text>
          </FadeIn>
          {pick(data.contentEn, data.contentHi) ? (
            <FadeIn index={1}>
              <RichText text={pick(data.contentEn, data.contentHi)} />
            </FadeIn>
          ) : null}
          <Blocks blocks={data.blocks} />
        </>
      ) : null}
    </ContentScreen>
  );
}

const styles = StyleSheet.create({ title: { fontSize: 26, color: colors.heading, lineHeight: 34, marginBottom: space.sm } });
