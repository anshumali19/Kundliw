import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_GUIDES, guidePageSlug } from "@/lib/guides/defaults";
import { parseRich } from "@/lib/content/richText";
import { escapeHtml } from "@/lib/billing/html";

export const dynamic = "force-dynamic";

/**
 * The User Guide as one self-contained page the customer can save (?download=1) or print (?print=1).
 * The words come from Admin > Pages & legal > "Guide: User", so the admin edits them there.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const hi = q.get("lang") !== "en";
  const download = q.get("download") === "1";

  const stored = await prisma.staticPage.findUnique({ where: { slug: guidePageSlug("user") } }).catch(() => null);
  const fallback = DEFAULT_GUIDES.user;
  const title = (hi ? stored?.titleHi || fallback.titleHi : stored?.titleEn || fallback.titleEn) || "User Guide";
  const content = (hi ? stored?.contentHi || fallback.contentHi : stored?.contentEn || fallback.contentEn) || "";
  const siteName = hi ? "महर्षि कणाद ज्योतिष केंद्र" : "Maharshi Kanad Jyotish Kendra";

  const inline = parseRich(content)
    .map((paragraph) => {
      const lines = paragraph.map((line) =>
        line
          .map((part) => {
            if (part.type === "bold") return `<strong>${escapeHtml(part.text)}</strong>`;
            if (part.type === "link") {
              // In-site links work only on the site, so they are shown as plain text in a saved copy
              return part.external ? `<a href="${escapeHtml(part.href)}">${escapeHtml(part.text)}</a>` : escapeHtml(part.text);
            }
            return escapeHtml(part.text);
          })
          .join("")
      );
      return `<p>${lines.join("<br>")}</p>`;
    })
    .join("\n");

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
  h1 { font-size: 28px; color: #6b1d1d; margin: 6px 0 18px; border-bottom: 2px solid #6b1d1d; padding-bottom: 10px; }
  p { margin: 0 0 14px; font-size: 15px; }
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
  ${inline}
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
      ...(download ? { "Content-Disposition": `attachment; filename="User-Guide-${hi ? "hi" : "en"}.html"` } : {}),
      "Content-Security-Policy": `default-src 'none'; style-src 'unsafe-inline'; script-src 'sha256-${hash}'; img-src data:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}
