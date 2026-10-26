/**
 * File types accepted for customer, associate and admin document uploads.
 * The type is decided from the file's first bytes (not the name or the browser's claim),
 * and HTML, SVG, scripts and executables are never accepted.
 */

export interface DetectedFile {
  ok: boolean;
  mime: string | null;
  /** Safe to show inside the browser. Office files are served as downloads. */
  inline: boolean;
  label: string;
}

// Vercel accepts request bodies up to about 4.5 MB, so uploads stay a little under that.
export const MAX_DOCUMENT_UPLOAD_BYTES = 4 * 1024 * 1024;

const OFFICE_ZIP_EXT: Record<string, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

const OLE_EXT: Record<string, string> = {
  doc: "application/msword",
  xls: "application/vnd.ms-excel",
  ppt: "application/vnd.ms-powerpoint",
};

function startsWith(buf: Buffer, bytes: number[], offset = 0): boolean {
  return bytes.every((b, i) => buf[offset + i] === b);
}

function looksLikeText(buf: Buffer): boolean {
  const sample = buf.subarray(0, Math.min(buf.length, 4096));
  if (sample.includes(0)) return false;
  let odd = 0;
  for (const b of sample) {
    if (b < 9 || (b > 13 && b < 32)) odd += 1;
  }
  return odd / Math.max(sample.length, 1) < 0.02;
}

export function detectDocumentType(buf: Buffer, fileName: string): DetectedFile {
  const ext = (fileName.toLowerCase().split(".").pop() || "").trim();
  const no = (): DetectedFile => ({ ok: false, mime: null, inline: false, label: "unsupported" });

  if (buf.length < 4) return no();

  if (startsWith(buf, [0x25, 0x50, 0x44, 0x46])) return { ok: true, mime: "application/pdf", inline: true, label: "PDF" };
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47])) return { ok: true, mime: "image/png", inline: true, label: "PNG" };
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return { ok: true, mime: "image/jpeg", inline: true, label: "JPEG" };
  if (buf.toString("ascii", 0, 3) === "GIF") return { ok: true, mime: "image/gif", inline: true, label: "GIF" };
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    return { ok: true, mime: "image/webp", inline: true, label: "WEBP" };
  }
  if (buf.length >= 12 && buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12);
    if (brand.startsWith("M4A")) return { ok: true, mime: "audio/mp4", inline: true, label: "M4A" };
    return { ok: true, mime: brand.startsWith("qt") ? "video/quicktime" : "video/mp4", inline: true, label: "Video" };
  }
  if (startsWith(buf, [0x1a, 0x45, 0xdf, 0xa3])) return { ok: true, mime: "video/webm", inline: true, label: "WEBM" };
  if (buf.toString("ascii", 0, 3) === "ID3" || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0)) {
    return { ok: true, mime: "audio/mpeg", inline: true, label: "MP3" };
  }
  if (buf.toString("ascii", 0, 4) === "OggS") return { ok: true, mime: "audio/ogg", inline: true, label: "OGG" };
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WAVE") {
    return { ok: true, mime: "audio/wav", inline: true, label: "WAV" };
  }
  // Word, Excel and PowerPoint (new format) are ZIP packages
  if (startsWith(buf, [0x50, 0x4b, 0x03, 0x04]) && OFFICE_ZIP_EXT[ext]) {
    return { ok: true, mime: OFFICE_ZIP_EXT[ext], inline: false, label: ext.toUpperCase() };
  }
  // Word, Excel and PowerPoint (old format)
  if (startsWith(buf, [0xd0, 0xcf, 0x11, 0xe0]) && OLE_EXT[ext]) {
    return { ok: true, mime: OLE_EXT[ext], inline: false, label: ext.toUpperCase() };
  }
  if (buf.toString("ascii", 0, 5) === "{\rtf") return { ok: true, mime: "application/rtf", inline: false, label: "RTF" };
  if (["txt", "csv"].includes(ext) && looksLikeText(buf)) {
    const head = buf.toString("utf8", 0, 512).trimStart().toLowerCase();
    if (head.startsWith("<") || head.startsWith("<!doctype")) return no(); // markup is not a plain document
    return { ok: true, mime: ext === "csv" ? "text/csv" : "text/plain", inline: ext === "txt", label: ext.toUpperCase() };
  }
  return no();
}

export const DOCUMENT_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.webp,.gif,.mp4,.mov,.webm,.mp3,.wav,.ogg,.m4a,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.rtf,.txt,.csv";
