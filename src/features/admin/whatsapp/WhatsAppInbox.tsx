"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Chat {
  phone: string;
  name: string | null;
  messages: Array<{ id: string; direction: string; body: string; status: string; at: string }>;
}

/** Contact list on the left, the chosen chat with a reply box on the right. */
export function WhatsAppInbox({ chats, active, isHindi }: { chats: Chat[]; active: boolean; isHindi: boolean }) {
  const router = useRouter();
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const [phone, setPhone] = useState<string | null>(chats[0]?.phone ?? null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chat = chats.find((c) => c.phone === phone) ?? null;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!chat || !text.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: chat.phone, body: text }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res || !res.ok) {
      setError(data.error || t("Could not send.", "भेजा नहीं जा सका।"));
      return;
    }
    setText("");
    router.refresh();
  }

  if (chats.length === 0) {
    return (
      <p className="rounded border border-outline-variant/50 bg-surface-container-low p-6 text-center text-sm text-on-surface-variant">
        {t("No chats yet. They appear here once WhatsApp is switched on and a client writes to the Kendra.", "अभी कोई चैट नहीं। व्हाट्सएप चालू होने और ग्राहक के संदेश भेजते ही यहाँ दिखेंगी।")}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <ul className="max-h-[70vh] divide-y divide-outline-variant/40 overflow-y-auto rounded border border-outline-variant/60 bg-surface lg:col-span-4">
        {chats.map((c) => (
          <li key={c.phone}>
            <button type="button" onClick={() => setPhone(c.phone)} className={`block min-h-[56px] w-full px-3 py-2 text-left ${c.phone === phone ? "bg-brand/15" : "hover:bg-surface-container-low"}`}>
              <span className="block text-sm font-bold text-secondary">{c.name || `+${c.phone}`}</span>
              <span className="block truncate text-xs text-on-surface-variant">{c.messages[c.messages.length - 1].body}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-col rounded border border-outline-variant/60 bg-surface lg:col-span-8">
        {chat && (
          <>
            <div className="border-b border-outline-variant/50 px-4 py-3 text-sm font-bold text-secondary">
              {chat.name || ""} +{chat.phone}
            </div>
            <ul className="max-h-[50vh] flex-1 space-y-2 overflow-y-auto p-4">
              {chat.messages.map((m) => (
                <li key={m.id} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.direction === "OUT" ? "ml-auto bg-brand/20" : "bg-surface-container"}`}>
                  <span className="whitespace-pre-line">{m.body}</span>
                  <span className="mt-1 block text-[10px] text-on-surface-variant">
                    {new Date(m.at).toLocaleString("en-IN")}
                    {m.status === "FAILED" ? ` · ${t("not sent", "भेजा नहीं गया")}` : ""}
                  </span>
                </li>
              ))}
            </ul>
            <form onSubmit={send} className="space-y-2 border-t border-outline-variant/50 p-3">
              {error && (
                <p role="alert" className="text-xs text-on-error-container">
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={text}
                  disabled={!active}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={active ? t("Write a reply", "उत्तर लिखें") : t("Available once WhatsApp is switched on", "व्हाट्सएप चालू होने पर उपलब्ध")}
                  className="min-h-[44px] flex-1 rounded border border-outline-variant bg-surface px-3 py-2 text-sm disabled:opacity-60"
                />
                <button type="submit" disabled={!active || busy || !text.trim()} className="min-h-[44px] rounded bg-brand px-4 text-sm font-bold text-on-brand hover:bg-brand-hover disabled:opacity-50">
                  {t("Send", "भेजें")}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
