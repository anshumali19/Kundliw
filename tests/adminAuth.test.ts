import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import * as fs from "fs";
import * as path from "path";

/**
 * C1: Every /api/admin route must reject unauthenticated requests (401) and
 * authenticated non-admin users (403) for every exported HTTP method.
 *
 * Dynamically discovers every admin route under src/app/api/admin.
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

type Handler = (request: NextRequest, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

interface RouteSpec {
  name: string;
  path: string;
  module: Record<string, unknown>;
  methods: string[];
}

const root = path.resolve(__dirname, "../src/app/api/admin");

function getAdminRouteFiles(dir: string): string[] {
  let files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAdminRouteFiles(full));
    } else if (entry.isFile() && entry.name === "route.ts") {
      files.push(full);
    }
  }
  return files;
}

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];
const routeFiles = getAdminRouteFiles(root);
const routes: RouteSpec[] = [];

for (const file of routeFiles) {
  const relative = path.relative(root, file).replace(/\\/g, "/");
  const routeName = relative.replace(/\/route\.ts$/, "").replace(/route\.ts$/, "");
  const mod = await import(file);
  const methods = HTTP_METHODS.filter((m) => typeof mod[m] === "function");
  if (methods.length > 0) {
    const cleanPath =
      "/api/admin/" +
      routeName
        .split("/")
        .map((seg) => (seg.startsWith("[") ? "x" : seg))
        .join("/");
    routes.push({
      name: routeName || "index",
      path: cleanPath,
      module: mod,
      methods,
    });
  }
}

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
  return new NextRequest("http://localhost:3000" + spec.path, {
    method,
    headers,
    body,
  });
}

async function callRoute(spec: RouteSpec, method: string, origin?: string) {
  const handler = spec.module[method] as Handler | undefined;
  expect(handler, `${spec.name} has no ${method} handler`).toBeTypeOf("function");
  return handler!(makeRequest(spec, method, origin), { params: Promise.resolve({ id: "x" }) });
}

beforeEach(() => {
  sessionState.current = null;
  vi.clearAllMocks();
  (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
});

describe("C1 - admin API authentication & dynamic discovery", () => {
  it("discovers all admin route files dynamically", () => {
    expect(routes.length).toBeGreaterThanOrEqual(30);
    expect(routeFiles.length).toBe(routes.length);
  });

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
    const rootDir = path.resolve(__dirname, "../src/app/api/admin");
    const offenders: string[] = [];

    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.isFile() && entry.name === "route.ts") {
          const contents = fs.readFileSync(full, "utf8");
          if (/if\s*\(\s*!\s*(?:admin|guard|user)\s*\)/.test(contents)) {
            offenders.push(path.relative(rootDir, full));
          }
        }
      }
    };

    walk(rootDir);
    expect(offenders).toEqual([]);
  });
});
