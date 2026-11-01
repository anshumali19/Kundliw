import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { TicketsClient, type TicketView } from "@/features/tickets/TicketsClient";

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  await requireAdmin("/admin/tickets", locale);
  const isHindi = locale === "hi";

  const rows = await prisma.supportTicket.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: { messages: { orderBy: { createdAt: "asc" } }, user: { select: { name: true, phone: true, email: true } } },
  });
  const tickets: TicketView[] = rows.map((r) => ({
    id: r.id,
    ticketNumber: r.ticketNumber,
    subject: r.subject,
    orderNumber: r.orderNumber,
    topic: r.topic,
    contact: { name: r.contactName, email: r.contactEmail, phone: r.contactPhone, address: r.contactAddress },
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    who: r.user.name || r.user.phone || r.user.email || "",
    messages: r.messages.map((m) => ({ id: m.id, fromAdmin: m.fromAdmin, body: m.body, createdAt: m.createdAt.toISOString() })),
  }));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">{isHindi ? "सहायता टिकट" : "Support tickets"}</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {isHindi ? "ग्राहकों और एसोसिएट के बनाए टिकट। खोलें, उत्तर दें और स्थिति बदलें।" : "Tickets raised by customers and associates. Open one, reply, and change its status."}
        </p>
      </div>
      <TicketsClient tickets={tickets} mode="admin" isHindi={isHindi} />
    </div>
  );
}
