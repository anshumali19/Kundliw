import { prisma } from "@/lib/prisma";

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  remaining: number;
  retryAfterSeconds?: number;
}

function normalizeIp(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  if (!first) return null;

  // IPv4, optionally with a port suffix.
  const ipv4 = first.match(/^(\d{1,3}(?:\.\d{1,3}){3})(?::\d{1,5})?$/);
  if (ipv4) {
    const octets = ipv4[1].split(".").map(Number);
    return octets.every((octet) => octet >= 0 && octet <= 255) ? ipv4[1] : null;
  }

  // IPv6 (bracketed or plain). Loose validation is enough for a rate-limit key.
  const ipv6 = first.replace(/^\[|\]$/g, "");
  if (ipv6.includes(":") && /^[0-9a-fA-F:.]+$/.test(ipv6)) {
    return ipv6;
  }

  return null;
}

/**
 * Extracts the client IP.
 *
 * Forwarded headers are spoofable unless a trusted proxy sets them, so they are
 * only honoured when TRUST_PROXY=true or when running on a platform whose edge
 * overwrites them (Vercel / Cloudflare Pages). Self-hosted deployments behind
 * nginx/ALB must set TRUST_PROXY=true.
 */
export function getClientIp(headers: Headers): string {
  const isTrustedPlatform =
    process.env.TRUST_PROXY === "true" ||
    process.env.VERCEL === "1" ||
    process.env.VERCEL_ENV !== undefined ||
    process.env.CF_PAGES === "1";

  if (isTrustedPlatform) {
    const candidates = [
      headers.get("x-vercel-forwarded-for"),
      headers.get("cf-connecting-ip"),
      headers.get("x-forwarded-for"),
      headers.get("x-real-ip"),
    ];

    for (const candidate of candidates) {
      const ip = normalizeIp(candidate);
      if (ip) return ip;
    }
  }

  return "127.0.0.1";
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  );
}

/**
 * Database-backed rate limiter using the RateLimit model.
 *
 * The window is advanced with conditional `updateMany` statements so
 * concurrent requests cannot all pass the same count check:
 *   1. atomically increment an active window below the limit;
 *   2. atomically reset an expired window to count=1;
 *   3. atomically create the row (unique constraint arbitrates races).
 */
export async function checkDbRateLimit({
  scope,
  identifier,
  windowSeconds,
  maxAllowed,
}: {
  scope: string;
  identifier: string;
  windowSeconds: number;
  maxAllowed: number;
}): Promise<RateLimitResult> {
  const where = { scope_identifier: { scope, identifier } };

  for (let attempt = 0; attempt < 3; attempt++) {
    const now = new Date();

    const incremented = await prisma.rateLimit.updateMany({
      where: {
        scope,
        identifier,
        windowEnd: { gt: now },
        count: { lt: maxAllowed },
      },
      data: { count: { increment: 1 } },
    });

    if (incremented.count > 0) {
      const record = await prisma.rateLimit.findUnique({ where });
      const count = record?.count ?? 1;
      return {
        allowed: true,
        count,
        remaining: Math.max(0, maxAllowed - count),
      };
    }

    const nextWindowEnd = new Date(now.getTime() + windowSeconds * 1000);
    const reset = await prisma.rateLimit.updateMany({
      where: { scope, identifier, windowEnd: { lte: now } },
      data: { count: 1, windowEnd: nextWindowEnd },
    });

    if (reset.count > 0) {
      return {
        allowed: true,
        count: 1,
        remaining: Math.max(0, maxAllowed - 1),
      };
    }

    try {
      await prisma.rateLimit.create({
        data: { scope, identifier, count: 1, windowEnd: nextWindowEnd },
      });
      return {
        allowed: true,
        count: 1,
        remaining: Math.max(0, maxAllowed - 1),
      };
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;
      // Another request won the race; retry against the row it created.
    }
  }

  const record = await prisma.rateLimit.findUnique({ where });
  if (!record) {
    return {
      allowed: false,
      count: 0,
      remaining: 0,
      retryAfterSeconds: windowSeconds,
    };
  }

  return {
    allowed: false,
    count: record.count,
    remaining: 0,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((record.windowEnd.getTime() - Date.now()) / 1000)
    ),
  };
}

/**
 * Resets rate limit for a given scope + identifier upon successful authentication.
 */
export async function resetDbRateLimit(scope: string, identifier: string): Promise<void> {
  try {
    await prisma.rateLimit.delete({
      where: {
        scope_identifier: {
          scope,
          identifier,
        },
      },
    });
  } catch {
    // Ignore if not present
  }
}
