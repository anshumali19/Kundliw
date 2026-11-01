import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/guards";
import { DEFAULT_GUIDES, GUIDE_SLUGS, guidePageSlug, type GuideSlug } from "@/lib/guides/defaults";
import { loadGuideVisuals } from "@/lib/guides/visuals";
import { parseRich } from "@/lib/content/richText";
import { escapeHtml } from "@/lib/billing/html";

export const dynamic = "force-dynamic";

/**
 * A guide (user, associate or admin) as one self-contained page that can be saved (?download=1) or printed (?print=1).
 * The words come from Admin > Pages & legal > "Guide: ...", the pictures and videos from Admin > Guides & visuals.
 */
export async function GET(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  if (!GUIDE_SLUGS.includes(slug as GuideSlug)) return new NextResponse("Not found", { status: 404 });
  const guideSlug = slug as GuideSlug;
  if (guideSlug !== "user") {
    // The associate guide is for associates and admins, the admin guide for admins only
    const user = await getCurrentUser();
    const allowed = guideSlug === "admin" ? user?.role === Role.ADMIN : user?.role === Role.ASSOCIATE || user?.role === Role.ADMIN;
    if (!allowed) return new NextResponse("Not found", { status: 404 });
  }
  const q = request.nextUrl.searchParams;
  const hi = q.get("lang") !== "en";
  const download = q.get("download") === "1";

  const stored = await prisma.staticPage.findUnique({ where: { slug: guidePageSlug(guideSlug) } }).catch(() => null);
  const fallback = DEFAULT_GUIDES[guideSlug];
  const visuals = await loadGuideVisuals(guideSlug);
  const visualsHtml = visuals
    .map((v) => {
      const caption = escapeHtml((hi ? v.labelHi || v.labelEn : v.labelEn || v.labelHi) || "");
      return v.kind === "image"
        ? `<figure><img src="${escapeHtml(v.url)}" alt="${caption}">${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`
        : `<p class="video">${hi ? "वीडियो देखें:" : "Watch the video:"} <a href="${escapeHtml(v.url)}">${caption || escapeHtml(v.url)}</a></p>`;
    })
    .join("\n");
  const title = (hi ? stored?.titleHi || fallback.titleHi : stored?.titleEn || fallback.titleEn) || "User Guide";
  const content = (hi ? stored?.contentHi || fallback.contentHi : stored?.contentEn || fallback.contentEn) || "";
  const siteName = hi ? "महर्षि कणाद ज्योतिष केंद्र" : "Maharshi Kanad Jyotish Kendra";

  const renderLine = (line: ReturnType<typeof parseRich>[number][number]) =>
    line
      .map((part) => {
        if (part.type === "bold") return `<strong>${escapeHtml(part.text)}</strong>`;
        if (part.type === "link") {
          // In-site links work only on the site, so they are shown as plain text in a saved copy
          return part.external ? `<a href="${escapeHtml(part.href)}">${escapeHtml(part.text)}</a>` : escapeHtml(part.text);
        }
        return escapeHtml(part.text);
      })
      .join("");

  // A paragraph whose first line starts "3. Title" becomes a numbered section heading and appears in the contents list
  const toc: Array<{ id: string; title: string }> = [];
  const inline = parseRich(content)
    .map((paragraph) => {
      const first = paragraph[0]?.map((p) => p.text).join("") ?? "";
      const heading = /^(\d{1,2})\.\s+(\S.*)$/.exec(first);
      if (heading) {
        const id = `s${heading[1]}`;
        toc.push({ id, title: `${heading[1]}. ${heading[2]}` });
        const rest = paragraph.slice(1).map(renderLine);
        return `<h2 id="${id}">${escapeHtml(`${heading[1]}. ${heading[2]}`)}</h2>${rest.length ? `<p>${rest.join("<br>")}</p>` : ""}`;
      }
      return `<p>${paragraph.map(renderLine).join("<br>")}</p>`;
    })
    .join("\n");
  const tocHtml = toc.length > 2 ? `<nav class="toc"><strong>${hi ? "विषय सूची" : "Contents"}</strong><ol>${toc.map((t) => `<li><a href="#${t.id}">${escapeHtml(t.title.replace(/^\d+\.\s*/, ""))}</a></li>`).join("")}</ol></nav>` : "";
  const issued = new Date().toLocaleDateString(hi ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" });

  const printScript = "document.getElementById('print-btn').addEventListener('click',function(){window.print()});if(location.search.indexOf('print=1')>-1){window.addEventListener('load',function(){setTimeout(function(){window.print()},400)})}";
  const html = `<!DOCTYPE html>
<html lang="${hi ? "hi" : "en"}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} - ${escapeHtml(siteName)}</title>
<style>
  body { font-family: -apple-system, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif; margin: 0; padding: 24px; color: #241915; background: #fff; line-height: 1.7; }
  main { max-width: 760px; margin: 0 auto; }
  .brand { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: #984700; font-weight: bold; }
  h1 { font-size: 30px; color: #6b1d1d; margin: 6px 0 6px; }
  .meta { font-size: 12px; color: #666; margin: 0 0 18px; padding-bottom: 12px; border-bottom: 3px solid #6b1d1d; }
  h2 { font-size: 19px; color: #6b1d1d; margin: 26px 0 8px; padding: 6px 10px; background: #fbf1e8; border-left: 4px solid #984700; page-break-after: avoid; }
  .toc { background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 12px 18px; margin: 0 0 8px; }
  .toc ol { margin: 8px 0 0; padding-left: 22px; columns: 2; font-size: 14px; }
  .toc a { text-decoration: none; }
  footer { margin-top: 36px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 11px; color: #777; }
  p { margin: 0 0 14px; font-size: 15px; }
  figure { margin: 18px 0; }
  figure img { max-width: 100%; border: 1px solid #ddd; border-radius: 8px; }
  figcaption { font-size: 13px; color: #555; margin-top: 4px; }
  a { color: #6b1d1d; }
  .bar { text-align: right; margin-bottom: 12px; }
  button { min-height: 44px; padding: 0 20px; border: 0; border-radius: 8px; background: #6b1d1d; color: #fff; font-weight: bold; cursor: pointer; }
  @media print { body { padding: 0; } .bar { display: none; } }
</style>
</head>
<body>
<main>
  <div class="bar"><button id="print-btn" type="button">${hi ? "प्रिंट करें / PDF सहेजें" : "Print / Save as PDF"}</button></div>
  <div class="brand">${escapeHtml(siteName)}</div>
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">${escapeHtml(siteName)} · ${hi ? "जारी:" : "Issued:"} ${escapeHtml(issued)}</p>
  ${tocHtml}
  ${inline}
  ${visualsHtml}
  <footer>${escapeHtml(siteName)} · ${escapeHtml(title)}</footer>
</main>
<script>${printScript}</script>
</body>
</html>`;

  const { createHash } = await import("node:crypto");
  const hash = createHash("sha256").update(printScript).digest("base64");
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...(download ? { "Content-Disposition": `attachment; filename="${guideSlug}-guide-${hi ? "hi" : "en"}.html"` } : {}),
      "Content-Security-Policy": `default-src 'none'; style-src 'unsafe-inline'; script-src 'sha256-${hash}'; img-src https: data:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}
