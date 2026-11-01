import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

const replySchema = z.object({ message: z.string().trim().min(1, "Write a message first.").max(3000) });
const statusSchema = z.object({ status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]) });

/** Adds a message to a ticket: the owner may write on their own, the admin on any. */
export async function POST(req: NextRequest, props: Ctx) {
  const { id } = await props.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const csrf = validateCsrfOrigin(req);
  if (!csrf.isValid) return csrf.errorResponse;

  const parsed = replySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Write a message first." }, { status: 400 });

  const ticket = await prisma.supportTicket.findUnique({ where: { id }, select: { id: true, userId: true } });
  const isAdmin = user.role === Role.ADMIN;
  if (!ticket || (!isAdmin && ticket.userId !== user.id)) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

  await prisma.$transaction([
    prisma.supportTicketMessage.create({ data: { ticketId: id, fromAdmin: isAdmin, body: parsed.data.message } }),
    // A reply from the customer re-opens a resolved ticket; the admin's first reply marks it in progress
    prisma.supportTicket.update({ where: { id }, data: { status: isAdmin ? "IN_PROGRESS" : "OPEN" } }),
  ]);
  return NextResponse.json({ success: true });
}

/** Admin only: change the status of a ticket. */
export async function PUT(req: NextRequest, props: Ctx) {
  const { id } = await props.params;
  const user = await getCurrentUser();
  if (!user || user.role !== Role.ADMIN) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const csrf = validateCsrfOrigin(req);
  if (!csrf.isValid) return csrf.errorResponse;

  const parsed = statusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Unknown status." }, { status: 400 });
  await prisma.supportTicket.update({ where: { id }, data: { status: parsed.data.status } }).catch(() => null);
  return NextResponse.json({ success: true });
}
