import { kendraEmail } from "@/lib/content/contact";
import { loadPlanTitleMap, bundleTitle } from "@/lib/booking/bundle";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { generateInvoicePdf } from "@/lib/billing/invoicePdf";
import { formatPaiseToInr, formatGstRateBasisPoints } from "@/lib/billing/gst";
import { escapeHtml } from "@/lib/billing/html";
import { isDemoMode } from "@/lib/config/demo";
import { getSection } from "@/lib/siteConfig/service";
import { loadInvoiceLogo } from "@/lib/billing/logo";
import { createHash } from "node:crypto";
import { DEFAULT_INVOICE_TERMS, type InvoiceOptions } from "@/lib/billing/invoicePdf";

export const dynamic = "force-dynamic";

// The only script on the printable invoice: the Print button, and printing straight away when opened with ?print=1.
// The page's security policy allows exactly this script (by its fingerprint) and nothing else.
const PRINT_SCRIPT = "document.getElementById('print-btn').addEventListener('click',function(){window.print()});if(location.search.indexOf('print=1')>-1){window.addEventListener('load',function(){setTimeout(function(){window.print()},400)})}";
const PRINT_SCRIPT_HASH = createHash("sha256").update(PRINT_SCRIPT).digest("base64");

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const orderId = params.id;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        service: true,
        plan: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isOwner = order.userId === user.id;
    const isAdmin = user.role === Role.ADMIN;
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: Access denied to this invoice" }, { status: 403 });
    }

    const cfg = await getSection("invoice");
    if (!isAdmin && cfg.userCanDownload === false) {
      return NextResponse.json({ error: "Invoices are not available to download right now. Please contact us." }, { status: 403 });
    }
    const text = (k: string) => String(cfg[k] || "").trim();
    const opts: InvoiceOptions = {
      title: text("title") || undefined,
      tagline: text("tagline") || undefined,
      numberLabel: text("numberLabel") || undefined,
      showAddress: cfg.showAddress !== false,
      showPhone: cfg.showPhone !== false,
      showEmail: cfg.showEmail !== false,
      showGstin: cfg.showGstin !== false,
      showCustomerEmail: cfg.showCustomerEmail !== false,
      showOfferCode: cfg.showOfferCode !== false,
      terms: text("terms").split(/\r?\n/).map((x) => x.trim()).filter(Boolean).slice(0, 10),
      footerLine: text("footerLine") || undefined,
      signatureName: text("signatureName") || undefined,
      signatureTitle: text("signatureTitle") || undefined,
    };

    const adminSettings = await prisma.adminSettings.findUnique({
      where: { id: "default" },
    });

    const jataka = (order.jatakaDetails as Record<string, unknown>) || {};
    const customerName = String(jataka.name || order.user?.name || "Customer");
    const customerPhone = String(jataka.phone || order.user?.phone || "");
    const customerEmail = (jataka.email as string) || order.user?.email || null;

    const logo = cfg.showLogo === false ? null : await loadInvoiceLogo(new URL(request.url).origin);
    const invoiceNumber = order.invoiceNumber || `INV-TEMP-${order.orderNumber}`;

    const invoiceData = {
      invoiceNumber,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      siteName: adminSettings?.siteNameEn || "Maharshi Kanad Jyotish Kendra",
      siteAddress: adminSettings?.addressEn || "",
      sitePhone: adminSettings?.phone1 || "+91-9827991224",
      siteEmail: kendraEmail(adminSettings?.email),
      // The GST number saved with the order, else the Kendra's current one
      gstin: order.gstin || adminSettings?.gstin || null,
      logoPng: logo?.png ?? null,
      customerName,
      customerPhone,
      customerEmail,
      serviceTitle: order.service?.titleEn || "Astrological Consultation",
      planTitle: bundleTitle(order, await loadPlanTitleMap(order.extraPlanIds), false, "Standard Tier"),
      baseAmountPaise: order.baseAmountPaise,
      discountAmountPaise: order.discountAmountPaise,
      taxableAmountPaise: order.taxableAmountPaise,
      gstRateBasisPoints: order.gstRateBasisPoints,
      gstAmountPaise: order.gstAmountPaise,
      netAmountPaise: order.netAmountPaise,
      paymentMode: order.paymentMode,
      paymentStatus: order.paymentStatus,
      offerCode: order.offerCode,
      opts,
    };

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");
    const safeFileBase = invoiceNumber.replace(/[^A-Za-z0-9._-]/g, "_");

    if (format === "html") {
      // Every value below can contain customer/admin supplied text, so it is
      // HTML-escaped before interpolation. Static markup is left untouched.
      const safe = {
        siteName: escapeHtml(invoiceData.siteName),
        siteAddress: escapeHtml(invoiceData.siteAddress),
        sitePhone: escapeHtml(invoiceData.sitePhone),
        siteEmail: escapeHtml(invoiceData.siteEmail),
        title: escapeHtml(opts.title || "TAX INVOICE / DAKSHINA RECEIPT"),
        tagline: escapeHtml(opts.tagline || "Vedic Astrological Heritage & Mathematical Computation Centre"),
        numberLabel: escapeHtml(opts.numberLabel || "Invoice Number"),
        footerLine: escapeHtml(opts.footerLine || ""),
        signature: escapeHtml([opts.signatureName, opts.signatureTitle].filter(Boolean).join(" - ")),
        terms: (opts.terms && opts.terms.length > 0 ? opts.terms : DEFAULT_INVOICE_TERMS).map((t, i) => `${i + 1}. ${escapeHtml(t)}`).join("<br>"),
        gstin: invoiceData.gstin ? escapeHtml(invoiceData.gstin) : null,
        invoiceNumber: escapeHtml(invoiceData.invoiceNumber),
        date: escapeHtml(invoiceData.date.toLocaleDateString("en-IN")),
        orderNumber: escapeHtml(invoiceData.orderNumber),
        paymentMode: escapeHtml(invoiceData.paymentMode),
        paymentStatus: escapeHtml(String(invoiceData.paymentStatus).replace(/_/g, " ")),
        customerName: escapeHtml(invoiceData.customerName),
        customerPhone: escapeHtml(invoiceData.customerPhone),
        customerEmail: invoiceData.customerEmail ? escapeHtml(invoiceData.customerEmail) : null,
        serviceTitle: escapeHtml(invoiceData.serviceTitle),
        planTitle: escapeHtml(invoiceData.planTitle),
        offerCode: invoiceData.offerCode ? escapeHtml(invoiceData.offerCode) : null,
        gstRate: escapeHtml(formatGstRateBasisPoints(invoiceData.gstRateBasisPoints)),
      };

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${safe.invoiceNumber} - ${safe.siteName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 40px; color: #241915; background: #fff; }
    .invoice-card { max-width: 800px; margin: 0 auto; border: 1px solid #dec1b1; padding: 40px; position: relative; }
    .header { border-bottom: 2px solid #6b1d1d; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 24px; font-weight: bold; color: #6b1d1d; margin: 0 0 4px 0; }
    .subtitle { font-size: 13px; color: #984700; margin: 0 0 8px 0; }
    .meta-grid { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px; line-height: 1.5; }
    .meta-col { width: 48%; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    .table th { background: #f4ded7; color: #6b1d1d; padding: 10px; text-align: left; }
    .table td { padding: 12px 10px; border-bottom: 1px solid #dec1b1; }
    .text-right { text-align: right; }
    .total-box { margin-left: auto; width: 300px; font-size: 13px; line-height: 1.8; }
    .grand-total { font-size: 18px; font-weight: bold; color: #6b1d1d; border-top: 2px solid #6b1d1d; padding-top: 8px; margin-top: 8px; }
    .demo-watermark { position: absolute; top: 35%; left: 15%; transform: rotate(-30deg); font-size: 60px; font-weight: bold; color: rgba(152,71,0,0.12); pointer-events: none; }
    .footer-note { margin-top: 40px; padding: 16px; background: #fff8f6; border: 1px solid #dec1b1; font-size: 11px; color: #574237; }
    @media print {
      body { padding: 0; }
      .invoice-card { border: none; padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width:800px;margin:0 auto 12px;text-align:right"><button id="print-btn" type="button" style="min-height:44px;padding:0 20px;border:0;border-radius:8px;background:#6b1d1d;color:#fff;font-weight:bold;cursor:pointer">Print / Save as PDF</button></div>
  <div class="invoice-card">
    ${isDemoMode() && process.env.NODE_ENV !== "production" ? '<div class="demo-watermark">DEMO INVOICE (नमूना)</div>' : ""}
    <div class="header">
      ${logo ? `<img src="${logo.dataUri}" alt="" style="float:right;max-height:64px;max-width:120px">` : ""}
      <h1 class="title">${safe.siteName}</h1>
      <div class="subtitle">${safe.tagline}</div>
      <div style="font-size: 11px; color: #574237;">${[opts.showAddress === false ? "" : safe.siteAddress, opts.showPhone === false || !safe.sitePhone ? "" : `Phone: ${safe.sitePhone}`, opts.showEmail === false || !safe.siteEmail ? "" : `Email: ${safe.siteEmail}`].filter(Boolean).join(" | ")}</div>
      <div style="font-size: 11px; color: #574237; margin-top: 4px;">${opts.showGstin === false ? "" : safe.gstin ? `<strong>GSTIN: ${safe.gstin}</strong>` : "GST: Not Applicable (Unregistered Kendra)"}</div>
    </div>

    <div class="meta-grid">
      <div class="meta-col">
        <strong>${safe.title}</strong><br>
        ${safe.numberLabel}: <strong>${safe.invoiceNumber}</strong><br>
        Date: ${safe.date}<br>
        Order Ref: ${safe.orderNumber}<br>
        Payment Mode: ${safe.paymentMode} (${safe.paymentStatus})
      </div>
      <div class="meta-col">
        <strong>BILLED TO (CUSTOMER):</strong><br>
        Name: <strong>${safe.customerName}</strong><br>
        Phone: ${safe.customerPhone}<br>
        ${safe.customerEmail && opts.showCustomerEmail !== false ? `Email: ${safe.customerEmail}<br>` : ""}
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Sl</th>
          <th>Service Particulars</th>
          <th class="text-right">Base Amount</th>
          <th class="text-right">Discount</th>
          <th class="text-right">Taxable</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>
            <strong>${safe.serviceTitle}</strong><br>
            <span style="font-size: 11px; color: #574237;">Tier: ${safe.planTitle}${safe.offerCode && opts.showOfferCode !== false ? ` (Offer: ${safe.offerCode})` : ""}</span>
          </td>
          <td class="text-right">${escapeHtml(formatPaiseToInr(invoiceData.baseAmountPaise))}</td>
          <td class="text-right">${invoiceData.discountAmountPaise > 0 ? `-${escapeHtml(formatPaiseToInr(invoiceData.discountAmountPaise))}` : "₹0"}</td>
          <td class="text-right"><strong>${escapeHtml(formatPaiseToInr(invoiceData.taxableAmountPaise))}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="total-box">
      <div style="display: flex; justify-content: space-between;">
        <span>Taxable Value:</span>
        <span>${escapeHtml(formatPaiseToInr(invoiceData.taxableAmountPaise))}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>GST (${safe.gstRate}%):</span>
        <span>${escapeHtml(formatPaiseToInr(invoiceData.gstAmountPaise))}</span>
      </div>
      <div class="grand-total" style="display: flex; justify-content: space-between;">
        <span>Total Auspicious Dakshina:</span>
        <span>${escapeHtml(formatPaiseToInr(invoiceData.netAmountPaise))}</span>
      </div>
    </div>

    <div class="footer-note">
      <strong>Terms & Declaration:</strong><br>
      ${safe.terms}
    </div>
    ${safe.signature ? `<div style="margin-top:28px;text-align:right;font-size:12px;"><strong>${safe.signature}</strong></div>` : ""}
    ${safe.footerLine ? `<div style="margin-top:20px;text-align:center;font-size:12px;color:#984700;font-weight:bold;">${safe.footerLine}</div>` : ""}
  </div>
<script>${PRINT_SCRIPT}</script>
</body>
</html>`;

      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `inline; filename="Invoice-${safeFileBase}.html"`,
          "Content-Security-Policy":
            `default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; script-src 'sha256-${PRINT_SCRIPT_HASH}'; connect-src 'none'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'`,
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Referrer-Policy": "no-referrer",
        },
      });
    }

    // Default: generate PDF
    const pdfBuffer = await generateInvoicePdf(invoiceData);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Invoice-${safeFileBase}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Invoice generation failed:", error);
    return NextResponse.json({ error: "Invoice generation failed" }, { status: 500 });
  }
}
