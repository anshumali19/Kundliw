import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { readBackup } from "@/lib/backup/service";

export const dynamic = "force-dynamic";

/** Downloads one stored backup as a JSON file. */
export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  try {
    const backup = await readBackup(id);
    if (!backup) return NextResponse.json({ error: "Backup not found." }, { status: 404 });
    const stamp = backup.createdAt.toISOString().slice(0, 16).replace(/[:T]/g, "-");
    return new NextResponse(backup.json, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="kanad-backup-${backup.kind.toLowerCase()}-${stamp}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[API Admin Backups download] Error:", error);
    return NextResponse.json({ error: "Failed to read the backup." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    await prisma.backupRecord.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Backup not found." }, { status: 404 });
    }
    console.error("[API Admin Backups DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to remove the backup." }, { status: 500 });
  }
}
