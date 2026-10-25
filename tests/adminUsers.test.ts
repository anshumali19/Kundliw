import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => {
  const makeModel = () => ({
    findUnique: vi.fn(async () => null),
    findMany: vi.fn(async () => []),
    update: vi.fn(async (args: { data?: Record<string, unknown> }) => ({ id: "u-1", ...(args?.data ?? {}) })),
  });
  const store: Record<string, unknown> = {};
  return {
    prisma: new Proxy(store, {
      get(target, prop: string) {
        if (!target[prop]) target[prop] = makeModel();
        return target[prop];
      },
    }),
  };
});

const sessionState = vi.hoisted(() => ({
  current: null as null | { user: { id: string } },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(async () => sessionState.current),
}));

import { prisma } from "@/lib/prisma";
import * as usersApi from "@/app/api/admin/users/route";
import * as userByIdApi from "@/app/api/admin/users/[id]/route";

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;
const ADMIN = { id: "admin-1", name: "Admin", email: "a@example.com", phone: "+919999900001", role: "ADMIN" };

function patch(role: string) {
  return new NextRequest("http://localhost:3000/api/admin/users/u-1", {
    method: "PATCH",
    headers: { host: "localhost:3000", "content-type": "application/json" },
    body: JSON.stringify({ role }),
  });
}

beforeEach(() => {
  sessionState.current = null;
  vi.clearAllMocks();
  asMock(prisma.user.findUnique).mockResolvedValue(null);
});

describe("Admin users API", () => {
  it("rejects unauthenticated and non-admin callers", async () => {
    const anon = await usersApi.GET(new NextRequest("http://localhost:3000/api/admin/users"));
    expect(anon.status).toBe(401);

    sessionState.current = { user: { id: "u-9" } };
    asMock(prisma.user.findUnique).mockResolvedValue({ ...ADMIN, id: "u-9", role: "USER" });
    const res = await userByIdApi.PATCH(patch("ASSOCIATE"), { params: Promise.resolve({ id: "u-1" }) });
    expect(res.status).toBe(403);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("lets an admin move a user to ASSOCIATE", async () => {
    sessionState.current = { user: { id: "admin-1" } };
    asMock(prisma.user.findUnique)
      .mockResolvedValueOnce(ADMIN) // session re-check
      .mockResolvedValueOnce({ id: "u-1", role: "USER" }); // target
    const res = await userByIdApi.PATCH(patch("ASSOCIATE"), { params: Promise.resolve({ id: "u-1" }) });
    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "u-1" }, data: { role: "ASSOCIATE" } })
    );
  });

  it("never allows granting ADMIN or changing an existing admin", async () => {
    sessionState.current = { user: { id: "admin-1" } };
    asMock(prisma.user.findUnique).mockResolvedValueOnce(ADMIN);
    const grant = await userByIdApi.PATCH(patch("ADMIN"), { params: Promise.resolve({ id: "u-1" }) });
    expect(grant.status).toBe(400);

    asMock(prisma.user.findUnique)
      .mockResolvedValueOnce(ADMIN)
      .mockResolvedValueOnce({ id: "admin-2", role: "ADMIN" });
    const demote = await userByIdApi.PATCH(patch("USER"), { params: Promise.resolve({ id: "admin-2" }) });
    expect(demote.status).toBe(403);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
