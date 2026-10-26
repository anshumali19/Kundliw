import PDFDocument from "pdfkit";
import { formatPaiseToInr, formatGstRateBasisPoints } from "./gst";
import { isDemoMode } from "@/lib/config/demo";

export interface InvoicePdfData {
  invoiceNumber: string;
  orderNumber: string;
  date: Date;
  siteName: string;
  siteAddress: string;
  sitePhone: string;
  siteEmail: string;
  gstin?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  serviceTitle: string;
  planTitle: string;
  baseAmountPaise: number;
  discountAmountPaise: number;
  taxableAmountPaise: number;
  gstRateBasisPoints?: number;
  gstAmountPaise: number;
  netAmountPaise: number;
  paymentMode: string;
  paymentStatus?: string | null;
  offerCode?: string | null;
}

/**
 * Generates a formal PDF invoice document using PDFKit.
 * When DEMO_MODE is true, renders a clear "DEMO INVOICE" watermark across the document.
 */
export async function generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        info: {
          Title: `Invoice - ${data.invoiceNumber}`,
          Author: data.siteName,
          Subject: `Vedic Consultation Invoice ${data.orderNumber}`,
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // DEMO WATERMARK (if DEMO_MODE is on)
      if (isDemoMode() && process.env.NODE_ENV !== "production") {
        doc.save();
        doc.rotate(-35, { origin: [300, 420] });
        doc.fontSize(52);
        doc.fillColor("#b09080");
        doc.opacity(0.14);
        doc.text("DEMO INVOICE (नमूना)", 100, 400, { align: "center", width: 450 });
        doc.fontSize(16);
        doc.text("NOT A LIVE TAX DOCUMENT", 100, 460, { align: "center", width: 450 });
        doc.restore();
      }

      // Top Header
      doc.fillColor("#6B1D1D"); // Maroon
      doc.fontSize(18);
      doc.font("Helvetica-Bold").text(data.siteName.toUpperCase(), 40, 40);

      doc.fillColor("#984700"); // Saffron
      doc.fontSize(9);
      doc.font("Helvetica").text("Vedic Astrological Heritage & Mathematical Computation Centre", 40, 62);

      doc.fillColor("#574237");
      doc.fontSize(8);
      doc.text([data.siteAddress, `Phone: ${data.sitePhone}`, data.siteEmail ? `Email: ${data.siteEmail}` : ""].filter(Boolean).join(" | "), 40, 75);

      if (data.gstin) {
        doc.text(`GSTIN: ${data.gstin} (Composite / Regulated Astrology Service)`, 40, 87);
      } else {
        doc.text("GST: Not Applicable (Unregistered / Direct Kendra Consultation)", 40, 87);
      }

      // Horizontal Hairline
      doc.strokeColor("#6B1D1D").lineWidth(1.5).moveTo(40, 102).lineTo(555, 102).stroke();

      // Invoice & Customer Meta Box (Split 2-Column)
      doc.fillColor("#241915");
      doc.fontSize(10);
      doc.font("Helvetica-Bold").text("TAX INVOICE / DAKSHINA RECEIPT", 40, 115);

      doc.fontSize(8.5);
      doc.font("Helvetica");
      doc.text(`Invoice No: ${data.invoiceNumber}`, 40, 130);
      doc.text(`Date of Issue: ${data.date.toLocaleDateString("en-IN")}`, 40, 142);
      doc.text(`Booking Reference: ${data.orderNumber}`, 40, 154);
      doc.text(`Payment Mode: ${data.paymentMode} (Status: ${String(data.paymentStatus || "PENDING").replace(/_/g, " ")})`, 40, 166);

      // Customer Details (Right column)
      doc.font("Helvetica-Bold").text("BILLED TO (CUSTOMER):", 330, 115);
      doc.font("Helvetica");
      doc.text(`Name: ${data.customerName}`, 330, 130);
      doc.text(`Phone: ${data.customerPhone}`, 330, 142);
      if (data.customerEmail) {
        doc.text(`Email: ${data.customerEmail}`, 330, 154);
      }

      // Line items table header
      const tableTop = 190;
      doc.rect(40, tableTop, 515, 20).fill("#F4DED7");
      doc.fillColor("#6B1D1D").font("Helvetica-Bold").fontSize(8.5);
      doc.text("SL", 48, tableTop + 5);
      doc.text("SERVICE / CONSULTATION PARTICULARS", 80, tableTop + 5);
      doc.text("BASE", 360, tableTop + 5, { width: 50, align: "right" });
      doc.text("DISCOUNT", 420, tableTop + 5, { width: 55, align: "right" });
      doc.text("NET AMOUNT", 485, tableTop + 5, { width: 65, align: "right" });

      // Line item row
      const rowY = tableTop + 26;
      doc.fillColor("#241915").font("Helvetica-Bold").fontSize(9);
      doc.text("1", 48, rowY);
      doc.text(data.serviceTitle, 80, rowY);

      doc.font("Helvetica").fontSize(8).fillColor("#574237");
      doc.text(`Tier: ${data.planTitle} | Includes astrological calculation and personal consultation.`, 80, rowY + 13);
      if (data.offerCode) {
        doc.text(`Special Offer Applied: ${data.offerCode}`, 80, rowY + 24);
      }

      // Amounts
      doc.fillColor("#241915").fontSize(8.5);
      doc.text(formatPaiseToInr(data.baseAmountPaise), 360, rowY, { width: 50, align: "right" });
      doc.text(
        data.discountAmountPaise > 0 ? `-${formatPaiseToInr(data.discountAmountPaise)}` : "₹0",
        420,
        rowY,
        { width: 55, align: "right" }
      );
      doc.font("Helvetica-Bold");
      doc.text(formatPaiseToInr(data.taxableAmountPaise), 485, rowY, { width: 65, align: "right" });

      // Bottom border for item
      doc.strokeColor("#DEC1B1").lineWidth(0.5).moveTo(40, rowY + 40).lineTo(555, rowY + 40).stroke();

      // Calculation summary box
      const calcY = rowY + 50;
      doc.font("Helvetica").fontSize(8.5).fillColor("#574237");

      doc.text("Taxable Value (कर योग्य दक्षिणा):", 340, calcY);
      doc.text(formatPaiseToInr(data.taxableAmountPaise), 485, calcY, { width: 65, align: "right" });

      doc.text(`Goods & Services Tax (GST @ ${formatGstRateBasisPoints(data.gstRateBasisPoints ?? 1800)}%):`, 340, calcY + 14);
      doc.text(formatPaiseToInr(data.gstAmountPaise), 485, calcY + 14, { width: 65, align: "right" });

      doc.strokeColor("#6B1D1D").lineWidth(1).moveTo(340, calcY + 30).lineTo(555, calcY + 30).stroke();

      doc.fillColor("#6B1D1D").font("Helvetica-Bold").fontSize(10);
      doc.text("TOTAL DAKSHINA (कुल देय):", 340, calcY + 36);
      doc.text(formatPaiseToInr(data.netAmountPaise), 475, calcY + 36, { width: 75, align: "right" });

      // Notes and declaration
      const notesY = calcY + 70;
      doc.rect(40, notesY, 515, 65).fill("#FFF8F6");
      doc.rect(40, notesY, 515, 65).strokeColor("#DEC1B1").lineWidth(0.5).stroke();

      doc.fillColor("#6B1D1D").font("Helvetica-Bold").fontSize(8);
      doc.text("DECLARATION & TERMS:", 48, notesY + 8);

      doc.fillColor("#574237").font("Helvetica").fontSize(7.5);
      doc.text(
        "1. All calculations strictly adhere to Surya Siddhanta, Parashara Hora Shastra, and Drik mathematical systems.",
        48,
        notesY + 20
      );
      doc.text(
        "2. Astrological Dakshina is utilized for Kendra preservation, Vedic pandits, and scholarly research.",
        48,
        notesY + 30
      );
      doc.text(
        "3. This is a computer-generated invoice issued by Maharshi Kanad Jyotish Kendra.",
        48,
        notesY + 40
      );

      // Auspicious Footer Shloka
      doc.fillColor("#984700").font("Helvetica-Bold").fontSize(9);
      doc.text(
        "Om Sarve Bhavantu Sukhinah Sarve Santu Niramayah",
        40,
        notesY + 95,
        { align: "center", width: 515 }
      );
      doc.fillColor("#574237").font("Helvetica").fontSize(7.5);
      doc.text(
        "Maharshi Kanad Jyotish Kendra • Digital Ephemeris Records",
        40,
        notesY + 110,
        { align: "center", width: 515 }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
