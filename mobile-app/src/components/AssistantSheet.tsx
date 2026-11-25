import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View, type ScrollViewInstance } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RichText } from "@/components/ContentKit";
import { Text } from "@/components/Text";
import { useLanguage } from "@/lib/i18n";
import { chatPhone } from "@/lib/overlay";
import { useSession } from "@/lib/session";
import { colors, radius, space } from "@/theme";

type Mode = "ai" | "chat";
type Step = "NAME" | "PHONE" | "NEED" | "DONE";

interface Msg {
  id: string;
  mine?: boolean;
  text: string;
  replies?: { label: string; query: string }[];
  whatsappUrl?: string;
  enquiry?: boolean;
}

interface Answer {
  success: boolean;
  answer: string;
  quickReplies?: { label: string; query: string }[];
  whatsappUrl?: string;
  showTicketFallback?: boolean;
}

// The name and number are asked once per time the app is open (like once per visit on the website)
let lead: { name: string; phone: string } | null = null;

/**
 * The website's "Ask AI" and "Kendra Help Chat" as a panel over the app. Ask AI answers questions at once;
 * the chat first asks for the person's name, number and need (saved as an enquiry for the Kendra), then answers.
 */
export function AssistantSheet({ mode, onClose }: { mode: Mode | null; onClose: () => void }) {
  const { t, lang } = useLanguage();
  const { api } = useSession();
  const insets = useSafeAreaInsets();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [topics, setTopics] = useState<{ label: string; query: string }[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<Step>("DONE");
  const [draft, setDraft] = useState({ name: "", phone: "" });
  const scroller = useRef<ScrollViewInstance>(null);

  const say = useCallback((m: Omit<Msg, "id">) => setMsgs((x) => [...x, { ...m, id: `${Date.now()}-${x.length}` }]), []);

  const ask = useCallback(
    async (q: string) => {
      setBusy(true);
      try {
        const r = await api.request<Answer>(`/api/chatbot/ask?q=${encodeURIComponent(q)}&locale=${lang}`, { auth: false });
        if (!q && r.quickReplies) setTopics(r.quickReplies);
        say({ text: r.answer, replies: mode === "chat" || q ? r.quickReplies : undefined, whatsappUrl: r.whatsappUrl, enquiry: r.showTicketFallback });
      } catch {
        say({ text: t("chatTechError") });
      } finally {
        setBusy(false);
      }
    },
    [api, lang, mode, say, t],
  );

  // Each time the panel opens: start fresh with the welcome (or the name question)
  useEffect(() => {
    if (!mode) return;
    setMsgs([]);
    setInput("");
    if (mode === "chat" && !lead) {
      setStep("NAME");
      setMsgs([{ id: "ask-name", text: t("chatAskName") }]);
    } else {
      setStep("DONE");
      ask("");
    }
    // only when it opens or the language changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, lang]);

  useEffect(() => {
    scroller.current?.scrollToEnd({ animated: true });
  }, [msgs, busy]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    say({ mine: true, text: q });
    if (mode === "chat" && step === "NAME") {
      if (q.length < 2) return say({ text: t("chatNameShort") });
      setDraft({ name: q, phone: "" });
      setStep("PHONE");
      return say({ text: t("chatAskPhone") });
    }
    if (mode === "chat" && step === "PHONE") {
      const phone = chatPhone(q);
      if (!phone) return say({ text: t("chatPhoneBad") });
      setDraft((d) => ({ ...d, phone }));
      setStep("NEED");
      return say({ text: t("chatAskNeed") });
    }
    if (mode === "chat" && step === "NEED") {
      lead = { name: draft.name, phone: draft.phone };
      setStep("DONE");
      // Saved for the Kendra's team; a failure here must not stop the answer
      api.request("/api/contact/enquiry", { method: "POST", body: { name: draft.name, phone: draft.phone, message: q.length < 5 ? `${q}     ` : q, source: "CHATBOT_LEAD" }, auth: false }).catch(() => undefined);
    }
    await ask(q);
  };

  const title = mode === "ai" ? t("chatTitleAi") : t("chatTitleHelp");

  return (
    <Modal visible={!!mode} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "flex-end" }}>
          <View style={[styles.panel, { paddingBottom: insets.bottom }]}>
            <View style={styles.head}>
              <View style={styles.headIcon}>
                <Ionicons name="sparkles" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.sub}>{mode === "ai" ? t("chatSubAi") : t("chatSubHelp")}</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={t("chatClose")} onPress={onClose} hitSlop={12}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            {mode === "ai" && topics.length > 0 ? (
              <View style={styles.topics}>
                <Text style={styles.topicsTitle}>{t("chatTopics")}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
                  {topics.map((tp) => (
                    <Pressable key={tp.query} disabled={busy} onPress={() => send(tp.query)} style={styles.chip}>
                      <Text style={styles.chipText}>{tp.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
              {msgs.map((m) => (
                <View key={m.id} style={{ alignItems: m.mine ? "flex-end" : "flex-start", gap: space.xs }}>
                  <View style={[styles.bubble, m.mine ? styles.mine : styles.theirs]}>
                    {m.mine ? <Text style={[styles.bubbleText, { color: colors.onBrand }]}>{m.text}</Text> : <RichText text={m.text} style={styles.bubbleText} />}
                  </View>
                  {m.whatsappUrl ? (
                    <Pressable onPress={() => Linking.openURL(m.whatsappUrl as string).catch(() => undefined)} style={[styles.action, { backgroundColor: "#25D366" }]}>
                      <Text style={styles.actionText}>{t("chatAskWhatsapp")}</Text>
                    </Pressable>
                  ) : null}
                  {m.enquiry ? (
                    <Pressable
                      onPress={() => {
                        onClose();
                        router.push("/explore/contact" as never);
                      }}
                      style={[styles.action, { backgroundColor: colors.brand }]}
                    >
                      <Text style={styles.actionText}>{t("chatEnquiry")}</Text>
                    </Pressable>
                  ) : null}
                  {m.replies?.length ? (
                    <View style={styles.replies}>
                      {m.replies.map((r) => (
                        <Pressable key={r.query} disabled={busy} onPress={() => send(r.query)} style={styles.chip}>
                          <Text style={styles.chipText}>{r.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </View>
              ))}
              {busy ? (
                <View style={styles.wait}>
                  <ActivityIndicator size="small" color={colors.brand} />
                  <Text style={styles.sub}>{t("chatWait")}</Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={mode === "ai" ? t("chatPlaceholderAi") : t("chatPlaceholderHelp")}
                placeholderTextColor={colors.textMuted}
                maxLength={300}
                editable={!busy}
                returnKeyType="send"
                onSubmitEditing={() => send(input)}
                style={styles.input}
              />
              <Pressable accessibilityRole="button" accessibilityLabel={t("chatSend")} disabled={busy || !input.trim()} onPress={() => send(input)} style={[styles.send, (busy || !input.trim()) && { opacity: 0.4 }]}>
                <Ionicons name="send" size={18} color={colors.onBrand} />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  panel: { height: "78%", backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, overflow: "hidden" },
  head: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.lg, backgroundColor: colors.surfaceContainer, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  headIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primaryContainer, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 16, fontWeight: "700", color: colors.heading },
  sub: { fontSize: 12, color: colors.textMuted },
  topics: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.sm, gap: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  topicsTitle: { fontSize: 12, fontWeight: "700", color: colors.maroon },
  chip: { paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.maroon, backgroundColor: colors.card },
  chipText: { fontSize: 13, color: colors.text, fontWeight: "500" },
  list: { padding: space.lg, gap: space.md },
  bubble: { maxWidth: "88%", borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: space.sm + 2 },
  mine: { backgroundColor: colors.brand, borderTopRightRadius: 4 },
  theirs: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.outlineVariant, borderTopLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 21, color: colors.text },
  action: { borderRadius: radius.sm, paddingHorizontal: space.md, paddingVertical: space.sm },
  actionText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  replies: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  wait: { flexDirection: "row", alignItems: "center", gap: space.sm },
  inputRow: { flexDirection: "row", alignItems: "center", gap: space.sm, padding: space.md, borderTopWidth: 1, borderTopColor: colors.outlineVariant, backgroundColor: colors.surfaceContainer },
  input: { flex: 1, minHeight: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.outlineVariant, backgroundColor: colors.card, paddingHorizontal: space.md, fontSize: 15, color: colors.text },
  send: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
});
