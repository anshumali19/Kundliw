import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { runScheduledBackups } from "@/lib/backup/service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left, "utf-8");
  const b = Buffer.from(right, "utf-8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

async function handle(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "Cron endpoint is not configured." }, { status: 503 });
  }
  const authorization = request.headers.get("authorization") || "";
  const bearer = authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7).trim() : "";
  const provided = bearer || (request.headers.get("x-cron-secret") || "").trim();
  if (!provided || !safeEqual(provided, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runScheduledBackups();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Scheduled backup failed:", error);
    return NextResponse.json({ error: "Scheduled backup failed." }, { status: 500 });
  }
}

/** Vercel Cron calls GET once a day (see vercel.json). */
export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
