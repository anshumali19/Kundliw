import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * H9: public astro endpoints and anonymous zero-value order creation must be
 * rate-limited, and jatakaDetails must match a real per-request schema instead
 * of accepting arbitrary JSON.
 */

const rateState = vi.hoisted(() => ({ allowed: true }));

const authState = vi.hoisted(() => ({
  user: null as null | { id: string; role: string },
}));

const orderState = vi.hoisted(() => ({
  orders: [] as Array<Record<string, unknown>>,
  events: [] as Array<Record<string, unknown>>,
}));

const astroProviderSpies = vi.hoisted(() => ({
  calculateKundli: vi.fn(async () => ({ lagna: "Simha" })),
  calculateMatching: vi.fn(async () => ({ score: 28 })),
  getDailyPanchang: vi.fn(async () => ({ tithi: "Shukla" })),
}));

vi.mock("@/lib/rateLimit", () => ({
  getClientIp: vi.fn(() => "203.0.113.9"),
  checkDbRateLimit: vi.fn(async () =>
    rateState.allowed
      ? { allowed: true, count: 1, remaining: 4 }
      : { allowed: false, count: 5, remaining: 0, retryAfterSeconds: 3600 }
  ),
}));

vi.mock("@/lib/auth/guards", () => ({
  getCurrentUser: vi.fn(async () => authState.user),
}));

vi.mock("@/lib/booking/service", () => ({
  getNextOrderNumber: vi.fn(async () => "MKJK-2026-0001"),
}));

vi.mock("@/lib/prisma", () => {
  const tx = {
    order: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        orderState.orders.push(data);
        return { id: "order-1", orderNumber: data.orderNumber };
      }),
    },
    orderStatusEvent: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        orderState.events.push(data);
        return data;
      }),
    },
  };

  const client = new Proxy(tx as Record<string, unknown>, {
    get(obj, prop: string) {
      if (prop === "$transaction") {
        return vi.fn(async (arg: unknown) =>
          typeof arg === "function"
            ? (arg as (client: unknown) => Promise<unknown>)(client)
            : Promise.all(arg as Promise<unknown>[])
        );
      }
      if (prop === "then") return undefined;
      return obj[prop];
    },
  });

  return { prisma: client };
});

vi.mock("@/lib/astro/factory", () => ({
  getAstroProvider: () => ({
    calculateKundli: astroProviderSpies.calculateKundli,
    calculateMatching: astroProviderSpies.calculateMatching,
  }),
}));

vi.mock("@/lib/astro/panchangService", () => ({
  getDailyPanchang: astroProviderSpies.getDailyPanchang,
}));

import { POST as createAstroRequest } from "@/app/api/astro/request/route";
import { POST as calculateKundli } from "@/app/api/astro/kundli/route";
import { POST as calculateMatching } from "@/app/api/astro/matching/route";
import { GET as getPanchang } from "@/app/api/astro/panchang/route";
import { checkDbRateLimit } from "@/lib/rateLimit";

const validKundli = {
  requestType: "KUNDLI_REQUEST",
  jatakaDetails: {
    name: "Aditya Sharma",
    gender: "MALE",
    dob: "1995-05-14",
    tob: "08:30",
    pob: "Varanasi, UP",
  },
};

const validMatching = {
  requestType: "KUNDLI_MATCHING",
  jatakaDetails: {
    boy: {
      name: "Aarav Sharma",
      dob: "1994-06-12",
      tob: "07:15",
      pob: "Varanasi, UP",
    },
    girl: {
      name: "Pooja Mishra",
      dob: "1996-09-24",
      tob: "14:40",
      pob: "Patna, Bihar",
    },
  },
};

const validPrashna = {
  requestType: "PRASHNA_KUNDLI",
  jatakaDetails: {
    name: "Aditya Sharma",
    phone: "9876543210",
    email: "aditya@example.com",
    category: "CAREER",
    questionText: "Will I get the promotion this year?",
    queryTimestamp: "2026-10-25T14:30",
    placeOfQuery: "Varanasi, UP",
  },
};

function astroRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/astro/request", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  rateState.allowed = true;
  authState.user = null;
  orderState.orders.length = 0;
  orderState.events.length = 0;
  vi.clearAllMocks();
});

