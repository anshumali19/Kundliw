import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * H1: rate limiting must key on a real client IP (platform-trusted proxy
 * headers) and the counter must increment atomically so concurrent requests
 * cannot all slip through the same check.
 */

interface Row {
  id: string;
  scope: string;
  identifier: string;
  count: number;
  windowEnd: Date;
}

const store = vi.hoisted(() => new Map<string, Row>());
let nextId = 1;

vi.mock("@/lib/prisma", () => {
  const keyOf = (where: {
    scope_identifier?: { scope: string; identifier: string };
    id?: string;
  }) => {
    if (where.scope_identifier) {
      return `${where.scope_identifier.scope}::${where.scope_identifier.identifier}`;
    }
    for (const [key, row] of store.entries()) {
      if (row.id === where.id) return key;
    }
    return "";
  };

  const matches = (row: Row, where: Record<string, unknown>) => {
    if (where.scope !== undefined && row.scope !== where.scope) return false;
    if (where.identifier !== undefined && row.identifier !== where.identifier) return false;
    const windowEnd = where.windowEnd as { gt?: Date; lte?: Date } | undefined;
    if (windowEnd?.gt && !(row.windowEnd > windowEnd.gt)) return false;
    if (windowEnd?.lte && !(row.windowEnd <= windowEnd.lte)) return false;
    const count = where.count as { lt?: number } | undefined;
    if (count?.lt !== undefined && !(row.count < count.lt)) return false;
    return true;
  };

  const apply = (row: Row, data: Record<string, unknown>) => {
    const count = data.count as number | { increment?: number } | undefined;
    if (typeof count === "number") row.count = count;
    else if (count && typeof count === "object" && count.increment !== undefined) {
      row.count += count.increment;
    }
    if (data.windowEnd instanceof Date) row.windowEnd = data.windowEnd;
  };

  const rateLimit = {
    findUnique: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
      const row = store.get(keyOf(where));
      return row ? { ...row } : null;
    }),
    update: vi.fn(
      async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        for (const row of store.values()) {
          if (row.id === where.id) {
            apply(row, data);
            return { ...row };
          }
        }
        throw new Error("Row not found");
      }
    ),
    updateMany: vi.fn(
      async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
        let count = 0;
        for (const row of store.values()) {
          if (matches(row, where)) {
            apply(row, data);
            count++;
          }
        }
        return { count };
      }
    ),
    upsert: vi.fn(
      async ({
        where,
        update,
        create,
      }: {
        where: Record<string, unknown>;
        update: Record<string, unknown>;
        create: Record<string, unknown>;
      }) => {
        const key = keyOf(where);
        const existing = store.get(key);
        if (existing) {
          apply(existing, update);
          return { ...existing };
        }
        const row: Row = {
          id: `rl-${nextId++}`,
          scope: String(create.scope),
          identifier: String(create.identifier),
          count: Number(create.count),
          windowEnd: create.windowEnd as Date,
        };
        store.set(key, row);
        return { ...row };
      }
    ),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      const key = `${data.scope}::${data.identifier}`;
      if (store.has(key)) {
        const error = new Error("Unique constraint failed") as Error & { code?: string };
        error.code = "P2002";
        throw error;
      }
      const row: Row = {
        id: `rl-${nextId++}`,
        scope: String(data.scope),
        identifier: String(data.identifier),
        count: Number(data.count),
        windowEnd: data.windowEnd as Date,
      };
      store.set(key, row);
      return { ...row };
    }),
    delete: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
      store.delete(keyOf(where));
      return {};
    }),
  };

  return { prisma: { rateLimit } };
});

import { checkDbRateLimit, getClientIp } from "@/lib/rateLimit";

beforeEach(() => {
  store.clear();
  nextId = 1;
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("H1 - trusted client IP", () => {
  it("ignores spoofable forwarded headers when no proxy is trusted", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.99",
      "x-real-ip": "203.0.113.99",
    });
    expect(getClientIp(headers)).toBe("127.0.0.1");
  });

  it("uses the platform trusted IP on Vercel", () => {
    vi.stubEnv("VERCEL", "1");
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.7, 10.0.0.1",
    });
    expect(getClientIp(headers)).toBe("203.0.113.7");
  });

  it("supports TRUST_PROXY for self-hosted deployments", () => {
    vi.stubEnv("TRUST_PROXY", "true");
    const headers = new Headers({ "x-real-ip": "198.51.100.4" });
    expect(getClientIp(headers)).toBe("198.51.100.4");
  });

  it("rejects malformed forwarded values", () => {
    vi.stubEnv("TRUST_PROXY", "true");
    const headers = new Headers({ "x-forwarded-for": "<script>alert(1)</script>" });
    expect(getClientIp(headers)).toBe("127.0.0.1");
  });
});

describe("H1 - atomic rate limit counter", () => {
  it("allows exactly maxAllowed of 150 concurrent requests", async () => {
    const results = await Promise.all(
      Array.from({ length: 150 }, () =>
        checkDbRateLimit({
          scope: "test-atomic",
          identifier: "203.0.113.7",
          windowSeconds: 60,
          maxAllowed: 100,
        })
      )
    );

    const allowed = results.filter((result) => result.allowed);
    const blocked = results.filter((result) => !result.allowed);

    expect(allowed).toHaveLength(100);
    expect(blocked).toHaveLength(50);
    expect(store.get("test-atomic::203.0.113.7")?.count).toBe(100);
  });

  it("resets an expired window atomically", async () => {
    store.set("test-reset::ip", {
      id: "old",
      scope: "test-reset",
      identifier: "ip",
      count: 100,
      windowEnd: new Date(Date.now() - 1000),
    });

    const results = await Promise.all(
      Array.from({ length: 20 }, () =>
        checkDbRateLimit({
          scope: "test-reset",
          identifier: "ip",
          windowSeconds: 60,
          maxAllowed: 5,
        })
      )
    );

    expect(results.filter((result) => result.allowed)).toHaveLength(5);
    expect(store.get("test-reset::ip")?.count).toBe(5);
  });
});
