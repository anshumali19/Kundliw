import { prisma } from "@/lib/prisma";

export type RevenueRange = "daily" | "weekly" | "monthly";

export interface RevenuePoint {
  label: string;
  paise: number;
}

const IST_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight (IST) of the day holding `d`, as a real UTC instant. */
function istDayStart(d: Date): Date {
  const shifted = new Date(d.getTime() + IST_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - IST_MS);
}

const KUNDLI_TYPES = ["KUNDLI_REQUEST", "KUNDLI_MATCHING", "PRASHNA_KUNDLI"] as const;

/** Numbers for the "Today" strip and the "Users" strip on the admin dashboard. */
export async function loadTodaySummary() {
  const dayStart = istDayStart(new Date());
  const dayEnd = new Date(dayStart.getTime() + DAY_MS);
  const weekAgo = new Date(dayStart.getTime() - 6 * DAY_MS);

  const [ordersToday, pendingKundlis, callsToday, newUsersToday, newUsersWeek, totalUsers, activeClients] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: dayStart, lt: dayEnd } } }),
      prisma.order.count({
        where: { requestType: { in: [...KUNDLI_TYPES] }, status: { in: ["ORDER_RECEIVED", "KUNDLI_IN_PROGRESS"] } },
      }),
      prisma.order.count({
        where: { slot: { date: { gte: dayStart, lt: dayEnd } }, OR: [{ appointmentStatus: null }, { appointmentStatus: { not: "REJECTED" } }] },
      }),
      prisma.user.count({ where: { role: "USER", createdAt: { gte: dayStart, lt: dayEnd } } }),
      prisma.user.count({ where: { role: "USER", createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.order.groupBy({ by: ["userId"], where: { userId: { not: null } } }).then((g) => g.length),
    ]);

  return { ordersToday, pendingKundlis, callsToday, newUsersToday, newUsersWeek, totalUsers, activeClients };
}

/** Paid earnings grouped by day (30 days), week (12 weeks) or month (12 months), oldest first. */
export async function loadRevenueSeries(range: RevenueRange): Promise<RevenuePoint[]> {
  const todayStart = istDayStart(new Date());
  const buckets: Array<{ label: string; from: Date; to: Date }> = [];

  if (range === "daily") {
    for (let i = 29; i >= 0; i--) {
      const from = new Date(todayStart.getTime() - i * DAY_MS);
      buckets.push({ label: new Date(from.getTime() + IST_MS).toISOString().slice(5, 10), from, to: new Date(from.getTime() + DAY_MS) });
    }
  } else if (range === "weekly") {
    for (let i = 11; i >= 0; i--) {
      const from = new Date(todayStart.getTime() - (i * 7 + 6) * DAY_MS);
      buckets.push({ label: new Date(from.getTime() + IST_MS).toISOString().slice(5, 10), from, to: new Date(from.getTime() + 7 * DAY_MS) });
    }
  } else {
    const nowIst = new Date(Date.now() + IST_MS);
    for (let i = 11; i >= 0; i--) {
      const start = new Date(Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth() - i, 1));
      const end = new Date(Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth() - i + 1, 1));
      buckets.push({ label: start.toISOString().slice(0, 7), from: new Date(start.getTime() - IST_MS), to: new Date(end.getTime() - IST_MS) });
    }
  }

  const since = buckets[0].from;
  const paid = await prisma.order.findMany({
    where: { paymentStatus: "PAID", createdAt: { gte: since } },
    select: { createdAt: true, netAmountPaise: true },
  });

  return buckets.map((b) => ({
    label: b.label,
    paise: paid.filter((o) => o.createdAt >= b.from && o.createdAt < b.to).reduce((sum, o) => sum + o.netAmountPaise, 0),
  }));
}
