import { NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { checkDbRateLimit } from "@/lib/rateLimit";
import { buildBackupSnapshot } from "@/lib/backup/export";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Downloads a JSON snapshot of site content and records. Admin only. */
export async function GET() {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;

  const limit = await checkDbRateLimit({
    scope: "ADMIN_BACKUP",
    identifier: guard.user.id,
    windowSeconds: 3600,
    maxAllowed: 10,
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many backup requests. Please try later." }, { status: 429 });
  }

  try {
    const snapshot = await buildBackupSnapshot();
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(snapshot, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="kanad-backup-${stamp}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[API Admin Backup] Error:", error);
    return NextResponse.json({ error: "Failed to create backup." }, { status: 500 });
  }
}
