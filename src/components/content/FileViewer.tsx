"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Printer, X, Eye, Film, Music, FileArchive } from "lucide-react";

export type ViewKind = "image" | "pdf" | "video" | "audio" | "text" | "other";

/** How a file can be shown inside the page, decided by its type or name. */
export function viewKindOf(mimeType: string | undefined | null, fileName?: string | null): ViewKind {
  const mime = (mimeType || "").toLowerCase();
  const ext = (fileName || "").toLowerCase().split(".").pop() || "";
  if (mime.startsWith("image/") && mime !== "image/svg+xml") return "image";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "text/plain" || ext === "txt" || ext === "csv") return "text";
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return "image";
  if (["mp4", "webm", "mov"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return "audio";
  return "other";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const btn =
  "inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg border border-maroon bg-surface hover:bg-brand/20 text-sm font-bold text-secondary transition-colors";

/** Prints a file that is served from this site. Images and PDFs print directly. */
export function printFile(url: string, kind: ViewKind) {
  if (kind === "image") {
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;
    const img = w.document.createElement("img");
    img.src = url;
    img.style.maxWidth = "100%";
    img.onload = () => {
      w.focus();
      w.print();
    };
    w.document.body.style.margin = "0";
    w.document.body.appendChild(img);
    return;
  }
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  frame.src = url;
  frame.onload = () => {
    try {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    setTimeout(() => frame.remove(), 60_000);
  };
  document.body.appendChild(frame);
}

/** The picture of a file: an image, PDF page, video, audio player, text, or a file card for other types. */
export function FileSurface({
  url,
  kind,
  fileName,
  className = "",
}: {
  url: string;
  kind: ViewKind;
  fileName: string;
  className?: string;
}) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (kind !== "text") return;
    let cancelled = false;
    fetch(url)
      .then((r) => r.text())
      .then((t) => !cancelled && setText(t.slice(0, 20000)))
      .catch(() => !cancelled && setText(""));
    return () => {
      cancelled = true;
    };
  }, [kind, url]);

  const box = `w-full rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden ${className}`;

  if (kind === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={fileName} className={`${box} object-contain max-h-full`} />;
  }
  if (kind === "pdf") {
    return <iframe src={url} title={fileName} className={`${box} h-full min-h-[320px]`} />;
  }
  if (kind === "video") {
    return <video src={url} controls className={`${box} max-h-full bg-black`} />;
  }
  if (kind === "audio") {
    return (
      <div className={`${box} p-6 flex flex-col items-center gap-4`}>
        <Music className="w-10 h-10 text-primary" />
        <audio src={url} controls className="w-full" />
      </div>
    );
  }
  if (kind === "text") {
    return (
      <pre className={`${box} p-4 text-xs whitespace-pre-wrap break-words overflow-auto h-full min-h-[200px]`}>
        {text ?? "Loading..."}
      </pre>
    );
  }
  return (
    <div className={`${box} p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[200px]`}>
      <FileArchive className="w-10 h-10 text-primary" />
      <p className="text-sm font-semibold text-secondary break-all">{fileName}</p>
      <p className="text-xs text-on-surface-variant max-w-xs">
        This type of file cannot be shown inside the page. Use Download to open it in Word, Excel or another app.
      </p>
    </div>
  );
}

/** A window with the file, and View / Download / Print controls. */
export function FileViewerModal({
  open,
  onClose,
  url,
  mimeType,
  fileName,
  title,
  labels,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  mimeType?: string | null;
  fileName: string;
  title: string;
  labels?: { download: string; print: string; close: string };
}) {
  const kind = useMemo(() => viewKindOf(mimeType, fileName), [mimeType, fileName]);
  const t = labels ?? { download: "Download", print: "Print", close: "Close" };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const canPrint = kind === "image" || kind === "pdf";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 bg-black/60" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-4xl max-h-[calc(100dvh-1rem)] bg-surface rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-outline-variant">
          <h2 className="font-bold text-secondary truncate">{title}</h2>
          <button type="button" onClick={onClose} aria-label={t.close} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full hover:bg-surface-container">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-3 min-h-[280px] h-[70dvh]">
          <FileSurface url={url} kind={kind} fileName={fileName} className="h-full" />
        </div>
        <div className="flex flex-wrap gap-2 justify-end px-4 py-3 border-t border-outline-variant">
          <a href={url} download={fileName} className={btn}>
            <Download className="w-4 h-4" /> {t.download}
          </a>
          {canPrint && (
            <button type="button" onClick={() => printFile(url, kind)} className={btn}>
              <Printer className="w-4 h-4" /> {t.print}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Small preview of a file the visitor has just chosen, shown next to the upload button. */
export function SelectedFilePreview({
  file,
  emptyText,
  className = "",
}: {
  file: File | null;
  emptyText: string;
  className?: string;
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const kind = useMemo(() => (file ? viewKindOf(file.type, file.name) : "other"), [file]);

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }
    const u = URL.createObjectURL(file);
    setObjectUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  return (
    <div className={`rounded-xl border border-outline-variant bg-surface-container-low p-3 flex flex-col gap-2 ${className}`} aria-live="polite">
      {!file || !objectUrl ? (
        <div className="flex flex-col items-center justify-center text-center gap-2 text-on-surface-variant min-h-[180px]">
          <Eye className="w-8 h-8" />
          <p className="text-xs">{emptyText}</p>
        </div>
      ) : (
        <>
          <div className="h-56">
            <FileSurface url={objectUrl} kind={kind} fileName={file.name} className="h-full" />
          </div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            {kind === "video" ? <Film className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            <span className="font-semibold text-secondary truncate">{file.name}</span>
            <span className="shrink-0">({formatBytes(file.size)})</span>
          </div>
        </>
      )}
    </div>
  );
}
