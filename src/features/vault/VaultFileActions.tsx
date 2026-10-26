"use client";

import { useState } from "react";
import { Download, Eye, Printer } from "lucide-react";
import { FileViewerModal, printFile, viewKindOf } from "@/components/content/FileViewer";

const btn =
  "inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg border border-maroon bg-surface hover:bg-brand/20 text-xs font-bold uppercase tracking-wider text-secondary transition-colors";

/** View, Download and Print for one vault file. */
export function VaultFileActions({
  id,
  title,
  fileName,
  mimeType,
  isHindi,
}: {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  isHindi: boolean;
}) {
  const [open, setOpen] = useState(false);
  const url = `/api/vault/${id}`;
  const kind = viewKindOf(mimeType, fileName);
  const canPrint = kind === "image" || kind === "pdf";

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => setOpen(true)} className={btn}>
        <Eye className="w-4 h-4" /> {isHindi ? "देखें" : "View"}
      </button>
      <a href={`${url}?download=1`} download={fileName} className={btn}>
        <Download className="w-4 h-4" /> {isHindi ? "डाउनलोड" : "Download"}
      </a>
      {canPrint && (
        <button type="button" onClick={() => printFile(url, kind)} className={btn}>
          <Printer className="w-4 h-4" /> {isHindi ? "प्रिंट" : "Print"}
        </button>
      )}
      <FileViewerModal
        open={open}
        onClose={() => setOpen(false)}
        url={url}
        mimeType={mimeType}
        fileName={fileName}
        title={title}
        labels={{
          download: isHindi ? "डाउनलोड" : "Download",
          print: isHindi ? "प्रिंट" : "Print",
          close: isHindi ? "बंद करें" : "Close",
        }}
      />
    </div>
  );
}
