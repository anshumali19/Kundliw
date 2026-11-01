import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  subject: z.string().trim().min(3, "Write a short subject.").max(150),
  message: z.string().trim().min(5, "Describe your problem in a few words.").max(3000),
  orderNumber: z.string().trim().max(40).optional().nullable(),
  topic: z.string().trim().max(60).optional().nullable(),
  contactName: z.string().trim().min(2, "Please enter your name.").max(100),
  contactEmail: z.string().trim().email("Please enter a valid email.").max(150),
  contactPhone: z.string().trim().regex(/^[+\d][\d\s-]{6,17}$/, "Please enter a valid phone number."),
  contactAddress: z.string().trim().min(5, "Please enter your address.").max(300),
});

function newTicketNumber(): string {
  return `TKT-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.floor(Math.random() * 36 ** 2).toString(36).toUpperCase().padStart(2, "0")}`;
}

/** A signed-in customer or associate raises a support ticket. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to raise a ticket." }, { status: 401 });
  const csrf = validateCsrfOrigin(req);
  if (!csrf.isValid) return csrf.errorResponse;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 400 });

  // A customer can only refer to one of their own orders
  let orderNumber: string | null = null;
  if (parsed.data.orderNumber) {
    const own = await prisma.order.findFirst({ where: { orderNumber: parsed.data.orderNumber, userId: user.id }, select: { orderNumber: true } });
    orderNumber = own?.orderNumber ?? null;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const ticket = await prisma.supportTicket.create({
        data: {
          ticketNumber: newTicketNumber(),
          userId: user.id,
          subject: parsed.data.subject,
          orderNumber,
          topic: parsed.data.topic || null,
          contactName: parsed.data.contactName,
          contactEmail: parsed.data.contactEmail,
          contactPhone: parsed.data.contactPhone,
          contactAddress: parsed.data.contactAddress,
          messages: { create: { fromAdmin: false, body: parsed.data.message } },
        },
        select: { id: true, ticketNumber: true },
      });
      return NextResponse.json({ success: true, ticket });
    } catch (error) {
      if ((error as { code?: string }).code !== "P2002") {
        console.error("[API Tickets POST]", error);
        break;
      }
    }
  }
  return NextResponse.json({ error: "Could not raise the ticket. Please try again." }, { status: 500 });
}
