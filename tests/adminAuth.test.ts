import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import * as fs from "fs";
import * as path from "path";

/**
 * C1: Every /api/admin route must reject unauthenticated requests (401) and
 * authenticated non-admin users (403) for every exported HTTP method.
 *
 * These tests call the real route handlers; `next-auth` and the Prisma client
 * are mocked so no database/network is required.
 */

vi.mock("@/lib/prisma", () => {
  const makeModel = () => ({
    findUnique: vi.fn(async () => null),
    findFirst: vi.fn(async () => null),
    findMany: vi.fn(async () => []),
    create: vi.fn(async (args: { data?: Record<string, unknown> }) => ({
      id: "mock-id",
      ...(args?.data ?? {}),
    })),
    createMany: vi.fn(async () => ({ count: 0 })),
    update: vi.fn(async (args: { data?: Record<string, unknown> }) => ({
      id: "mock-id",
      ...(args?.data ?? {}),
    })),
    updateMany: vi.fn(async () => ({ count: 1 })),
    upsert: vi.fn(async (args: { create?: Record<string, unknown> }) => ({
      id: "mock-id",
      ...(args?.create ?? {}),
    })),
    delete: vi.fn(async () => ({})),
    deleteMany: vi.fn(async () => ({ count: 0 })),
    count: vi.fn(async () => 0),
    aggregate: vi.fn(async () => ({ _count: 0 })),
    groupBy: vi.fn(async () => []),
  });

  const prisma: Record<string, unknown> = {};
  const proxy = new Proxy(prisma, {
    get(target, prop: string) {
      if (prop === "$transaction") {
        return vi.fn(async (arg: unknown) =>
          typeof arg === "function"
            ? (arg as (tx: unknown) => Promise<unknown>)(proxy)
            : Promise.all(arg as Promise<unknown>[])
        );
      }
      if (prop === "$queryRaw" || prop === "$executeRaw") {
        return vi.fn(async () => []);
      }
      if (prop === "then") return undefined;
      if (!target[prop]) {
        target[prop] = makeModel();
      }
      return target[prop];
    },
  });

  return { prisma: proxy };
});

const sessionState = vi.hoisted(() => ({
  current: null as null | { user: { id: string; name?: string; email?: string } },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(async () => sessionState.current),
}));

import { prisma } from "@/lib/prisma";
import * as banners from "@/app/api/admin/banners/route";
import * as bannerById from "@/app/api/admin/banners/[id]/route";
import * as blogs from "@/app/api/admin/blogs/route";
import * as blogById from "@/app/api/admin/blogs/[id]/route";
import * as gallery from "@/app/api/admin/gallery/route";
import * as galleryById from "@/app/api/admin/gallery/[id]/route";
import * as marquee from "@/app/api/admin/marquee/route";
import * as marqueeById from "@/app/api/admin/marquee/[id]/route";
import * as pages from "@/app/api/admin/pages/route";
import * as pageById from "@/app/api/admin/pages/[id]/route";
import * as testimonials from "@/app/api/admin/testimonials/route";
import * as testimonialById from "@/app/api/admin/testimonials/[id]/route";
import * as services from "@/app/api/admin/services/route";
import * as serviceById from "@/app/api/admin/services/[id]/route";
import * as plans from "@/app/api/admin/plans/route";
import * as planById from "@/app/api/admin/plans/[id]/route";
import * as offers from "@/app/api/admin/offers/route";
import * as offerById from "@/app/api/admin/offers/[id]/route";
import * as orderStatus from "@/app/api/admin/orders/[id]/status/route";
import * as verifyPayment from "@/app/api/admin/orders/[id]/verify-payment/route";
import * as settings from "@/app/api/admin/settings/route";
import * as mediaUpload from "@/app/api/admin/media/upload/route";
import * as vaultUpload from "@/app/api/admin/vault/upload/route";
import * as translations from "@/app/api/admin/translations/route";
import * as translationsBulk from "@/app/api/admin/translations/bulk/route";

type Handler = (request: NextRequest, ctx: { params: { id: string } }) => Promise<Response>;

interface RouteSpec {
  name: string;
  path: string;
  module: Record<string, unknown>;
  methods: string[];
}

