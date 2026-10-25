import { NextRequest } from "next/server";

export const dynamic = "force-static";

/**
 * Branded stand-ins for images that have not been uploaded yet (gallery, banners,
 * blog covers, founder photo). Real images uploaded from the admin panel replace these.
 * A payment QR is never faked: the placeholder says plainly that none has been set.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ file: string }> }
) {
  const { file } = await context.params;
  const isQr = /qr/i.test(file);

  const svg = isQr
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label="Payment QR code not set">
  <rect width="400" height="400" fill="#fff8f6"/>
  <rect x="12" y="12" width="376" height="376" rx="12" fill="none" stroke="#dec1b1" stroke-width="3" stroke-dasharray="10 8"/>
  <text x="200" y="190" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#6b1d1d">Payment QR code</text>
  <text x="200" y="224" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#574237">not set yet</text>
</svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" role="img" aria-label="Image placeholder">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffe9e2"/>
      <stop offset="1" stop-color="#fae3dc"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#g)"/>
  <circle cx="600" cy="337" r="150" fill="#6b1d1d" opacity="0.08"/>
  <text x="600" y="400" text-anchor="middle" font-family="Noto Sans Devanagari, Arial, sans-serif" font-size="200" font-weight="700" fill="#6b1d1d" opacity="0.55">&#2384;</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
