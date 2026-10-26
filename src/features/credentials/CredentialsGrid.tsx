"use client";

import { stripRich } from "@/lib/content/richText";
import { useState } from "react";
import { Download, Eye, Printer, BadgeCheck } from "lucide-react";
import { FileViewerModal, printFile, viewKindOf } from "@/components/content/FileViewer";

export interface CredentialCard {
  id: string;
  kindLabel: string;
  title: string;
  description?: string | null;
  documentNumber?: string | null;
  fileUrl: string;
  fileName: string;
  mimeType: string;
}

const btn =
  "inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg border border-maroon bg-surface hover:bg-brand/20 text-sm font-bold text-secondary transition-colors";

export function CredentialsGrid({
  items,
  isHindi,
}: {
  items: CredentialCard[];
  isHindi: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = items.find((i) => i.id === openId) || null;
  const labels = {
    view: isHindi ? "देखें" : "View",
    download: isHindi ? "डाउनलोड" : "Download",
    print: isHindi ? "प्रिंट" : "Print",
    close: isHindi ? "बंद करें" : "Close",
    number: isHindi ? "दस्तावेज़ संख्या" : "Document no.",
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {items.map((c) => {
          const kind = viewKindOf(c.mimeType, c.fileName);
          const canPrint = kind === "image" || kind === "pdf";
          return (
            <article key={c.id} className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/60 space-y-3 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 shrink-0 rounded-full bg-brand/15 text-primary flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5" />
                </span>
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">{c.kindLabel}</p>
                  <h2 className="font-bold text-lg text-secondary leading-snug">{c.title}</h2>
                </div>
              </div>
              {c.description && <p className="text-sm text-on-surface-variant leading-relaxed">{stripRich(c.description)}</p>}
              {c.documentNumber && (
                <p className="text-xs text-on-surface-variant">
                  {labels.number}: <span className="font-mono font-semibold text-secondary">{c.documentNumber}</span>
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <button type="button" onClick={() => setOpenId(c.id)} className={btn}>
                  <Eye className="w-4 h-4" /> {labels.view}
                </button>
                <a href={c.fileUrl} download={c.fileName} className={btn}>
                  <Download className="w-4 h-4" /> {labels.download}
                </a>
                {canPrint && (
                  <button type="button" onClick={() => printFile(c.fileUrl, kind)} className={btn}>
                    <Printer className="w-4 h-4" /> {labels.print}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {open && (
        <FileViewerModal
          open
          onClose={() => setOpenId(null)}
          url={open.fileUrl}
          mimeType={open.mimeType}
          fileName={open.fileName}
          title={open.title}
          labels={{ download: labels.download, print: labels.print, close: labels.close }}
        />
      )}
    </>
  );
}
