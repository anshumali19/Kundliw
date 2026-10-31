import { Link } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ show?: string }>;
}

const MODE_LABEL: Record<string, string> = {
  RAZORPAY: "Razorpay",
  MANUAL_UPI: "UPI",
  MANUAL_BANK: "Bank transfer",
  MANUAL_QR: "QR code",
};

function rupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

/** Payments list: paid orders by gateway, and manual payments waiting to be checked. */
export default async function AdminPaymentsPage(props: Props) {
  const { locale } = await props.params;
  const { show } = await props.searchParams;
  await requireAdmin("/admin/payments", locale);
  const isHindi = locale === "hi";
  const t = (en: string, hi: string) => (isHindi ? hi : en);
  const view = show === "verify" ? "verify" : "paid";

  const [paidCount, verifyCount, orders] = await Promise.all([
    prisma.order.count({ where: { paymentStatus: "PAID" } }),
    prisma.order.count({ where: { paymentStatus: "AWAITING_VERIFICATION" } }),
    prisma.order.findMany({
      where: { paymentStatus: view === "verify" ? "AWAITING_VERIFICATION" : "PAID" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        paymentMode: true,
        netAmountPaise: true,
        invoiceNumber: true,
        razorpayPaymentId: true,
        manualPaymentRef: true,
        jatakaDetails: true,
        user: { select: { name: true, phone: true } },
      },
    }),
  ]);

  const tabs = [
    { id: "paid", en: "Successful payments", hi: "सफल भुगतान", count: paidCount },
    { id: "verify", en: "To verify (bank / UPI / QR)", hi: "सत्यापन हेतु (बैंक / UPI / QR)", count: verifyCount },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">{t("Payments & invoices", "भुगतान व इनवॉइस")}</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {t("Gateway payments appear here once paid. Manual transfers are checked against the screenshot and reference number inside the order.", "गेटवे भुगतान पूर्ण होते ही यहाँ दिखते हैं। मैनुअल भुगतान ऑर्डर में स्क्रीनशॉट और संदर्भ संख्या से जाँचे जाते हैं।")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={{ pathname: "/admin/payments", query: { show: tab.id } }}
            className={`inline-flex min-h-[44px] items-center rounded px-3 text-xs font-bold uppercase tracking-wider ${
              tab.id === view ? "bg-brand text-on-brand" : "border border-outline-variant text-on-surface hover:bg-surface-container-high"
            }`}
          >
            {isHindi ? tab.hi : tab.en} ({tab.count})
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded border border-outline-variant/60 bg-surface">
        {orders.length === 0 ? (
          <p className="p-6 text-center text-sm text-on-surface-variant">{t("Nothing here yet.", "अभी कुछ नहीं है।")}</p>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-surface-container text-xs uppercase tracking-wider text-on-surface-variant">
              <tr>
                <th className="px-3 py-2 text-left">{t("Order", "ऑर्डर")}</th>
                <th className="px-3 py-2 text-left">{t("Client", "ग्राहक")}</th>
                <th className="px-3 py-2 text-left">{t("Via", "माध्यम")}</th>
                <th className="px-3 py-2 text-left">{t("Reference", "संदर्भ")}</th>
                <th className="px-3 py-2 text-right">{t("Amount", "राशि")}</th>
                <th className="px-3 py-2 text-right">{view === "paid" ? t("Invoice", "इनवॉइस") : t("Action", "कार्य")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {orders.map((o) => {
                const name = String((o.jatakaDetails as Record<string, unknown> | null)?.name || o.user?.name || o.user?.phone || "-");
                return (
                  <tr key={o.id}>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-secondary">{o.orderNumber}</div>
                      <div className="text-xs text-on-surface-variant">{o.createdAt.toLocaleDateString("en-IN")}</div>
                    </td>
                    <td className="px-3 py-2.5">{name}</td>
                    <td className="px-3 py-2.5">{MODE_LABEL[o.paymentMode] ?? o.paymentMode}</td>
                    <td className="px-3 py-2.5 font-mono text-xs">{o.razorpayPaymentId || o.manualPaymentRef || "-"}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-secondary">{rupees(o.netAmountPaise)}</td>
                    <td className="px-3 py-2.5 text-right">
                      {view === "paid" ? (
                        <a href={`/api/invoice/${o.id}`} target="_blank" rel="noreferrer" className="inline-flex min-h-[40px] items-center font-bold text-primary hover:underline">
                          {o.invoiceNumber ?? t("Open", "खोलें")}
                        </a>
                      ) : (
                        <Link href="/admin/orders" className="inline-flex min-h-[40px] items-center font-bold text-primary hover:underline">
                          {t("Verify in orders", "ऑर्डर में सत्यापित करें")}
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
