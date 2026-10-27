import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Role, PaymentStatus } from "@prisma/client";
import { escapeHtml } from "@/lib/billing/html";
import { formatPaiseToInr } from "@/lib/billing/gst";
import { getSection } from "@/lib/siteConfig/service";

export const dynamic = "force-dynamic";

const DEFAULT_STEPS_EN = [
  "We will prepare your service as per the details you gave.",
  "You can follow progress any time in My Orders.",
  "Your report or call details will be shared as soon as they are ready.",
];
const DEFAULT_STEPS_HI = [
  "आपके दिए विवरण के अनुसार हम आपकी सेवा तैयार करेंगे।",
  "आप कभी भी 'मेरे ऑर्डर' में प्रगति देख सकते हैं।",
  "रिपोर्ट या कॉल की जानकारी तैयार होते ही आपको दी जाएगी।",
];

/**
 * Confirmation ticket for a paid order. The customer opens it from the order page;
 * the admin can open the same ticket for any order. Wording comes from
 * Admin > Website settings > Confirmation ticket.
 */
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const order = await prisma.order.findUnique({
      where: { id },
      include: { service: true, plan: true, user: true, slot: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const isAdmin = user.role === Role.ADMIN;
    if (order.userId !== user.id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const cfg = await getSection("ticket");
    if (!isAdmin && cfg.enabled === false) {
      return NextResponse.json({ error: "Tickets are not available right now. Please contact us." }, { status: 403 });
    }
    if (order.paymentStatus !== PaymentStatus.PAID && !isAdmin) {
      return NextResponse.json({ error: "The ticket is issued once your payment is confirmed." }, { status: 409 });
    }

    const locale = new URL(request.url).searchParams.get("lang") === "en" ? "en" : "hi";
    const hi = locale === "hi";
    const pick = (k: string) => String(cfg[k + (hi ? "Hi" : "En")] || "").trim();
    const settings = await prisma.adminSettings.findUnique({ where: { id: "default" } }).catch(() => null);

    const j = (order.jatakaDetails as Record<string, unknown>) || {};
    const customer = String(j.name || order.user?.name || "");
    const title = pick("title") || (hi ? "बुकिंग कन्फर्मेशन टिकट" : "Booking Confirmation Ticket");
    const message =
      pick("message") ||
      (hi ? "धन्यवाद। आपका भुगतान प्राप्त हो गया है और आपकी बुकिंग पक्की है।" : "Thank you. Your payment is received and your booking is confirmed.");
    const stepsRaw = pick("steps");
    const steps = (stepsRaw ? stepsRaw.split(/\r?\n/).map((x) => x.trim()).filter(Boolean) : hi ? DEFAULT_STEPS_HI : DEFAULT_STEPS_EN).slice(0, 8);
    const support = pick("support");
    const siteName = settings ? (hi ? settings.siteNameHi || settings.siteNameEn : settings.siteNameEn) : "Maharshi Kanad Jyotish Kendra";

    const rows: Array<[string, string]> = [
      [hi ? "बुकिंग नंबर" : "Booking number", order.orderNumber],
      [hi ? "ग्राहक" : "Customer", customer],
      [hi ? "सेवा" : "Service", (hi ? order.service?.titleHi : order.service?.titleEn) || ""],
      [hi ? "प्लान" : "Plan", (hi ? order.plan?.titleHi : order.plan?.titleEn) || ""],
      [hi ? "भुगतान" : "Payment", String(order.paymentStatus).replace(/_/g, " ")],
    ];
    if (cfg.showAmount !== false) rows.push([hi ? "राशि" : "Amount", formatPaiseToInr(order.netAmountPaise)]);
    if (cfg.showSlot !== false && order.slot) {
      rows.push([hi ? "अपॉइंटमेंट" : "Appointment", `${order.slot.date.toISOString().slice(0, 10)}, ${order.slot.startTime} - ${order.slot.endTime} IST`]);
    }
    if (cfg.showBirth !== false && j.dob) {
      rows.push([hi ? "जन्म विवरण" : "Birth details", [j.dob, j.isTimeUnknown ? "" : j.tob, j.pob].filter(Boolean).join(", ")]);
    }
    rows.push([hi ? "बुकिंग की तारीख" : "Booked on", order.createdAt.toLocaleDateString("en-IN")]);

    const contact: string[] = [];
    if (cfg.showPhone !== false && settings?.phone1) contact.push(`${hi ? "फ़ोन" : "Phone"}: ${settings.phone1}`);
    if (cfg.showAddress !== false) {
      const a = hi ? settings?.addressHi || settings?.addressEn : settings?.addressEn || settings?.addressHi;
      if (a) contact.push(a);
    }

    const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} - ${escapeHtml(order.orderNumber)}</title>
<style>
  body { font-family: -apple-system, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif; margin: 0; padding: 24px; background: #fffaf3; color: #241915; }
  .ticket { max-width: 640px; margin: 0 auto; background: #fff; border: 2px dashed #b84a1c; border-radius: 12px; padding: 28px; text-align: left; }
  .brand { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: #984700; font-weight: bold; }
  h1 { margin: 6px 0 4px; font-size: 24px; color: #40241c; }
  .ok { display: inline-block; margin: 8px 0 14px; padding: 4px 12px; border-radius: 999px; background: #e7f5e8; color: #1b6a2a; font-weight: bold; font-size: 13px; }
  .msg { font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 18px; font-size: 14px; }
  td { padding: 9px 4px; border-bottom: 1px solid #eee0d4; vertical-align: top; }
  td:first-child { width: 38%; color: #7b6861; }
  td:last-child { font-weight: 600; }
  h2 { font-size: 15px; margin: 18px 0 6px; color: #40241c; }
  ol { margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.7; }
  .foot { margin-top: 20px; padding-top: 12px; border-top: 1px solid #eee0d4; font-size: 13px; color: #574237; line-height: 1.6; }
  .print { display: block; max-width: 640px; margin: 16px auto 0; }
  button { min-height: 44px; padding: 0 20px; border: 0; border-radius: 8px; background: #c0481b; color: #fff; font-weight: bold; cursor: pointer; }
  @media print { body { background: #fff; padding: 0; } .print { display: none; } }
</style>
</head>
<body>
<div class="ticket">
  <div class="brand">${escapeHtml(siteName)}</div>
  <h1>${escapeHtml(title)}</h1>
  <div class="ok">${hi ? "पुष्टि हो गई" : "Confirmed"}</div>
  <p class="msg">${escapeHtml(message)}</p>
  <table>${rows.map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join("")}</table>
  <h2>${hi ? "आगे क्या होगा" : "What happens next"}</h2>
  <ol>${steps.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ol>
  ${support || contact.length ? `<div class="foot">${[support, ...contact].filter(Boolean).map((x) => escapeHtml(x)).join("<br>")}</div>` : ""}
</div>
<div class="print"><button onclick="window.print()">${hi ? "प्रिंट करें / PDF सहेजें" : "Print / Save as PDF"}</button></div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy":
          "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; form-action 'none'; frame-ancestors 'none'; base-uri 'none'",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "no-referrer",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Ticket generation failed:", error);
    return NextResponse.json({ error: "Ticket generation failed" }, { status: 500 });
  }
}
