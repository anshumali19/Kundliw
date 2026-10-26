import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { generateInvoicePdf } from "@/lib/billing/invoicePdf";
import { formatPaiseToInr, formatGstRateBasisPoints } from "@/lib/billing/gst";
import { escapeHtml } from "@/lib/billing/html";
import { isDemoMode } from "@/lib/config/demo";

export const dynamic = "force-dynamic";

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

    const adminSettings = await prisma.adminSettings.findUnique({
      where: { id: "default" },
    });

    const jataka = (order.jatakaDetails as Record<string, unknown>) || {};
    const customerName = String(jataka.name || order.user?.name || "Customer");
    const customerPhone = String(jataka.phone || order.user?.phone || "");
    const customerEmail = (jataka.email as string) || order.user?.email || null;

    const invoiceNumber = order.invoiceNumber || `INV-TEMP-${order.orderNumber}`;

    const invoiceData = {
      invoiceNumber,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      siteName: adminSettings?.siteNameEn || "Maharshi Kanad Jyotish Kendra",
      siteAddress: adminSettings?.addressEn || "",
      sitePhone: adminSettings?.phone1 || "+91-9827991224",
      siteEmail: adminSettings?.email || "",
      gstin: adminSettings?.gstin || null,
      customerName,
      customerPhone,
      customerEmail,
      serviceTitle: order.service?.titleEn || "Astrological Consultation",
      planTitle: order.plan?.titleEn || "Standard Tier",
      baseAmountPaise: order.baseAmountPaise,
      discountAmountPaise: order.discountAmountPaise,
      taxableAmountPaise: order.taxableAmountPaise,
      gstRateBasisPoints: order.gstRateBasisPoints,
      gstAmountPaise: order.gstAmountPaise,
      netAmountPaise: order.netAmountPaise,
      paymentMode: order.paymentMode,
      paymentStatus: order.paymentStatus,
      offerCode: order.offerCode,
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
  <div class="invoice-card">
    ${isDemoMode() && process.env.NODE_ENV !== "production" ? '<div class="demo-watermark">DEMO INVOICE (नमूना)</div>' : ""}
    <div class="header">
      <h1 class="title">${safe.siteName}</h1>
      <div class="subtitle">Vedic Astrological Heritage & Mathematical Computation Centre</div>
      <div style="font-size: 11px; color: #574237;">${[safe.siteAddress, `Phone: ${safe.sitePhone}`, safe.siteEmail ? `Email: ${safe.siteEmail}` : ""].filter(Boolean).join(" | ")}</div>
      <div style="font-size: 11px; color: #574237; margin-top: 4px;">${safe.gstin ? `GSTIN: ${safe.gstin}` : "GST: Not Applicable (Unregistered Kendra)"}</div>
    </div>

    <div class="meta-grid">
      <div class="meta-col">
        <strong>INVOICE DETAILS:</strong><br>
        Invoice Number: <strong>${safe.invoiceNumber}</strong><br>
        Date: ${safe.date}<br>
        Order Ref: ${safe.orderNumber}<br>
        Payment Mode: ${safe.paymentMode} (${safe.paymentStatus})
      </div>
      <div class="meta-col">
        <strong>BILLED TO (CUSTOMER):</strong><br>
        Name: <strong>${safe.customerName}</strong><br>
        Phone: ${safe.customerPhone}<br>
        ${safe.customerEmail ? `Email: ${safe.customerEmail}<br>` : ""}
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
            <span style="font-size: 11px; color: #574237;">Tier: ${safe.planTitle}${safe.offerCode ? ` (Offer: ${safe.offerCode})` : ""}</span>
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
      1. Pure mathematical ephemeris and astrological guidance derived according to classical Surya Siddhantic & Parashari principles.<br>
      2. Issued electronically by Maharshi Kanad Jyotish Kendra.
    </div>
  </div>
</body>
</html>`;

      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `inline; filename="Invoice-${safeFileBase}.html"`,
          "Content-Security-Policy":
            "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; script-src 'none'; connect-src 'none'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'",
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
