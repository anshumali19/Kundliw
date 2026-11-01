import { prisma } from "@/lib/prisma";

const IST_MS = 5.5 * 60 * 60 * 1000;

export interface GstRow {
  orderNumber: string;
  invoiceNumber: string | null;
  date: string;
  client: string;
  service: string;
  plan: string;
  taxablePaise: number;
  gstPaise: number;
  totalPaise: number;
  gstRatePercent: number;
}

export interface GstMonth {
  month: string; // YYYY-MM
  rows: GstRow[];
  taxablePaise: number;
  gstPaise: number;
  totalPaise: number;
  byService: Array<{ name: string; count: number; totalPaise: number }>;
  byPlan: Array<{ name: string; count: number; totalPaise: number }>;
}

/** A valid YYYY-MM, or the current month in India. */
export function resolveMonth(raw: string | undefined): string {
  if (raw && /^\d{4}-(0[1-9]|1[0-2])$/.test(raw)) return raw;
  return new Date(Date.now() + IST_MS).toISOString().slice(0, 7);
}

export function shiftMonth(month: string, by: number): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + by, 1)).toISOString().slice(0, 7);
}

/** All paid orders of one month (India time) with their tax split, for the GST report and its export. */
export async function loadGstMonth(month: string): Promise<GstMonth> {
  const [y, m] = month.split("-").map(Number);
  const from = new Date(Date.UTC(y, m - 1, 1) - IST_MS);
  const to = new Date(Date.UTC(y, m, 1) - IST_MS);

  const orders = await prisma.order.findMany({
    where: { paymentStatus: "PAID", createdAt: { gte: from, lt: to } },
    orderBy: { createdAt: "asc" },
    select: {
      orderNumber: true,
      invoiceNumber: true,
      createdAt: true,
      taxableAmountPaise: true,
      gstAmountPaise: true,
      netAmountPaise: true,
      gstRateBasisPoints: true,
      jatakaDetails: true,
      user: { select: { name: true, phone: true } },
      service: { select: { titleEn: true } },
      plan: { select: { titleEn: true } },
    },
  });

  const rows: GstRow[] = orders.map((o) => ({
    orderNumber: o.orderNumber,
    invoiceNumber: o.invoiceNumber,
    date: new Date(o.createdAt.getTime() + IST_MS).toISOString().slice(0, 10),
    client: String((o.jatakaDetails as Record<string, unknown> | null)?.name || o.user?.name || o.user?.phone || ""),
    service: o.service?.titleEn ?? "",
    plan: o.plan?.titleEn ?? "",
    taxablePaise: o.taxableAmountPaise,
    gstPaise: o.gstAmountPaise,
    totalPaise: o.netAmountPaise,
    gstRatePercent: o.gstRateBasisPoints / 100,
  }));

  const group = (key: (r: GstRow) => string) => {
    const map = new Map<string, { name: string; count: number; totalPaise: number }>();
    for (const r of rows) {
      const name = key(r) || "-";
      const cur = map.get(name) ?? { name, count: 0, totalPaise: 0 };
      cur.count += 1;
      cur.totalPaise += r.totalPaise;
      map.set(name, cur);
    }
    return [...map.values()].sort((a, b) => b.totalPaise - a.totalPaise);
  };

  return {
    month,
    rows,
    taxablePaise: rows.reduce((s, r) => s + r.taxablePaise, 0),
    gstPaise: rows.reduce((s, r) => s + r.gstPaise, 0),
    totalPaise: rows.reduce((s, r) => s + r.totalPaise, 0),
    byService: group((r) => r.service),
    byPlan: group((r) => `${r.service} / ${r.plan}`),
  };
}
