import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { DESKS, isDeskKind } from "@/lib/admin/desks";

type Ctx = { params: Promise<{ kind: string; id: string }> };

export async function PUT(req: NextRequest, props: Ctx) {
  const { kind, id } = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(req);
  if (!csrf.isValid) return csrf.errorResponse;
  if (!isDeskKind(kind)) return NextResponse.json({ error: "Unknown list." }, { status: 404 });

  const desk = DESKS[kind];
  const parsed = desk.schema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 400 });
  }
  try {
    const item = await desk.delegate.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error(`[API Admin Desk ${kind} PUT]`, error);
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: Ctx) {
  const { kind, id } = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(req);
  if (!csrf.isValid) return csrf.errorResponse;
  if (!isDeskKind(kind)) return NextResponse.json({ error: "Unknown list." }, { status: 404 });

  try {
    await DESKS[kind].delegate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[API Admin Desk ${kind} DELETE]`, error);
    return NextResponse.json({ error: "Could not delete." }, { status: 500 });
  }
}