describe("H9 - jatakaDetails schema", () => {
  it("accepts a valid Kundli request and stores only the validated fields", async () => {
    const res = await createAstroRequest(astroRequest(validKundli));

    expect(res.status).toBe(200);
    expect(orderState.orders).toHaveLength(1);
    expect(orderState.orders[0].jatakaDetails).toMatchObject({
      name: "Aditya Sharma",
      gender: "MALE",
      dob: "1995-05-14",
      tob: "08:30",
      pob: "Varanasi, UP",
    });
  });

  it("accepts a valid matching request", async () => {
    const res = await createAstroRequest(astroRequest(validMatching));

    expect(res.status).toBe(200);
    expect(orderState.orders).toHaveLength(1);
  });

  it("accepts a valid Prashna request", async () => {
    const res = await createAstroRequest(astroRequest(validPrashna));

    expect(res.status).toBe(200);
    expect(orderState.orders).toHaveLength(1);
  });

  it("rejects free-form jatakaDetails", async () => {
    const res = await createAstroRequest(
      astroRequest({
        requestType: "KUNDLI_REQUEST",
        jatakaDetails: { anything: "goes", nested: { payload: 42 } },
      })
    );

    expect(res.status).toBe(400);
    expect(orderState.orders).toHaveLength(0);
  });

  it("rejects unknown fields instead of persisting them", async () => {
    const res = await createAstroRequest(
      astroRequest({
        ...validKundli,
        jatakaDetails: { ...validKundli.jatakaDetails, adminNote: "injected" },
      })
    );

    expect(res.status).toBe(400);
    expect(orderState.orders).toHaveLength(0);
  });

  it("rejects malformed birth details and phone numbers", async () => {
    const badDob = await createAstroRequest(
      astroRequest({
        ...validKundli,
        jatakaDetails: { ...validKundli.jatakaDetails, dob: "14-05-1995" },
      })
    );

    const badPhone = await createAstroRequest(
      astroRequest({
        ...validPrashna,
        jatakaDetails: { ...validPrashna.jatakaDetails, phone: "12345" },
      })
    );

    expect(badDob.status).toBe(400);
    expect(badPhone.status).toBe(400);
    expect(orderState.orders).toHaveLength(0);
  });
});

describe("H9 - astro request rate limiting", () => {
  it("blocks anonymous order creation when the IP allowance is exhausted", async () => {
    rateState.allowed = false;

    const res = await createAstroRequest(astroRequest(validKundli));

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("3600");
    expect(orderState.orders).toHaveLength(0);
    expect(checkDbRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({ scope: "ASTRO_REQUEST_ANON", identifier: "203.0.113.9" })
    );
  });

  it("uses a separate allowance for signed-in customers", async () => {
    authState.user = { id: "user-1", role: "USER" };

    const res = await createAstroRequest(astroRequest(validKundli));

    expect(res.status).toBe(200);
    expect(checkDbRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({ scope: "ASTRO_REQUEST_USER", identifier: "user-1" })
    );
  });
});

describe("H9 - astro calculation endpoints rate limiting", () => {
  it("blocks Kundli calculations without invoking the provider", async () => {
    rateState.allowed = false;

    const res = await calculateKundli(astroRequest(validKundli.jatakaDetails));

    expect(res.status).toBe(429);
    expect(astroProviderSpies.calculateKundli).not.toHaveBeenCalled();
  });

  it("blocks matching calculations without invoking the provider", async () => {
    rateState.allowed = false;

    const res = await calculateMatching(astroRequest(validMatching.jatakaDetails));

    expect(res.status).toBe(429);
    expect(astroProviderSpies.calculateMatching).not.toHaveBeenCalled();
  });

  it("blocks panchang lookups without invoking the ephemeris service", async () => {
    rateState.allowed = false;

    const res = await getPanchang(
      new NextRequest("http://localhost:3000/api/astro/panchang?date=2026-10-25")
    );

    expect(res.status).toBe(429);
    expect(astroProviderSpies.getDailyPanchang).not.toHaveBeenCalled();
  });
});
