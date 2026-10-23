import { prisma } from "@/lib/prisma";

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  remaining: number;
  retryAfterSeconds?: number;
}

/**
 * Extracts client IP only trusting x-forwarded-for when TRUST_PROXY === "true".
 */
export function getClientIp(headers: Headers): string {
  const isTrustProxy = process.env.TRUST_PROXY === "true";
  if (isTrustProxy) {
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    const realIp = headers.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
  }
  return "127.0.0.1";
}

/**
 * Database-backed rate limiter using the RateLimit model.
 * Atomic upsert / check per scope + identifier.
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
  const now = new Date();

  // Find existing record
  const existing = await prisma.rateLimit.findUnique({
    where: {
      scope_identifier: {
        scope,
        identifier,
      },
    },
  });

  // If record exists and window is active
  if (existing && existing.windowEnd > now) {
    if (existing.count >= maxAllowed) {
      const retryAfterSeconds = Math.ceil(
        (existing.windowEnd.getTime() - now.getTime()) / 1000
      );
      return {
        allowed: false,
        count: existing.count,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    // Increment count
    const updated = await prisma.rateLimit.update({
      where: { id: existing.id },
      data: { count: { increment: 1 } },
    });

    return {
      allowed: true,
      count: updated.count,
      remaining: Math.max(0, maxAllowed - updated.count),
    };
  }

  // Window has expired or no record exists -> create/reset window
  const windowEnd = new Date(now.getTime() + windowSeconds * 1000);
  const record = await prisma.rateLimit.upsert({
    where: {
      scope_identifier: {
        scope,
        identifier,
      },
    },
    update: {
      count: 1,
      windowEnd,
    },
    create: {
      scope,
      identifier,
      count: 1,
      windowEnd,
    },
  });

  return {
    allowed: true,
    count: record.count,
    remaining: maxAllowed - 1,
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