const routes: RouteSpec[] = [
  { name: "banners", path: "/api/admin/banners", module: banners, methods: ["GET", "POST"] },
  { name: "banners/[id]", path: "/api/admin/banners/x", module: bannerById, methods: ["PUT", "DELETE"] },
  { name: "blogs", path: "/api/admin/blogs", module: blogs, methods: ["GET", "POST"] },
  { name: "blogs/[id]", path: "/api/admin/blogs/x", module: blogById, methods: ["PUT", "DELETE"] },
  { name: "gallery", path: "/api/admin/gallery", module: gallery, methods: ["GET", "POST"] },
  { name: "gallery/[id]", path: "/api/admin/gallery/x", module: galleryById, methods: ["PUT", "DELETE"] },
  { name: "marquee", path: "/api/admin/marquee", module: marquee, methods: ["GET", "POST"] },
  { name: "marquee/[id]", path: "/api/admin/marquee/x", module: marqueeById, methods: ["PUT", "DELETE"] },
  { name: "pages", path: "/api/admin/pages", module: pages, methods: ["GET", "POST"] },
  { name: "pages/[id]", path: "/api/admin/pages/x", module: pageById, methods: ["PUT", "DELETE"] },
  { name: "testimonials", path: "/api/admin/testimonials", module: testimonials, methods: ["GET", "POST"] },
  { name: "testimonials/[id]", path: "/api/admin/testimonials/x", module: testimonialById, methods: ["PUT", "DELETE"] },
  { name: "services", path: "/api/admin/services", module: services, methods: ["GET", "POST"] },
  { name: "services/[id]", path: "/api/admin/services/x", module: serviceById, methods: ["PUT", "DELETE"] },
  { name: "plans", path: "/api/admin/plans", module: plans, methods: ["POST"] },
  { name: "plans/[id]", path: "/api/admin/plans/x", module: planById, methods: ["PUT", "DELETE"] },
  { name: "offers", path: "/api/admin/offers", module: offers, methods: ["GET", "POST"] },
  { name: "offers/[id]", path: "/api/admin/offers/x", module: offerById, methods: ["PUT", "DELETE"] },
  { name: "orders/[id]/status", path: "/api/admin/orders/x/status", module: orderStatus, methods: ["POST"] },
  { name: "orders/[id]/verify-payment", path: "/api/admin/orders/x/verify-payment", module: verifyPayment, methods: ["POST"] },
  { name: "settings", path: "/api/admin/settings", module: settings, methods: ["GET", "PUT"] },
  { name: "media/upload", path: "/api/admin/media/upload", module: mediaUpload, methods: ["POST"] },
  { name: "vault/upload", path: "/api/admin/vault/upload", module: vaultUpload, methods: ["POST"] },
  { name: "translations", path: "/api/admin/translations", module: translations, methods: ["GET", "POST", "DELETE"] },
  { name: "translations/bulk", path: "/api/admin/translations/bulk", module: translationsBulk, methods: ["POST"] },
];

const ADMIN_USER = {
  id: "admin-1",
  name: "Admin",
  email: "admin@example.com",
  phone: "+919999900001",
  role: "ADMIN",
};

function makeRequest(spec: RouteSpec, method: string, origin?: string): NextRequest {
  const headers: Record<string, string> = { host: "localhost:3000" };
  if (origin) headers.origin = origin;
  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    headers["content-type"] = "application/json";
    body = JSON.stringify({});
  }
  return new NextRequest(`http://localhost:3000${spec.path}`, {
    method,
    headers,
    body,
  });
}

async function callRoute(spec: RouteSpec, method: string, origin?: string) {
  const handler = spec.module[method] as Handler | undefined;
  expect(handler, `${spec.name} has no ${method} handler`).toBeTypeOf("function");
  return handler!(makeRequest(spec, method, origin), { params: { id: "x" } });
}

beforeEach(() => {
  sessionState.current = null;
  vi.clearAllMocks();
  // Reset the mock behaviour configured by individual tests.
  (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
});

describe("C1 - admin API authentication", () => {
  it.each(routes.flatMap((spec) => spec.methods.map((method) => ({ spec, method }))))(
    "rejects unauthenticated $spec.name $method with 401",
    async ({ spec, method }) => {
      const res = await callRoute(spec, method);
      expect(res.status).toBe(401);
    }
  );

  it.each(routes.flatMap((spec) => spec.methods.map((method) => ({ spec, method }))))(
    "rejects authenticated non-admin $spec.name $method with 403",
    async ({ spec, method }) => {
      sessionState.current = { user: { id: "user-1" } };
      (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "user-1",
        name: "Customer",
        email: "customer@example.com",
        phone: "+919999900002",
        role: "USER",
      });

      const res = await callRoute(spec, method);
      expect(res.status).toBe(403);
    }
  );

  it.each(
    routes
      .filter((spec) => spec.methods.some((m) => m !== "GET"))
      .flatMap((spec) => spec.methods.filter((m) => m !== "GET").map((method) => ({ spec, method })))
  )(
    "rejects cross-origin admin writes $spec.name $method with 403",
    async ({ spec, method }) => {
      sessionState.current = { user: { id: "admin-1" } };
      (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(ADMIN_USER);

      const res = await callRoute(spec, method, "https://evil.example.com");
      expect(res.status).toBe(403);
    }
  );

  it("does not contain truthiness checks on guard results in admin routes", () => {
    const root = path.resolve(__dirname, "../src/app/api/admin");
    const offenders: string[] = [];

    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.isFile() && entry.name === "route.ts") {
          const contents = fs.readFileSync(full, "utf8");
          if (/if\s*\(\s*!\s*(?:admin|guard|user)\s*\)/.test(contents)) {
            offenders.push(path.relative(root, full));
          }
        }
      }
    };

    walk(root);
    expect(offenders).toEqual([]);
  });
});
