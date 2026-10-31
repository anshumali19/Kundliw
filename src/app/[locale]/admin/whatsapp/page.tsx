import { Link } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { isWhatsAppActive } from "@/lib/whatsapp/cloud";
import { WhatsAppInbox } from "@/features/admin/whatsapp/WhatsAppInbox";

export const dynamic = "force-dynamic";

export default async function AdminWhatsAppPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  await requireAdmin("/admin/whatsapp", locale);
  const isHindi = locale === "hi";
  const t = (en: string, hi: string) => (isHindi ? hi : en);

  const [active, messages] = await Promise.all([
    isWhatsAppActive(),
    prisma.whatsAppMessage.findMany({ orderBy: { createdAt: "desc" }, take: 300 }),
  ]);
  const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "").replace(/\/$/, "");

  const chats = new Map<string, { phone: string; name: string | null; messages: Array<{ id: string; direction: string; body: string; status: string; at: string }> }>();
  for (const m of [...messages].reverse()) {
    const chat = chats.get(m.contactPhone) ?? { phone: m.contactPhone, name: null, messages: [] };
    if (m.contactName) chat.name = m.contactName;
    chat.messages.push({ id: m.id, direction: m.direction, body: m.body, status: m.status, at: m.createdAt.toISOString() });
    chats.set(m.contactPhone, chat);
  }
  const list = [...chats.values()].sort((a, b) => b.messages[b.messages.length - 1].at.localeCompare(a.messages[a.messages.length - 1].at));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">{t("WhatsApp chats", "व्हाट्सएप चैट")}</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {t("Messages clients send to the Kendra's WhatsApp Business number, with replies from here.", "ग्राहकों द्वारा केंद्र के व्हाट्सएप बिज़नेस नंबर पर भेजे संदेश, और यहीं से उत्तर।")}
        </p>
      </div>

      <section className={`rounded border p-4 text-sm ${active ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-primary/40 bg-surface-container-low"}`}>
        <p className="font-bold">{active ? t("WhatsApp is switched on.", "व्हाट्सएप चालू है।") : t("WhatsApp is ready and waiting for the key.", "व्हाट्सएप तैयार है, केवल कुंजी का इंतज़ार है।")}</p>
        {!active && (
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-on-surface-variant">
            <li>
              {t("Open ", "खोलें ")}
              <Link href="/admin/settings/keys" className="font-bold text-primary hover:underline">{t("API keys & Analytics", "API कीज़ व एनालिटिक्स")}</Link>
              {t(
                " and fill the WhatsApp Business box: Access Token, Phone Number ID, a Verify Token of your choice (and the App Secret if you have it). Then Save.",
                " और 'WhatsApp Business' बॉक्स भरें: Access Token, Phone Number ID, अपनी पसंद का Verify Token (और App Secret यदि हो)। फिर सहेजें।"
              )}
            </li>
            <li>
              {t(
                "In Meta (WhatsApp > Configuration) add this webhook address and the same Verify Token, and subscribe to messages:",
                "Meta (WhatsApp > Configuration) में यह वेबहुक पता और वही Verify Token डालें, तथा messages चुनें:"
              )}
              <code className="mt-1 block break-all rounded bg-surface px-2 py-1 text-xs">{base}/api/webhooks/whatsapp</code>
            </li>
          </ol>
        )}
      </section>

      <WhatsAppInbox chats={list} active={active} isHindi={isHindi} />
    </div>
  );
}
