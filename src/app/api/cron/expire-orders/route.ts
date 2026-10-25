import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { expireOverdueOrders } from "@/lib/booking/service";

export const dynamic = "force-dynamic";

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left, "utf-8");
  const b = Buffer.from(right, "utf-8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function isAuthorized(request: NextRequest, secret: string): boolean {
  const authorization = request.headers.get("authorization") || "";
  const bearer = authorization.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : "";
  const provided = bearer || (request.headers.get("x-cron-secret") || "").trim();
  return provided.length > 0 && safeEqual(provided, secret);
}

async function handle(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();

  // Refuse to run as an open endpoint when no secret is configured.
  if (!secret) {
    return NextResponse.json(
      { error: "Cron endpoint is not configured." },
      { status: 503 }
    );
  }

  if (!isAuthorized(request, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await expireOverdueOrders();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Scheduled order expiry failed:", error);
    return NextResponse.json(
      { error: "Scheduled expiry failed." },
      { status: 500 }
    );
  }
}

/**
 * Vercel Cron invokes GET. Configured in vercel.json to run every 10 minutes:
 *   { "path": "/api/cron/expire-orders", "schedule": "* /10 * * * *" }
 * Vercel automatically sends `Authorization: Bearer $CRON_SECRET` when the
 * CRON_SECRET environment variable is set.
 */
export async function GET(request: NextRequest) {
  return handle(request);
}

// Allow manual invocation from a scheduler that uses POST.
export async function POST(request: NextRequest) {
  return handle(request);
}
