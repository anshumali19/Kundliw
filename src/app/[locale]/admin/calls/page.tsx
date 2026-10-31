import { Link } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ m?: string }>;
}

const IST_MS = 5.5 * 60 * 60 * 1000;

/** Month calendar of booked call slots; the month is the ?m=YYYY-MM query. */
export default async function AdminCallsPage(props: Props) {
  const { locale } = await props.params;
  const { m } = await props.searchParams;
  await requireAdmin("/admin/calls", locale);
  const isHindi = locale === "hi";
  const t = (en: string, hi: string) => (isHindi ? hi : en);

  const nowIst = new Date(Date.now() + IST_MS);
  const match = /^(\d{4})-(\d{2})$/.exec(m ?? "");
  const year = match ? Number(match[1]) : nowIst.getUTCFullYear();
  const month = match ? Number(match[2]) - 1 : nowIst.getUTCMonth();
  const first = new Date(Date.UTC(year, month, 1));
  const next = new Date(Date.UTC(year, month + 1, 1));
  const key = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

  const orders = await prisma.order.findMany({
    where: {
      slotId: { not: null },
      slot: { date: { gte: new Date(first.getTime() - IST_MS), lt: new Date(next.getTime() - IST_MS) } },
      OR: [{ appointmentStatus: null }, { appointmentStatus: { not: "REJECTED" } }],
    },
    select: {
      id: true,
      orderNumber: true,
      appointmentStatus: true,
      jatakaDetails: true,
      service: { select: { titleEn: true, titleHi: true } },
      slot: { select: { date: true, startTime: true, endTime: true } },
    },
    orderBy: { slot: { date: "asc" } },
  });

  const byDay = new Map<number, typeof orders>();
  for (const o of orders) {
    if (!o.slot) continue;
    const day = new Date(o.slot.date.getTime() + IST_MS).getUTCDate();
    byDay.set(day, [...(byDay.get(day) ?? []), o]);
  }
  for (const list of byDay.values()) list.sort((a, b) => (a.slot?.startTime ?? "").localeCompare(b.slot?.startTime ?? ""));

  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const lead = first.getUTCDay();
  const cells: Array<number | null> = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const todayDay = key(nowIst) === key(first) ? nowIst.getUTCDate() : -1;
  const weekdays = isHindi ? ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const title = first.toLocaleDateString(isHindi ? "hi-IN" : "en-IN", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">{t("Call bookings", "कॉल बुकिंग")}</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t("Time slots booked by clients. Open an order to approve or complete the call. To add or remove slots, use Appointment slots.", "ग्राहकों द्वारा बुक किए गए समय। कॉल स्वीकार या पूर्ण करने के लिए ऑर्डर खोलें। स्लॉट जोड़ने के लिए 'अपॉइंटमेंट स्लॉट' देखें।")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={{ pathname: "/admin/calls", query: { m: key(new Date(Date.UTC(year, month - 1, 1))) } }} className="inline-flex min-h-[44px] items-center rounded border border-outline-variant px-3 text-sm font-semibold hover:bg-surface-container-high">
            ‹ {t("Previous", "पिछला")}
          </Link>
          <span className="min-w-[8rem] text-center font-serif font-bold text-secondary">{title}</span>
          <Link href={{ pathname: "/admin/calls", query: { m: key(next) } }} className="inline-flex min-h-[44px] items-center rounded border border-outline-variant px-3 text-sm font-semibold hover:bg-surface-container-high">
            {t("Next", "अगला")} ›
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[720px] grid-cols-7 gap-px rounded border border-outline-variant/60 bg-outline-variant/60 text-sm">
          {weekdays.map((d) => (
            <div key={d} className="bg-surface-container px-2 py-1.5 text-center text-xs font-bold uppercase tracking-wider text-on-surface-variant">{d}</div>
          ))}
          {cells.map((day, i) => (
            <div key={i} className={`min-h-[96px] bg-surface p-1.5 ${day === todayDay ? "ring-2 ring-inset ring-primary" : ""}`}>
              {day && (
                <>
                  <div className="text-xs font-bold text-secondary">{day}</div>
                  <ul className="mt-1 space-y-1">
                    {(byDay.get(day) ?? []).map((o) => {
                      const name = String((o.jatakaDetails as Record<string, unknown> | null)?.name ?? "");
                      return (
                        <li key={o.id} className="rounded bg-brand/15 px-1.5 py-1 text-[11px] leading-tight">
                          <span className="font-bold text-primary">{o.slot?.startTime}</span> {name || o.orderNumber}
                          <span className="block text-on-surface-variant">
                            {(isHindi ? o.service?.titleHi : o.service?.titleEn) || ""}
                            {o.appointmentStatus ? ` · ${o.appointmentStatus.toLowerCase()}` : ""}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/admin/slots" className="font-bold text-primary hover:underline">{t("Appointment slots", "अपॉइंटमेंट स्लॉट")}</Link>
        <Link href="/admin/orders" className="font-bold text-primary hover:underline">{t("Orders", "ऑर्डर")}</Link>
        <Link href="/admin/enquiries" className="font-bold text-primary hover:underline">{t("Enquiries", "पूछताछ")}</Link>
      </div>
    </div>
  );
}
