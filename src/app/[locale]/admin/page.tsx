import { Link } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { loadRevenueSeries, loadTodaySummary, type RevenueRange } from "@/lib/admin/dashboardStats";
import { RevenueChart } from "@/components/admin/dashboard/RevenueChart";

export const dynamic = "force-dynamic";

interface AdminDashboardPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ range?: string }>;
}

function rupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

const STATUS_LABELS: Record<string, { en: string; hi: string }> = {
  ORDER_RECEIVED: { en: "Order received", hi: "ऑर्डर प्राप्त" },
  KUNDLI_IN_PROGRESS: { en: "In progress", hi: "कार्य जारी" },
  KUNDLI_COMPLETE: { en: "Completed", hi: "तैयार" },
  DISPATCHED: { en: "Dispatched", hi: "भेजा गया" },
  DELIVERED: { en: "Delivered", hi: "वितरित" },
  EXECUTION_COMPLETE: { en: "Closed", hi: "पूर्ण" },
};

const QUICK_LINKS = [
  { href: "/admin/services", en: "Services and plans", hi: "सेवाएँ और प्लान" },
  { href: "/admin/offers", en: "Offers", hi: "ऑफ़र" },
  { href: "/admin/orders", en: "Orders", hi: "ऑर्डर" },
  { href: "/admin/vault", en: "Upload a Kundli PDF", hi: "कुंडली PDF अपलोड" },
  { href: "/admin/banners", en: "Banners", hi: "बैनर" },
  { href: "/admin/gallery", en: "Gallery", hi: "गैलरी" },
  { href: "/admin/blogs", en: "Blog posts", hi: "ब्लॉग" },
  { href: "/admin/settings", en: "Site settings", hi: "साइट सेटिंग" },
];

