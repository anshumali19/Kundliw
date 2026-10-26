import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardApiAdmin } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { checkDbRateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { createBackup, getBackupSettings, pruneBackups } from "@/lib/backup/service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Lists stored backups (never their contents) and the backup settings. */
export async function GET() {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  try {
    const [backups, settings] = await Promise.all([
      prisma.backupRecord.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { id: true, kind: true, sizeBytes: true, tables: true, rows: true, createdBy: true, createdAt: true },
      }),
      getBackupSettings(),
    ]);
    return NextResponse.json({ success: true, backups, settings });
  } catch (error) {
    console.error("[API Admin Backups GET] Error:", error);
    return NextResponse.json({ error: "Failed to load backups." }, { status: 500 });
  }
}

/** "Back up now": a manual copy. */
export async function POST(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  const limit = await checkDbRateLimit({
    scope: "ADMIN_BACKUP_NOW",
    identifier: guard.user.id,
    windowSeconds: 3600,
    maxAllowed: 10,
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many backups in an hour. Please wait a little." }, { status: 429 });
  }

  try {
    const backup = await createBackup("MANUAL", guard.user.id);
    return NextResponse.json({ success: true, backup }, { status: 201 });
  } catch (error) {
    console.error("[API Admin Backups POST] Error:", error);
    return NextResponse.json({ error: "Failed to create the backup." }, { status: 500 });
  }
}

const settingsSchema = z.object({
  autoEnabled: z.boolean(),
  keepDaily: z.number().int().min(1).max(60),
  keepWeekly: z.number().int().min(1).max(52),
  keepMonthly: z.number().int().min(1).max(60),
});

/** Saves the automatic backup rules and trims old copies to match. */
export async function PUT(request: NextRequest) {
  const guard = await guardApiAdmin();
  if (!guard.ok) return guard.errorResponse;
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) return csrf.errorResponse;

  try {
    const parsed = settingsSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the numbers." }, { status: 400 });
    }
    const v = parsed.data;
    const data = {
      backupAutoEnabled: v.autoEnabled,
      backupKeepDaily: v.keepDaily,
      backupKeepWeekly: v.keepWeekly,
      backupKeepMonthly: v.keepMonthly,
    };
    await prisma.adminSettings.upsert({ where: { id: "default" }, create: { id: "default", ...data }, update: data });
    const removed = await pruneBackups(v);
    return NextResponse.json({ success: true, removed });
  } catch (error) {
    console.error("[API Admin Backups PUT] Error:", error);
    return NextResponse.json({ error: "Failed to save backup settings." }, { status: 500 });
  }
}
