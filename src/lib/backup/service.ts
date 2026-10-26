import { gunzipSync, gzipSync } from "zlib";
import { prisma } from "@/lib/prisma";
import { buildBackupSnapshot } from "./export";

export type BackupKind = "MANUAL" | "DAILY" | "WEEKLY" | "MONTHLY";

export interface BackupSettings {
  autoEnabled: boolean;
  keepDaily: number;
  keepWeekly: number;
  keepMonthly: number;
}

export async function getBackupSettings(): Promise<BackupSettings> {
  const s = await prisma.adminSettings
    .findUnique({
      where: { id: "default" },
      select: { backupAutoEnabled: true, backupKeepDaily: true, backupKeepWeekly: true, backupKeepMonthly: true },
    })
    .catch(() => null);
  return {
    autoEnabled: s?.backupAutoEnabled ?? true,
    keepDaily: s?.backupKeepDaily ?? 7,
    keepWeekly: s?.backupKeepWeekly ?? 4,
    keepMonthly: s?.backupKeepMonthly ?? 12,
  };
}

/** Takes a copy of the site's content and records and stores it (compressed) in the database. */
export async function createBackup(kind: BackupKind, createdBy?: string | null) {
  const snapshot = await buildBackupSnapshot();
  const tables = Object.entries(snapshot).filter(([, v]) => Array.isArray(v));
  const rows = tables.reduce((sum, [, v]) => sum + (v as unknown[]).length, 0);
  const data = gzipSync(Buffer.from(JSON.stringify(snapshot), "utf-8"), { level: 9 });

  return prisma.backupRecord.create({
    data: {
      kind,
      sizeBytes: data.length,
      tables: tables.length,
      rows,
      data,
      createdBy: createdBy ?? null,
    },
    select: { id: true, kind: true, sizeBytes: true, tables: true, rows: true, createdAt: true },
  });
}

/** Returns the readable JSON of a stored backup. */
export async function readBackup(id: string): Promise<{ json: string; kind: string; createdAt: Date } | null> {
  const record = await prisma.backupRecord.findUnique({ where: { id } });
  if (!record) return null;
  return {
    json: gunzipSync(Buffer.from(record.data)).toString("utf-8"),
    kind: record.kind,
    createdAt: record.createdAt,
  };
}

/** Deletes the oldest copies of each kind so only the configured number is kept. */
export async function pruneBackups(settings?: BackupSettings): Promise<number> {
  const s = settings ?? (await getBackupSettings());
  const keep: Record<string, number> = { DAILY: s.keepDaily, WEEKLY: s.keepWeekly, MONTHLY: s.keepMonthly };
  let removed = 0;
  for (const [kind, count] of Object.entries(keep)) {
    const old = await prisma.backupRecord.findMany({
      where: { kind },
      orderBy: { createdAt: "desc" },
      skip: Math.max(count, 1),
      select: { id: true },
    });
    if (old.length > 0) {
      const res = await prisma.backupRecord.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
      removed += res.count;
    }
  }
  return removed;
}

const HOUR = 60 * 60 * 1000;

/** The Kendra works in Indian time, so "Sunday" and "the 1st" are decided in IST. */
function istParts(now: Date) {
  const ist = new Date(now.getTime() + 5.5 * HOUR);
  return { weekday: ist.getUTCDay(), dayOfMonth: ist.getUTCDate() };
}

/**
 * Runs from the daily scheduled job: always a daily copy, plus a weekly copy on Sundays and a
 * monthly copy on the 1st. A kind that already has a recent copy is skipped, so a repeated call is harmless.
 */
export async function runScheduledBackups(now: Date = new Date()): Promise<{ created: BackupKind[]; removed: number; skipped?: string }> {
  const settings = await getBackupSettings();
  if (!settings.autoEnabled) return { created: [], removed: 0, skipped: "Automatic backups are switched off." };

  const { weekday, dayOfMonth } = istParts(now);
  const wanted: Array<{ kind: BackupKind; minGapHours: number }> = [{ kind: "DAILY", minGapHours: 20 }];
  if (weekday === 0) wanted.push({ kind: "WEEKLY", minGapHours: 24 * 6 });
  if (dayOfMonth === 1) wanted.push({ kind: "MONTHLY", minGapHours: 24 * 27 });

  const created: BackupKind[] = [];
  for (const { kind, minGapHours } of wanted) {
    const latest = await prisma.backupRecord.findFirst({
      where: { kind },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    if (latest && now.getTime() - latest.createdAt.getTime() < minGapHours * HOUR) continue;
    await createBackup(kind, null);
    created.push(kind);
  }

  const removed = await pruneBackups(settings);
  return { created, removed };
}
