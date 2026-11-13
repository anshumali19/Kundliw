import { Stack } from "expo-router";
import { useLanguage } from "@/lib/i18n";
import { colors, fonts } from "@/theme";

/** The signed-in part of the app: the main tabs, and the screens that open over them. */
export default function AppLayout() {
  const { t } = useLanguage();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.maroon },
        headerTintColor: colors.onMaroon,
        headerTitleStyle: { fontFamily: fonts.semibold, fontSize: 17 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.surface },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="service/[slug]" options={{ title: t("services") }} />
      <Stack.Screen name="book" options={{ title: t("bookingTitle") }} />
      <Stack.Screen name="pay/[id]" options={{ title: t("payTitle") }} />
      <Stack.Screen name="orders/[id]" options={{ title: t("orderNo") }} />
      <Stack.Screen name="tickets" options={{ title: t("support") }} />
      <Stack.Screen name="tickets/new" options={{ title: t("newTicket") }} />
      <Stack.Screen name="tickets/[id]" options={{ title: t("ticket") }} />
      <Stack.Screen name="delete-account" options={{ title: t("deleteTitle") }} />
    </Stack>
  );
}
