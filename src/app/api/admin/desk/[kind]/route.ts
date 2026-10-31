import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { DESKS, isDeskKind } from "@/lib/admin/desks";

export async function GET(_req: NextRequest, props: { params: Promise<{ kind: string }> }) {
  const { kind } = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  if (!isDeskKind(kind)) return NextResponse.json({ error: "Unknown list." }, { status: 404 });

  const desk = DESKS[kind];
  const items = await desk.delegate.findMany({ orderBy: desk.orderBy });
  return NextResponse.json({ success: true, items });
}

export async function POST(req: NextRequest, props: { params: Promise<{ kind: string }> }) {
  const { kind } = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(req);
  if (!csrf.isValid) return csrf.errorResponse;
  if (!isDeskKind(kind)) return NextResponse.json({ error: "Unknown list." }, { status: 404 });

  const desk = DESKS[kind];
  const parsed = desk.schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 400 });
  }
  try {
    const item = await desk.delegate.create({ data: parsed.data });
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error(`[API Admin Desk ${kind} POST]`, error);
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }
}
