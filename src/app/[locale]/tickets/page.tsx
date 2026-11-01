import { BackBar } from "@/components/layout/BackBar";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { TicketsClient, type TicketView } from "@/features/tickets/TicketsClient";

export const dynamic = "force-dynamic";

export default async function TicketsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const user = await requireUser("/tickets", locale);
  const isHindi = locale === "hi";
  const t = (en: string, hi: string) => (isHindi ? hi : en);

  const [rows, orders] = await Promise.all([
    prisma.supportTicket.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, include: { messages: { orderBy: { createdAt: "asc" } } } }),
    prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30, select: { orderNumber: true } }),
  ]);
  const tickets: TicketView[] = rows.map((r) => ({
    id: r.id,
    ticketNumber: r.ticketNumber,
    subject: r.subject,
    orderNumber: r.orderNumber,
    topic: r.topic,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    messages: r.messages.map((m) => ({ id: m.id, fromAdmin: m.fromAdmin, body: m.body, createdAt: m.createdAt.toISOString() })),
  }));

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      <BackBar fallbackHref={user.role === "ASSOCIATE" ? "/associate" : "/account"} backLabel={t("Back", "वापस जाएँ")} />
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">{t("Support tickets", "सहायता टिकट")}</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {t("Have a problem with an order, a payment or your account? Raise a ticket and the Kendra will reply here.", "ऑर्डर, भुगतान या खाते में कोई समस्या है? टिकट बनाएँ, केंद्र का उत्तर यहीं मिलेगा।")}{" "}
          <Link href={user.role === "ASSOCIATE" ? "/associate" : "/account"} className="font-bold text-primary hover:underline">{t("Back to dashboard", "डैशबोर्ड पर वापस")}</Link>
        </p>
      </div>
      <TicketsClient tickets={tickets} orderNumbers={orders.map((o) => o.orderNumber)} mode="user" isHindi={isHindi} defaults={{ name: user.name ?? "", email: user.email ?? "", phone: user.phone ?? "" }} />
    </div>
  );
}
