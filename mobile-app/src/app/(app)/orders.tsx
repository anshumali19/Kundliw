import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Button, ErrorText } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { orderStatusLabel, paymentStatusLabel, useLanguage } from "@/lib/i18n";
import { needsPayment, type MobileOrder } from "@/lib/orders";
import { useSession } from "@/lib/session";
import { formatPaise } from "@/lib/validation";
import { colors, radius, space, TOUCH } from "@/theme";

/** The customer's own orders, newest first. */
export default function OrdersScreen() {
  const { api } = useSession();
  const { t, lang, pick } = useLanguage();
  const [orders, setOrders] = useState<MobileOrder[] | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      setOrders((await api.request<{ orders: MobileOrder[] }>("/api/mobile/v1/orders")).orders);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
      setOrders((o) => o ?? []);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={orders ?? []}
      keyExtractor={(o) => o.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={colors.brand}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }
      ListHeaderComponent={
        <View style={{ gap: space.md }}>
          <ErrorText>{error}</ErrorText>
          {error ? <Button label={t("retry")} variant="outline" onPress={load} /> : null}
        </View>
      }
      ListEmptyComponent={
        orders === null ? <ActivityIndicator color={colors.brand} style={{ marginTop: space.xl }} /> : error ? undefined : <Text style={styles.note}>{t("noOrders")}</Text>
      }
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: "/orders/[id]", params: { id: item.id } })}
          style={({ pressed }) => [styles.card, pressed && { backgroundColor: colors.surfaceContainer }]}
        >
          <Text style={styles.number}>
            {t("orderNo")} {item.orderNumber}
          </Text>
          <Text style={styles.title}>
            {pick(item.serviceTitleEn, item.serviceTitleHi)} · {pick(item.planTitleEn, item.planTitleHi)}
          </Text>
          <Text style={styles.amount}>{formatPaise(item.netAmountPaise)}</Text>
          <Text style={[styles.status, needsPayment(item) && { color: colors.error }]}>
            {item.cancelledAt ? t("cancelled") : `${orderStatusLabel(lang, item.status)} · ${paymentStatusLabel(lang, item.paymentStatus)}`}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md },
  note: { fontSize: 14, color: colors.textMuted },
  card: {
    minHeight: TOUCH,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.xs,
  },
  number: { fontSize: 13, color: colors.textMuted, fontWeight: "600" },
  title: { fontSize: 16, fontWeight: "700", color: colors.heading },
  amount: { fontSize: 16, fontWeight: "800", color: colors.primary },
  status: { fontSize: 14, color: colors.text, fontWeight: "600" },
});
