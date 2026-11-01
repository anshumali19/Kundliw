import { ExternalLink, Image as ImageIcon, Play, Share2 } from "lucide-react";
import { YouTubeEmbed } from "@/components/content/MediaView";
import { isSafeImageSrc } from "@/lib/content/media";
import { normalizeDemos } from "@/lib/content/demos";

/** Everything the admin attached as a demo: pictures, videos, links and social media accounts. */
export function DemoSection({ demos, isHindi }: { demos: unknown; isHindi: boolean }) {
  const items = normalizeDemos(demos);
  if (items.length === 0) return null;
  const label = (d: (typeof items)[number], fallback: string) => (isHindi ? d.labelHi || d.labelEn : d.labelEn || d.labelHi) || fallback;
  const images = items.filter((d) => d.kind === "image" && isSafeImageSrc(d.url));
  const videos = items.filter((d) => d.kind === "video");
  const links = items.filter((d) => d.kind === "link" || d.kind === "social");

  return (
    <section className="space-y-4 rounded-2xl border border-outline-variant/40 bg-surface p-6 shadow-xs text-left" aria-labelledby="demo-title">
      <h2 id="demo-title" className="flex items-center gap-2 font-serif text-base font-bold text-secondary">
        <Play className="h-4 w-4 text-primary" aria-hidden="true" />
        {isHindi ? "डेमो" : "Demo"}
      </h2>
      {videos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {videos.map((d, i) => (
            <figure key={i} className="space-y-1">
              <YouTubeEmbed url={d.url} title={label(d, "Demo video")} isHindi={isHindi} />
              {label(d, "") && <figcaption className="text-xs text-on-surface-variant">{label(d, "")}</figcaption>}
            </figure>
          ))}
        </div>
      )}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((d, i) => (
            <figure key={i} className="space-y-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.url} alt={label(d, "Demo")} loading="lazy" className="aspect-video w-full rounded-lg border border-outline-variant/40 object-cover" />
              {label(d, "") && (
                <figcaption className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <ImageIcon className="h-3 w-3" aria-hidden="true" /> {label(d, "")}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
      {links.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {links.map((d, i) => (
            <li key={i}>
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-outline-variant px-4 text-xs font-bold text-secondary hover:bg-surface-container-high">
                {d.kind === "social" ? <Share2 className="h-4 w-4" aria-hidden="true" /> : <ExternalLink className="h-4 w-4" aria-hidden="true" />}
                {label(d, d.kind === "social" ? (isHindi ? "सोशल मीडिया" : "Social media") : isHindi ? "डेमो लिंक" : "Demo link")}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