export default async function AdminDashboardPage(props: AdminDashboardPageProps) {
  const { locale } = await props.params;
  const { range: rawRange } = await props.searchParams;
  const range: RevenueRange = rawRange === "weekly" || rawRange === "monthly" ? rawRange : "daily";
  await requireAdmin("/admin", locale);
  const isHindi = locale === "hi";
  const t = (en: string, hi: string) => (isHindi ? hi : en);

  const [today, series] = await Promise.all([loadTodaySummary(), loadRevenueSeries(range)]);

  const todayCards = [
    { label: t("New orders today", "आज के नए ऑर्डर"), value: today.ordersToday, href: "/admin/orders" },
    { label: t("Pending Kundli / Prashna", "लंबित कुंडली / प्रश्न"), value: today.pendingKundlis, href: "/admin/orders?queue=kundli", highlight: today.pendingKundlis > 0 },
    { label: t("Calls scheduled today", "आज के निर्धारित कॉल"), value: today.callsToday, href: "/admin/calls" },
    { label: t("New users today", "आज के नए उपयोगकर्ता"), value: today.newUsersToday, href: "/admin/users" },
    { label: t("New users (7 days)", "नए उपयोगकर्ता (7 दिन)"), value: today.newUsersWeek, href: "/admin/users" },
    { label: t("Active clients", "सक्रिय ग्राहक"), value: today.activeClients, href: "/admin/users" },
  ];

  const [
    totalOrders,
    awaitingVerification,
    statusGroups,
    revenue,
    customers,
    associates,
    openEnquiries,
    activeServices,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { paymentStatus: "AWAITING_VERIFICATION" } }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { netAmountPaise: true } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "ASSOCIATE" } }),
    prisma.contactEnquiry.count({ where: { isResolved: false } }),
    prisma.service.count({ where: { isActive: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        status: true,
        paymentStatus: true,
        netAmountPaise: true,
        service: { select: { titleEn: true, titleHi: true } },
      },
    }),
  ]);

  const cards = [
    { label: t("Total orders", "कुल ऑर्डर"), value: totalOrders.toString(), href: "/admin/orders" },
    {
      label: t("Payments to verify", "सत्यापन हेतु भुगतान"),
      value: awaitingVerification.toString(),
      href: "/admin/orders",
      highlight: awaitingVerification > 0,
    },
    {
      label: t("Revenue (paid)", "प्राप्त राशि"),
      value: rupees(revenue._sum.netAmountPaise ?? 0),
      href: "/admin/orders",
    },
    { label: t("Customers", "ग्राहक"), value: customers.toString(), href: "/admin/users" },
    { label: t("Associates", "एसोसिएट"), value: associates.toString(), href: "/admin/users" },
    {
      label: t("Open enquiries", "खुली पूछताछ"),
      value: openEnquiries.toString(),
      href: "/admin/enquiries",
      highlight: openEnquiries > 0,
    },
    { label: t("Active services", "सक्रिय सेवाएँ"), value: activeServices.toString(), href: "/admin/services" },
  ];

  const counts = new Map(statusGroups.map((g) => [g.status as string, g._count._all]));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-left">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">
          {t("Dashboard", "डैशबोर्ड")}
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {t("A summary of orders, payments and requests.", "ऑर्डर, भुगतान और अनुरोधों का सार।")}
        </p>
      </div>

      <section aria-labelledby="today-title" className="space-y-3">
        <h2 id="today-title" className="font-serif text-lg font-bold text-secondary">{t("Today", "आज")}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {todayCards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className={`p-4 rounded border bg-surface hover:border-secondary transition-colors ${c.highlight ? "border-primary" : "border-outline-variant/60"}`}
            >
              <div className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">{c.label}</div>
              <div className="font-serif text-2xl font-bold text-secondary mt-1">{c.value}</div>
            </Link>
          ))}
        </div>
      </section>

      <RevenueChart points={series} range={range} isHindi={isHindi} />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`p-4 rounded border bg-surface hover:border-secondary transition-colors ${
              card.highlight ? "border-primary" : "border-outline-variant/60"
            }`}
          >
            <div className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
              {card.label}
            </div>
            <div className="font-serif text-2xl font-bold text-secondary mt-1">{card.value}</div>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-outline-variant/60 rounded">
          <h2 className="font-serif text-lg font-bold text-secondary px-4 py-3 border-b border-outline-variant/50">
            {t("Recent orders", "हाल के ऑर्डर")}
          </h2>
          {recentOrders.length === 0 ? (
            <p className="p-4 text-sm text-on-surface-variant">{t("No orders yet.", "अभी कोई ऑर्डर नहीं है।")}</p>
          ) : (
            <ul className="divide-y divide-outline-variant/40">
              {recentOrders.map((order) => (
                <li key={order.id} className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div>
                    <div className="font-semibold text-secondary">{order.orderNumber}</div>
                    <div className="text-xs text-on-surface-variant">
                      {(isHindi ? order.service?.titleHi : order.service?.titleEn) || "-"} ·{" "}
                      {order.createdAt.toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-secondary">{rupees(order.netAmountPaise)}</div>
                    <div className="text-xs text-on-surface-variant">
                      {isHindi
                        ? STATUS_LABELS[order.status]?.hi
                        : STATUS_LABELS[order.status]?.en}{" "}
                      · {order.paymentStatus.replace(/_/g, " ").toLowerCase()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="px-4 py-3 border-t border-outline-variant/50">
            <Link href="/admin/orders" className="inline-flex items-center min-h-[44px] text-sm font-bold text-primary uppercase tracking-wider hover:underline">
              {t("All orders", "सभी ऑर्डर")}
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface border border-outline-variant/60 rounded">
            <h2 className="font-serif text-lg font-bold text-secondary px-4 py-3 border-b border-outline-variant/50">
              {t("Orders by stage", "चरण अनुसार ऑर्डर")}
            </h2>
            <ul className="divide-y divide-outline-variant/40">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <li key={key} className="px-4 py-2.5 flex justify-between text-sm">
                  <span>{isHindi ? label.hi : label.en}</span>
                  <span className="font-bold text-secondary">{counts.get(key) ?? 0}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface border border-outline-variant/60 rounded">
            <h2 className="font-serif text-lg font-bold text-secondary px-4 py-3 border-b border-outline-variant/50">
              {t("Quick actions", "त्वरित कार्य")}
            </h2>
            <ul className="p-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block px-2 py-2.5 text-sm text-on-surface hover:text-primary hover:bg-surface-container-low rounded min-h-[44px]"
                  >
                    {isHindi ? link.hi : link.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
