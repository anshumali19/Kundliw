import { ExternalLink, Video } from "lucide-react";
import {
  ContentBlock,
  LinkItem,
  isSafeImageSrc,
  isWebUrl,
  linkLabel,
  youtubeEmbedUrl,
} from "@/lib/content/media";

/** Responsive YouTube player. Falls back to a plain link when the address is not a YouTube video. */
export function YouTubeEmbed({
  url,
  title,
  isHindi,
}: {
  url: string | null | undefined;
  title: string;
  isHindi: boolean;
}) {
  if (!url) return null;
  const embed = youtubeEmbedUrl(url);
  if (!embed) {
    if (!isWebUrl(url)) return null;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-primary underline font-semibold"
      >
        <Video className="w-4 h-4" aria-hidden="true" />
        {isHindi ? "वीडियो देखें" : "Watch video"}
      </a>
    );
  }
  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-outline-variant/30">
      <iframe
        src={embed}
        title={title}
        loading="lazy"
        className="w-full h-full border-0"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

/** A list of extra links, each opening in a new tab. */
export function LinkList({
  links,
  isHindi,
  heading,
}: {
  links: LinkItem[];
  isHindi: boolean;
  heading?: string;
}) {
  if (links.length === 0) return null;
  return (
    <div className="space-y-2">
      {heading && (
        <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-secondary">{heading}</h3>
      )}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {links.map((link, idx) => (
          <li key={`${link.url}-${idx}`}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 min-h-[44px] px-3 py-2 rounded-lg bg-surface-container-low hover:bg-brand border border-outline-variant/40 text-sm font-medium text-on-surface transition-colors"
            >
              <span>{linkLabel(link, isHindi)}</span>
              <ExternalLink className="w-4 h-4 shrink-0 text-primary" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Renders the page blocks an admin built (only the active ones, in order). */
export function BlocksView({ blocks, isHindi }: { blocks: ContentBlock[]; isHindi: boolean }) {
  const active = blocks.filter((b) => b.isActive);
  if (active.length === 0) return null;
  return (
    <div className="space-y-6">
      {active.map((b) => {
        const text = (isHindi ? b.textHi || b.textEn : b.textEn || b.textHi).trim();
        if (b.type === "text") {
          return (
            <p key={b.id} className="whitespace-pre-line leading-relaxed text-base text-on-surface">
              {text}
            </p>
          );
        }
        if (b.type === "image") {
          if (!isSafeImageSrc(b.url)) return null;
          return (
            <figure key={b.id} className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.url}
                alt={text || ""}
                loading="lazy"
                className="w-full max-h-[480px] object-cover rounded-xl border border-outline-variant/40"
              />
              {text && <figcaption className="text-sm text-on-surface-variant">{text}</figcaption>}
            </figure>
          );
        }
        if (b.type === "youtube") {
          return (
            <div key={b.id} className="space-y-2">
              <YouTubeEmbed url={b.url} title={text || "Video"} isHindi={isHindi} />
              {text && <p className="text-sm text-on-surface-variant">{text}</p>}
            </div>
          );
        }
        // link
        if (!isWebUrl(b.url)) return null;
        const label = (isHindi ? b.labelHi || b.labelEn : b.labelEn || b.labelHi) || b.url;
        return (
          <div key={b.id}>
            <a
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded border-2 border-maroon bg-brand hover:bg-brand-hover text-on-brand font-bold"
            >
              {label}
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
            {text && <p className="mt-2 text-sm text-on-surface-variant">{text}</p>}
          </div>
        );
      })}
    </div>
  );
}
