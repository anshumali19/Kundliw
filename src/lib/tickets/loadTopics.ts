import { prisma } from "@/lib/prisma";
import { TICKET_TOPICS, TICKET_TOPICS_KEY, type TicketTopic } from "@/lib/tickets/topics";

/** The ready-made ticket questions the admin saved, or the standard list until they change it. */
export async function loadTicketTopics(): Promise<TicketTopic[]> {
  const row = await prisma.siteConfig.findUnique({ where: { key: TICKET_TOPICS_KEY } }).catch(() => null);
  if (!row || !Array.isArray(row.value)) return TICKET_TOPICS;
  const list = (row.value as unknown[])
    .map((v) => {
      const r = (v ?? {}) as Record<string, unknown>;
      return { id: String(r.id ?? ""), en: String(r.en ?? ""), hi: String(r.hi ?? "") };
    })
    .filter((t) => t.id && (t.en || t.hi));
  // An empty saved list is a real choice: customers then just type their own question
  return list;
}
