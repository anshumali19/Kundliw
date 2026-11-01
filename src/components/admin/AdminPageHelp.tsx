"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { usePathname } from "@/i18n/routing";
import { YouTubeEmbed } from "@/components/content/MediaView";
import { VideoField } from "@/components/admin/MediaFields";
import { helpFor } from "@/lib/admin/pageHelp";

/** "What is this page?" strip at the top of every admin page, with a demo the admin can add or change. */
export function AdminPageHelp({ isHindi, demos }: { isHindi: boolean; demos: Record<string, string> }) {
  const pathname = usePathname();
  const found = helpFor(pathname);
  const [saved, setSaved] = useState(demos);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  if (!found) return null;

  const demo = saved[found.path] || "";

  async function save(url: string) {
    if (!found) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/page-demo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: found.path, url }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) {
      const data = res ? await res.json().catch(() => ({})) : {};
      setError(data.error || t("Could not save.", "सहेजा नहीं जा सका।"));
      return;
    }
    setSaved((s) => {
      const next = { ...s };
      if (url) next[found.path] = url;
      else delete next[found.path];
      return next;
    });
    setEditing(false);
  }

  return (
    <details className="mb-5 rounded-lg border border-gold/60 bg-gold/10 text-sm">
      <summary className="flex min-h-[44px] cursor-pointer items-center gap-2 px-4 font-semibold text-secondary">
        <HelpCircle className="h-4 w-4 text-primary" aria-hidden="true" />
        {t("What is this page? Why use it?", "यह पेज क्या है? इसका उपयोग क्यों?")}
      </summary>
      <div className="space-y-3 border-t border-gold/40 px-4 py-3">
        <p>
          <span className="font-bold text-secondary">{t("What it does: ", "क्या करता है: ")}</span>
          {isHindi ? found.help.what[1] : found.help.what[0]}
        </p>
        <p>
          <span className="font-bold text-secondary">{t("Why it matters: ", "क्यों ज़रूरी है: ")}</span>
          {isHindi ? found.help.why[1] : found.help.why[0]}
        </p>
        {demo && !editing && (
          <div className="max-w-md">
            <YouTubeEmbed url={demo} title={t("Demo of this page", "इस पेज का डेमो")} isHindi={isHindi} />
          </div>
        )}
        {editing ? (
          <div className="space-y-2">
            <VideoField label={t("Demo video (short is fine)", "डेमो वीडियो (छोटा भी चलेगा)")} value={draft} onChange={setDraft} />
            {error && <p role="alert" className="text-xs text-on-error-container">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={busy} onClick={() => save(draft.trim())} className="min-h-[44px] rounded bg-brand px-4 text-xs font-bold text-on-brand hover:bg-brand-hover disabled:opacity-50">
                {t("Save", "सहेजें")}
              </button>
              {demo && (
                <button type="button" disabled={busy} onClick={() => save("")} className="min-h-[44px] rounded border border-outline-variant px-4 text-xs font-bold text-secondary">
                  {t("Remove demo", "डेमो हटाएँ")}
                </button>
              )}
              <button type="button" onClick={() => setEditing(false)} className="min-h-[44px] rounded border border-outline-variant px-4 text-xs font-semibold">
                {t("Cancel", "रद्द करें")}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(demo);
              setEditing(true);
            }}
            className="min-h-[44px] rounded border border-outline-variant px-4 text-xs font-bold text-secondary hover:bg-surface-container-high"
          >
            {demo ? t("Change demo", "डेमो बदलें") : t("Add a demo video for this page", "इस पेज के लिए डेमो वीडियो जोड़ें")}
          </button>
        )}
      </div>
    </details>
  );
}
