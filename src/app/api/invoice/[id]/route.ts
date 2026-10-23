import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { generateInvoicePdf } from "@/lib/billing/invoicePdf";
import { formatPaiseToInr } from "@/lib/billing/gst";
import { isDemoMode } from "@/lib/config/demo";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const customerName = String(jataka.name || order.user?.name || "Yajman");
    const customerPhone = String(jataka.phone || order.user?.phone || "");
    const customerEmail = (jataka.email as string) || order.user?.email || null;

    const invoiceNumber = order.invoiceNumber || `INV-TEMP-${order.orderNumber}`;

    const invoiceData = {
      invoiceNumber,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      siteName: adminSettings?.siteNameEn || "Maharshi Kanad Jyotish Kendra",
      siteAddress: adminSettings?.addressEn || "Dashashwamedh Ghat Marg, Varanasi, UP 221001",
      sitePhone: adminSettings?.phone1 || "+91-9827991224",
      siteEmail: adminSettings?.email || "vedic@kanad-jyotish.in",
      gstin: adminSettings?.gstin || null,
      customerName,
      customerPhone,
      customerEmail,
      serviceTitle: order.service?.titleEn || "Astrological Consultation",
      planTitle: order.plan?.titleEn || "Standard Tier",
      baseAmountPaise: order.baseAmountPaise,
      discountAmountPaise: order.discountAmountPaise,
      taxableAmountPaise: order.taxableAmountPaise,
      gstAmountPaise: order.gstAmountPaise,
      netAmountPaise: order.netAmountPaise,
      paymentMode: order.paymentMode,
      offerCode: order.offerCode,
    };

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    if (format === "html") {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoiceNumber} - ${invoiceData.siteName}</title>
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
  <div class="no-print" style="max-width: 800px; margin: 0 auto 16px auto; text-align: right;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #984700; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Print Invoice</button>
  </div>
  <div class="invoice-card">
    ${isDemoMode() ? '<div class="demo-watermark">DEMO INVOICE (नमूना)</div>' : ""}
    <div class="header">
      <h1 class="title">${invoiceData.siteName}</h1>
      <div class="subtitle">Vedic Astrological Heritage & Mathematical Computation Centre</div>
      <div style="font-size: 11px; color: #574237;">${invoiceData.siteAddress} | Phone: ${invoiceData.sitePhone} | Email: ${invoiceData.siteEmail}</div>
      <div style="font-size: 11px; color: #574237; margin-top: 4px;">${invoiceData.gstin ? `GSTIN: ${invoiceData.gstin}` : "GST: Not Applicable (Unregistered Ashram)"}</div>
    </div>

    <div class="meta-grid">
      <div class="meta-col">
        <strong>INVOICE DETAILS:</strong><br>
        Invoice Number: <strong>${invoiceNumber}</strong><br>
        Date: ${invoiceData.date.toLocaleDateString("en-IN")}<br>
        Order Ref: ${invoiceData.orderNumber}<br>
        Payment Mode: ${invoiceData.paymentMode} (PAID)
      </div>
      <div class="meta-col">
        <strong>BILLED TO (YAJMAN):</strong><br>
        Name: <strong>${invoiceData.customerName}</strong><br>
        Phone: ${invoiceData.customerPhone}<br>
        ${invoiceData.customerEmail ? `Email: ${invoiceData.customerEmail}<br>` : ""}
        Jurisdiction: Varanasi, Uttar Pradesh
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
            <strong>${invoiceData.serviceTitle}</strong><br>
            <span style="font-size: 11px; color: #574237;">Tier: ${invoiceData.planTitle}${invoiceData.offerCode ? ` (Offer: ${invoiceData.offerCode})` : ""}</span>
          </td>
          <td class="text-right">${formatPaiseToInr(invoiceData.baseAmountPaise)}</td>
          <td class="text-right">${invoiceData.discountAmountPaise > 0 ? `-${formatPaiseToInr(invoiceData.discountAmountPaise)}` : "₹0"}</td>
          <td class="text-right"><strong>${formatPaiseToInr(invoiceData.taxableAmountPaise)}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="total-box">
      <div style="display: flex; justify-content: space-between;">
        <span>Taxable Value:</span>
        <span>${formatPaiseToInr(invoiceData.taxableAmountPaise)}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>GST (18%):</span>
        <span>${formatPaiseToInr(invoiceData.gstAmountPaise)}</span>
      </div>
      <div class="grand-total" style="display: flex; justify-content: space-between;">
        <span>Total Auspicious Dakshina:</span>
        <span>${formatPaiseToInr(invoiceData.netAmountPaise)}</span>
      </div>
    </div>

    <div class="footer-note">
      <strong>Terms & Declaration:</strong><br>
      1. Pure mathematical ephemeris and astrological guidance derived according to classical Surya Siddhantic & Parashari principles.<br>
      2. Certified electronically by Maharshi Kanad Jyotish Kendra Peeth, Dashashwamedh Ghat, Varanasi.
    </div>
  </div>
</body>
</html>`;

      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    // Default: generate PDF
    const pdfBuffer = await generateInvoicePdf(invoiceData);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Invoice-${invoiceNumber}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Invoice generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
