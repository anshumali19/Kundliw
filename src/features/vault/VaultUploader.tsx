"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { SelectedFilePreview } from "@/components/content/FileViewer";
import { DOCUMENT_ACCEPT, MAX_DOCUMENT_UPLOAD_BYTES } from "@/lib/storage/fileTypes";

/** Upload your own Kundli or any document. A preview of the chosen file sits beside the upload button. */
export function VaultUploader({ isHindi }: { isHindi: boolean }) {
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    if (file.size > MAX_DOCUMENT_UPLOAD_BYTES) {
      setMsg({ type: "error", text: t("This file is larger than 4 MB.", "यह फाइल 4 MB से बड़ी है।") });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("title", title);
      const res = await fetch("/api/vault/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMsg({
        type: "ok",
        text: t("Uploaded. It now appears in your documents below.", "अपलोड हो गया। यह नीचे आपके दस्तावेज़ों में दिख रहा है।"),
      });
      setFile(null);
      setTitle("");
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-surface rounded-xl p-5 border border-outline-variant/60 shadow-sm space-y-4">
      <div>
        <h2 className="font-bold text-lg text-secondary">
          {t("Upload your Kundli or a document", "अपनी कुण्डली या कोई दस्तावेज़ अपलोड करें")}
        </h2>
        <p className="text-xs text-on-surface-variant">
          {t(
            "PDF, image, video, audio, Word, Excel, PowerPoint, RTF or text. Up to 4 MB. Only you and the Kendra team can open it.",
            "PDF, चित्र, वीडियो, ऑडियो, Word, Excel, PowerPoint, RTF या टेक्स्ट। अधिकतम 4 MB। इसे केवल आप और केंद्र की टीम खोल सकती है।"
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
              {t("Name for this file (optional)", "फाइल का नाम (वैकल्पिक)")}
            </label>
            <input
              type="text"
              value={title}
              maxLength={160}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">{t("Choose file", "फाइल चुनें")}</label>
            <input
              ref={inputRef}
              type="file"
              accept={DOCUMENT_ACCEPT}
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setMsg(null);
              }}
              className="w-full text-xs file:mr-3 file:py-2.5 file:px-4 file:rounded file:border-0 file:font-bold file:bg-brand file:text-on-brand cursor-pointer"
            />
          </div>
          <button
            type="submit"
            disabled={!file || busy}
            className="min-h-[44px] px-5 inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {busy ? t("Uploading...", "अपलोड हो रहा है...") : t("Upload", "अपलोड करें")}
          </button>
          {msg && (
            <div
              role="status"
              className={`p-3 rounded border text-xs flex items-start gap-2 ${
                msg.type === "ok" ? "border-primary/40 text-primary" : "border-error/40 text-on-error-container"
              }`}
            >
              {msg.type === "ok" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{msg.text}</span>
            </div>
          )}
        </div>

        <SelectedFilePreview
          file={file}
          emptyText={t("The file you choose appears here before you upload it.", "आपकी चुनी हुई फाइल अपलोड से पहले यहाँ दिखेगी।")}
        />
      </div>
    </form>
  );
}
