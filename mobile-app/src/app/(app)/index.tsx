import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Button, ErrorText } from "@/components/ui";
import { useLanguage } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useCatalog } from "@/lib/useCatalog";
import { formatPaise } from "@/lib/validation";
import { colors, radius, space, TOUCH } from "@/theme";

export default function HomeScreen() {
  const { user } = useSession();
  const { t, lang, pick } = useLanguage();
  const { catalog, error, reload, loading } = useCatalog();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={catalog?.services ?? []}
      keyExtractor={(s) => s.slug}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
      ListHeaderComponent={
        <View style={{ gap: space.md }}>
          <View style={styles.hello}>
            <View style={{ flex: 1 }}>
              <Text style={styles.namaste}>{t("namaste")}</Text>
              <Text style={styles.name}>{user?.name || user?.phone || user?.email}</Text>
            </View>
            <Button label={t("account")} variant="outline" onPress={() => router.push("/account")} />
          </View>
          <Button label={t("myOrders")} variant="outline" onPress={() => router.push("/orders")} />
          <Text style={styles.heading}>{t("services")}</Text>
          <Text style={styles.note}>{t("tapToBook")}</Text>
          <ErrorText>{error}</ErrorText>
          {error ? <Button label={t("retry")} variant="outline" onPress={reload} /> : null}
        </View>
      }
      ListEmptyComponent={
        loading ? <ActivityIndicator color={colors.brand} style={{ marginTop: space.xl }} /> : error ? undefined : <Text style={styles.note}>{t("noServices")}</Text>
      }
      renderItem={({ item }) => {
        const min = item.plans.length ? Math.min(...item.plans.map((p) => p.pricePaise)) : null;
        const count = item.plans.length;
        return (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/service/[slug]", params: { slug: item.slug } })}
            style={({ pressed }) => [styles.service, pressed && { backgroundColor: colors.surfaceContainer }]}
          >
            <Text style={styles.serviceTitle}>{pick(item.titleEn, item.titleHi)}</Text>
            <Text style={styles.serviceMeta}>
              {min !== null ? `${t("from")} ${formatPaise(min)} · ` : ""}
              {count} {lang === "en" && count === 1 ? t("plan") : t("plans")}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md },
  hello: { flexDirection: "row", alignItems: "center", gap: space.md },
  namaste: { fontSize: 14, color: colors.textMuted },
  name: { fontSize: 20, fontWeight: "700", color: colors.heading },
  heading: { fontSize: 18, fontWeight: "700", color: colors.heading, marginTop: space.sm },
  note: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  service: {
    minHeight: TOUCH,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.xs,
  },
  serviceTitle: { fontSize: 16, fontWeight: "700", color: colors.heading },
  serviceMeta: { fontSize: 14, color: colors.primary, fontWeight: "600" },
});
