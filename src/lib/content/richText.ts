/**
 * Plain-text "rich" markup the admin can type without any code:
 *   [words to click](https://example.com)   a hyperlink
 *   **words**                               bold
 *   a blank line                            a new paragraph
 * Only safe web, phone, mail and in-site addresses are turned into links; anything else stays as plain text.
 */

export type RichPart =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "link"; text: string; href: string; external: boolean };

/** Returns a clean address, or null when it is not one we allow (no javascript:, data:, etc.). */
export function safeHref(raw: string): { href: string; external: boolean } | null {
  const v = (raw || "").trim();
  if (!v || v.length > 600) return null;
  if (/^https?:\/\/[^\s]+$/i.test(v)) return { href: v, external: true };
  if (/^mailto:[^\s@]+@[^\s@]+$/i.test(v)) return { href: v, external: false };
  if (/^tel:\+?[\d\s-]{5,20}$/i.test(v)) return { href: v.replace(/\s+/g, ""), external: false };
  if (/^\/(?!\/)[^\s]*$/.test(v)) return { href: v, external: false };
  if (/^#[\w-]+$/.test(v)) return { href: v, external: false };
  return null;
}

/** Splits one line of text into plain, bold and link pieces. */
export function parseInline(line: string): RichPart[] {
  const parts: RichPart[] = [];
  const re = /\[([^\]\n]{1,200})\]\(([^)\s]{1,600})\)|\*\*([^*\n]{1,300})\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) parts.push({ type: "text", text: line.slice(last, m.index) });
    if (m[3] !== undefined) {
      parts.push({ type: "bold", text: m[3] });
    } else {
      const ok = safeHref(m[2]);
      if (ok) parts.push({ type: "link", text: m[1], href: ok.href, external: ok.external });
      else parts.push({ type: "text", text: m[0] });
    }
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push({ type: "text", text: line.slice(last) });
  return parts;
}

/** Paragraphs separated by blank lines; single line breaks are kept. */
export function parseRich(text: string): RichPart[][][] {
  return (text || "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.split("\n").map((l) => parseInline(l)));
}

/** Text with the markup removed (for search results, page descriptions and similar). */
export function stripRich(text: string): string {
  return (text || "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
}
