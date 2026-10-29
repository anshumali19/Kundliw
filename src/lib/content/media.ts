import { z } from "zod";
/** A link shown with a Hindi and an English label. */
export interface LinkItem {
  labelEn: string;
  labelHi: string;
  url: string;
}

/** Only web links are ever stored or rendered (no javascript:, data: or other schemes). */
export function isWebUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/** Accepts the current { labelEn, labelHi, url } shape and the older { title, url } shape. */
function upgradeLink(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const r = raw as Record<string, unknown>;
  const en = (r.labelEn ?? r.title ?? r.label ?? "") as string;
  const hi = (r.labelHi ?? r.titleHi ?? en) as string;
  return { labelEn: en, labelHi: hi || en, url: r.url };
}

export const linkInputSchema = z.preprocess(
  upgradeLink,
  z.object({
    labelEn: z.string().trim().min(1, "Every link needs a label").max(120),
    labelHi: z.string().trim().min(1).max(120),
    url: z
      .string()
      .trim()
      .max(2000)
      .refine(isWebUrl, "Links must start with http:// or https://"),
  })
);

export const linksInputSchema = z.array(linkInputSchema).max(30);

/** Reads stored links of either shape and returns only valid, safe ones. */
export function normalizeLinks(raw: unknown): LinkItem[] {
  if (!Array.isArray(raw)) return [];
  const out: LinkItem[] = [];
  for (const item of raw) {
    const parsed = linkInputSchema.safeParse(item);
    if (parsed.success) out.push(parsed.data as LinkItem);
  }
  return out;
}

export function linkLabel(link: LinkItem, isHindi: boolean): string {
  return (isHindi ? link.labelHi || link.labelEn : link.labelEn || link.labelHi) || link.url;
}

/**
 * Turns any common YouTube address (watch, youtu.be, shorts, embed, live) into an
 * embeddable URL. Returns null when the address is not a YouTube video.
 */
export function youtubeEmbedUrl(raw: string | null | undefined): string | null {
  if (!raw || !isWebUrl(raw)) return null;
  const u = new URL(raw.trim());
  const host = u.hostname.replace(/^www\.|^m\./, "");
  let id: string | null = null;
  if (host === "youtu.be") {
    id = u.pathname.split("/")[1] || null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") id = u.searchParams.get("v");
    else {
      const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
      id = m ? m[1] : null;
    }
  }
  if (!id || !/^[A-Za-z0-9_-]{6,20}$/.test(id)) return null;
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

export type VideoSource = { kind: "iframe" | "file"; src: string };

/**
 * Any video link the admin can paste: YouTube, Vimeo, a Google Drive share link, or a direct
 * video file address (.mp4, .webm, .ogg, .mov). Returns null when it is none of these.
 */
export function videoSource(raw: string | null | undefined): VideoSource | null {
  if (!raw || !isWebUrl(raw)) return null;
  const yt = youtubeEmbedUrl(raw);
  if (yt) return { kind: "iframe", src: yt };
  const u = new URL(raw.trim());
  const host = u.hostname.replace(/^www\./, "");
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = u.pathname.match(/\/(?:video\/)?(\d{5,12})/);
    if (m) return { kind: "iframe", src: `https://player.vimeo.com/video/${m[1]}` };
  }
  if (host === "drive.google.com") {
    const m = u.pathname.match(/\/file\/d\/([A-Za-z0-9_-]{10,})/) || null;
    const id = m ? m[1] : u.searchParams.get("id");
    if (id && /^[A-Za-z0-9_-]{10,}$/.test(id)) return { kind: "iframe", src: `https://drive.google.com/file/d/${id}/preview` };
  }
  if (/\.(mp4|webm|ogg|mov|m4v)$/i.test(u.pathname)) return { kind: "file", src: u.toString() };
  return null;
}

/** Rich page content: the admin stacks these blocks and can switch each one on or off. */
export const BLOCK_TYPES = ["text", "image", "youtube", "link"] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export interface ContentBlock {
  id: string;
  type: BlockType;
  isActive: boolean;
  /** text block body, or caption for image/youtube */
  textEn: string;
  textHi: string;
  /** image address, YouTube address or link address */
  url: string;
  /** link button label */
  labelEn: string;
  labelHi: string;
}

export const blockInputSchema = z
  .object({
    id: z.string().trim().min(1).max(64),
    type: z.enum(BLOCK_TYPES),
    isActive: z.boolean().default(true),
    textEn: z.string().max(20000).default(""),
    textHi: z.string().max(20000).default(""),
    url: z.string().trim().max(2000).default(""),
    labelEn: z.string().trim().max(120).default(""),
    labelHi: z.string().trim().max(120).default(""),
  })
  .superRefine((b, ctx) => {
    if (b.type === "text") {
      if (!b.textEn.trim() && !b.textHi.trim()) {
        ctx.addIssue({ code: "custom", path: ["textEn"], message: "A text block needs some text" });
      }
      return;
    }
    // Images may be uploaded files (served from this site) or web links.
    const okUrl = b.url.startsWith("/") || b.url.startsWith("/api/storage/") || isWebUrl(b.url);
    if (!okUrl) {
      ctx.addIssue({ code: "custom", path: ["url"], message: "Add a valid address for this block" });
    }
    if (b.type === "youtube" && !youtubeEmbedUrl(b.url)) {
      ctx.addIssue({ code: "custom", path: ["url"], message: "This is not a YouTube video address" });
    }
    if (b.type === "link" && !b.labelEn.trim() && !b.labelHi.trim()) {
      ctx.addIssue({ code: "custom", path: ["labelEn"], message: "A link block needs a label" });
    }
  });

export const blocksInputSchema = z.array(blockInputSchema).max(60);

export function normalizeBlocks(raw: unknown): ContentBlock[] {
  if (!Array.isArray(raw)) return [];
  const out: ContentBlock[] = [];
  for (const item of raw) {
    const parsed = blockInputSchema.safeParse(item);
    if (parsed.success) out.push(parsed.data as ContentBlock);
  }
  return out;
}

/** Image addresses must be this site's own files or a web link, never other schemes. */
export function isSafeImageSrc(value: string | null | undefined): value is string {
  if (!value) return false;
  const v = value.trim();
  if (v.startsWith("//")) return false;
  return v.startsWith("/") || isWebUrl(v);
}
