import { ExternalLink } from "lucide-react";

/** Fills the language placeholder and keeps only web addresses. */
export function embedAddress(raw: string | undefined, fallback: string, locale: string): string {
  const lang = locale === "hi" ? "hi" : "en";
  const value = (raw || "").trim() || fallback;
  const filled = value.replace(/\{lang\}/g, lang).replace(/([?&]language=)(hi|en)\b/i, `$1${lang}`);
  return /^https:\/\//i.test(filled) ? filled : fallback.replace(/\{lang\}/g, lang);
}

/** Shows another website's tool inside our page, with a link to open it full screen. */
export function EmbedFrame({
  src,
  title,
  heading,
  intro,
  openLabel,
  credit,
  tall = false,
}: {
  src: string;
  title: string;
  heading: string;
  intro?: string;
  openLabel: string;
  credit?: string;
  tall?: boolean;
}) {
  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-6 text-left">
      <div className="max-w-6xl mx-auto bg-surface border border-outline-variant/60 rounded-lg overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-outline-variant/40">
          <div className="min-w-0">
            <h1 className="font-serif text-lg sm:text-xl font-bold text-secondary">{heading}</h1>
            {intro && <p className="text-xs sm:text-sm text-on-surface-variant">{intro}</p>}
          </div>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded text-xs font-bold border border-secondary/40 text-secondary hover:bg-surface-container-high"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {openLabel}
          </a>
        </div>
        <iframe
          src={src}
          title={title}
          className={`w-full border-0 bg-white ${tall ? "h-[1100px]" : "h-[900px]"} max-h-[85vh] sm:max-h-none`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        {credit && <p className="px-4 py-2 text-[11px] text-center text-on-surface-variant border-t border-outline-variant/30">{credit}</p>}
      </div>
    </div>
  );
}

/** Shown when the admin has switched a tool off. */
export function ToolOff({ name, isHindi }: { name: string; isHindi: boolean }) {
  return (
    <div className="w-full px-4 py-16 text-center">
      <h1 className="font-serif text-xl font-bold text-secondary">
        {isHindi ? `${name} अभी उपलब्ध नहीं है` : `${name} is not available right now`}
      </h1>
      <p className="mt-2 text-sm text-on-surface-variant">
        {isHindi ? "कृपया बाद में पुनः प्रयास करें या हमसे संपर्क करें।" : "Please try again later or contact us."}
      </p>
    </div>
  );
}
