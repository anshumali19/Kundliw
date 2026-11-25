import { useState } from "react";
import { ActivityIndicator, Linking, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { Text } from "@/components/Text";
import { API_URL } from "@/lib/config";
import { useLanguage } from "@/lib/i18n";
import { colors, space } from "@/theme";

/**
 * The website's admin panel inside the app, so the Kendra's administrator can change the website and the app from a
 * phone. It is the same panel and the same sign-in as on the website (the administrator signs in on the page that opens);
 * the app itself never holds an administrator's password or sign-in.
 */
export default function AdminScreen() {
  const { t, lang } = useLanguage();
  const [busy, setBusy] = useState(true);
  const url = `${API_URL}/${lang}/auth/signin/super-admin?callbackUrl=${encodeURIComponent(`/${lang}/admin`)}`;
  const origin = new URL(API_URL).host;

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.note}>{t("adminPanelNote")}</Text>
      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: url }}
          style={{ flex: 1, backgroundColor: "#fff" }}
          onLoadStart={() => setBusy(true)}
          onLoadEnd={() => setBusy(false)}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          setSupportMultipleWindows={false}
          // Stay on the Kendra's own site; anything else opens in the phone's browser
          onShouldStartLoadWithRequest={(req) => {
            try {
              if (new URL(req.url).host === origin || req.url === "about:blank") return true;
            } catch {
              // fall through
            }
            Linking.openURL(req.url).catch(() => undefined);
            return false;
          }}
        />
        {busy ? (
          <View style={styles.busy} pointerEvents="none">
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  note: { fontSize: 12, color: colors.textMuted, lineHeight: 18, padding: space.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  busy: { ...(StyleSheet.absoluteFill as object), alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.6)" },
});
