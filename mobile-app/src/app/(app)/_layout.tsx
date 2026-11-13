import { Stack } from "expo-router";
import { useLanguage } from "@/lib/i18n";
import { colors } from "@/theme";

/** The signed-in part of the app. */
export default function AppLayout() {
  const { t } = useLanguage();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.maroon },
        headerTintColor: colors.onMaroon,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Screen name="index" options={{ title: t("home") }} />
      <Stack.Screen name="service/[slug]" options={{ title: t("services") }} />
      <Stack.Screen name="book" options={{ title: t("bookingTitle") }} />
      <Stack.Screen name="pay/[id]" options={{ title: t("payTitle") }} />
      <Stack.Screen name="orders" options={{ title: t("myOrders") }} />
      <Stack.Screen name="orders/[id]" options={{ title: t("orderNo") }} />
      <Stack.Screen name="account" options={{ title: t("account") }} />
      <Stack.Screen name="delete-account" options={{ title: t("deleteTitle") }} />
    </Stack>
  );
}
