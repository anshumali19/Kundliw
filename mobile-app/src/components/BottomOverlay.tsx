import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Linking, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AssistantSheet } from "@/components/AssistantSheet";
import { Text } from "@/components/Text";
import { isOn, pickText, useHome } from "@/lib/home";
import { useLanguage } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/links";
import { FAB_COLORS, tickerColors, tickerText } from "@/lib/overlay";
import { colors, radius, space } from "@/theme";

/** Height of the running strip, so the screens above it leave room for it */
export const TICKER_HEIGHT = 40;

/**
 * What the website's mobile view shows on every page: the running announcement strip at the bottom, and four
 * buttons above it (Call and WhatsApp on the left, Ask AI and Chat on the right). The notices come from
 * Admin > Marquee, and each button is switched on or off under Admin > Settings > Floating buttons.
 */
export function BottomOverlay({ bottom }: { bottom: number }) {
  const { t, lang } = useLanguage();
  const { data } = useHome();
  const [sheet, setSheet] = useState<"ai" | "chat" | null>(null);
  const [closed, setClosed] = useState(false);

  const floating = data?.floating;
  const flag = (key: string) => isOn(floating, key);
  const l = lang === "hi" ? "hi" : "en";
  const message = (floating && pickText(floating, "whatsappMessage", l, "")) || pickText(data?.app, "whatsappMessage", l, t("waHello"));
  const showCall = flag("showCall") && isOn(data?.app, "showCallButton");
  const showWa = flag("showWhatsapp") && isOn(data?.app, "showWhatsappButton");

  const call = () => Linking.openURL(`tel:${(data?.contact.call || data?.contact.phone || "").replace(/[^\d+]/g, "")}`).catch(() => undefined);
  const wa = () => data && Linking.openURL(whatsappUrl(data.contact.whatsapp, message)).catch(() => undefined);

  return (
    <View style={[styles.root, { bottom }]} pointerEvents="box-none">
      <View style={styles.fabRow} pointerEvents="box-none">
        <View style={styles.col} pointerEvents="box-none">
          {data && showCall ? <Fab icon="call" label={t("fabCall")} color={FAB_COLORS.call} onPress={call} /> : null}
          {data && showWa ? <Fab icon="logo-whatsapp" label="WhatsApp" small color={FAB_COLORS.whatsapp} onPress={wa} /> : null}
        </View>
        <View style={styles.col} pointerEvents="box-none">
          {flag("showAi") ? <Fab icon="sparkles" label={t("fabAi")} color={FAB_COLORS.ai} onPress={() => setSheet("ai")} /> : null}
          {flag("showChat") ? <Fab icon="chatbubble-ellipses" label={t("fabChat")} color={FAB_COLORS.chat} onPress={() => setSheet("chat")} /> : null}
        </View>
      </View>

      {closed ? null : <Ticker data={data} onClose={() => setClosed(true)} />}
      <AssistantSheet mode={sheet} onClose={() => setSheet(null)} />
    </View>
  );
}

function Fab({ icon, label, color, small, onPress }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; color: string; small?: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.fab, { backgroundColor: color }, pressed && { transform: [{ scale: 0.95 }] }]}>
      <Ionicons name={icon} size={20} color="#fff" />
      <Text allowFontScaling={false} style={[styles.fabText, small && { fontSize: 9 }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/** The running line: yellow with maroon text, a "Special Notice" badge, and a close button (when the admin allows it). */
function Ticker({ data, onClose }: { data: ReturnType<typeof useHome>["data"]; onClose: () => void }) {
  const { t, lang } = useLanguage();
  const cfg = data?.ticker;
  const text = tickerText(cfg?.items ?? [], lang === "hi" ? "hi" : "en");
  const { bg, fg } = tickerColors(cfg?.bgColor, cfg?.textColor);
  const fontSize = Math.min(Math.max(cfg?.fontSize ?? 14, 12), 22);
  const seconds = Math.min(Math.max(cfg?.speedSec ?? 30, 8), 120);
  const x = useRef(new Animated.Value(0)).current;
  const [w, setW] = useState(0);

  useEffect(() => {
    if (!w) return;
    x.setValue(0);
    // The same speed as the website: one pass of the text takes about `seconds` for a screen's worth of it
    const loop = Animated.loop(Animated.timing(x, { toValue: -w, duration: Math.max(8000, (w / 360) * seconds * 1000), easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [w, x, text, seconds]);

  return (
    <View style={[styles.ticker, { backgroundColor: bg }]} accessibilityRole="text" accessibilityLabel={text}>
      <View style={styles.badge}>
        <Ionicons name="megaphone" size={13} color={colors.maroonDeep} />
        <Text allowFontScaling={false} style={styles.badgeText} numberOfLines={1}>
          {t("tickerBadge")}
        </Text>
      </View>
      <View style={{ flex: 1, overflow: "hidden" }}>
        <Animated.View style={{ flexDirection: "row", transform: [{ translateX: x }] }}>
          <Text allowFontScaling={false} style={{ fontSize, fontWeight: "600", color: fg }} numberOfLines={1} onLayout={(e) => setW(e.nativeEvent.layout.width + 48)}>
            {text}
          </Text>
          <Text allowFontScaling={false} style={{ fontSize, fontWeight: "600", color: fg, marginLeft: 48 }} numberOfLines={1}>
            {text}
          </Text>
        </Animated.View>
      </View>
      {cfg?.allowClose !== false ? (
        <Pressable accessibilityRole="button" accessibilityLabel={t("tickerClose")} onPress={onClose} hitSlop={8} style={styles.close}>
          <Ionicons name="close" size={18} color={fg} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: "absolute", left: 0, right: 0 },
  fabRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: space.md, paddingBottom: space.md },
  col: { gap: space.md },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    shadowColor: "#40241C",
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabText: { color: "#fff", fontSize: 10, fontWeight: "700", lineHeight: 12 },
  ticker: { height: TICKER_HEIGHT, flexDirection: "row", alignItems: "center", gap: space.sm, paddingLeft: space.sm, borderTopWidth: 2, borderTopColor: colors.maroon },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.gold, borderWidth: 1, borderColor: colors.maroon, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: "700", color: colors.maroonDeep, textTransform: "uppercase" },
  close: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
});
