import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { loadGstMonth, resolveMonth } from "@/lib/admin/reports";

export const dynamic = "force-dynamic";

const cell = (v: string | number) => {
  const s = String(v);
  // Quote text, and stop spreadsheet programs from running a cell that starts with = + - @
  const safe = /^[=+\-@]/.test(s) && Number.isNaN(Number(s)) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};
const rupees = (paise: number) => (paise / 100).toFixed(2);

/** The month's GST report as a CSV file that opens in Excel. */
export async function GET(req: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const month = resolveMonth(req.nextUrl.searchParams.get("month") ?? undefined);
  const data = await loadGstMonth(month);

  const lines = [
    ["Invoice", "Order", "Date", "Client", "Service", "Plan", "Taxable (INR)", "GST rate %", "CGST (INR)", "SGST (INR)", "GST total (INR)", "Total (INR)"].map(cell).join(","),
    ...data.rows.map((r) =>
      [
        r.invoiceNumber ?? "",
        r.orderNumber,
        r.date,
        r.client,
        r.service,
        r.plan,
        rupees(r.taxablePaise),
        r.gstRatePercent,
        rupees(r.gstPaise / 2),
        rupees(r.gstPaise / 2),
        rupees(r.gstPaise),
        rupees(r.totalPaise),
      ]
        .map(cell)
        .join(",")
    ),
    ["", "", "", "", "", "TOTAL", rupees(data.taxablePaise), "", rupees(data.gstPaise / 2), rupees(data.gstPaise / 2), rupees(data.gstPaise), rupees(data.totalPaise)].map(cell).join(","),
  ];

  return new NextResponse("﻿" + lines.join("\r\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="gst-report-${month}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
