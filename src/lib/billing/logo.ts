import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSection } from "@/lib/siteConfig/service";
import { getStorageProvider } from "@/lib/storage";

export interface InvoiceLogo {
  /** PNG bytes for the PDF */
  png: Buffer;
  /** The same picture as a data address for the printable page */
  dataUri: string;
}

/** Reads one picture: this site's own storage, a file in /public, or the site itself as a last resort. */
async function readPicture(src: string, origin: string): Promise<Buffer | null> {
  try {
    if (src.startsWith("/api/storage/")) {
      const key = src.slice("/api/storage/".length).split("?")[0];
      if (key.startsWith("payment-proofs/") || key.startsWith("vault/")) return null;
      return (await getStorageProvider().getFile(key)).buffer;
    }
    if (src.startsWith("/") && !src.startsWith("//")) {
      try {
        return await readFile(path.join(process.cwd(), "public", src.split("?")[0]));
      } catch {
        const res = await fetch(new URL(src, origin), { signal: AbortSignal.timeout(4000) });
        return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
      }
    }
  } catch {
    /* fall through to no logo */
  }
  return null;
}

/**
 * The Kendra's logo for the invoice and ticket: the one set in Admin > Website settings > Logo,
 * otherwise the standard logo. Returns null (and the document prints without a picture) if it cannot be read.
 */
export async function loadInvoiceLogo(origin: string): Promise<InvoiceLogo | null> {
  const cfg = await getSection("logo").catch(() => ({} as Record<string, unknown>));
  const chosen = String(cfg.logoUrl || "").trim();
  const sources = [chosen, "/logo-small.webp"].filter(Boolean);
  for (const src of sources) {
    const raw = await readPicture(src, origin);
    if (!raw) continue;
    try {
      const sharp = (await import("sharp")).default;
      const png = await sharp(raw).resize({ width: 240, height: 240, fit: "inside", withoutEnlargement: true }).png().toBuffer();
      return { png, dataUri: `data:image/png;base64,${png.toString("base64")}` };
    } catch {
      /* try the next picture */
    }
  }
  return null;
}
