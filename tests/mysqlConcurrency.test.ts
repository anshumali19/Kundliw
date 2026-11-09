/**
 * Real-database checks for the parts that were rebuilt for MySQL: the last-seat lock, seat counting through the
 * OrderExtraPlan table, order and invoice numbers, and the cancel / refund / upgrade rules.
 *
 * Skipped unless pointed at a throw-away MySQL or MariaDB:
 *   MYSQL_TEST_DB=1 DATABASE_URL="mysql://root:pw@localhost:3307/kjk" npx vitest run tests/mysqlConcurrency.test.ts
 * It creates its own rows (names start with "zzconc") and removes them again.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { BookingError, createBookingOrder } from "@/lib/booking/service";
import { nextSequence } from "@/lib/db/counter";
import { TX_OPTIONS } from "@/lib/db/tx";
import { cancelOrderTx, settleUpgrade, startUpgradeTx } from "@/lib/orders/selfService";

const ON = !!process.env.MYSQL_TEST_DB && /^mysql:/.test(process.env.DATABASE_URL || "");
const ROUNDS = Number(process.env.MYSQL_TEST_ROUNDS || 10);
const TAG = `zzconc${Date.now().toString(36)}`;

const details = (i: number) => ({
  name: `Tester ${i}`,
  gender: "MALE" as const,
  dob: "1990-01-01",
  tob: "10:00",
  isTimeUnknown: false,
  pob: "Bhilai",
  phone: "9876543210",
  email: "",
  language: "hi" as const,
});

describe.skipIf(!ON)("MySQL concurrency and rules (real database)", () => {
  const userIds: string[] = [];
  let serviceId = "";
  let serviceSlug = "";
  const packageIds: string[] = [];

  async function makePackage(seats: number | null, suffix: string) {
    const pkg = await prisma.servicePackage.create({ data: { serviceId, slug: `${TAG}-pk-${suffix}`, titleEn: "T", titleHi: "T", seats } });
    packageIds.push(pkg.id);
    const mkPlan = (s: string, price: number, pk: string | null) =>
      prisma.plan.create({
        data: { serviceId, packageId: pk, slug: `${TAG}-${suffix}-${s}`, titleEn: s, titleHi: s, descriptionEn: "d", descriptionHi: "d", pricePaise: price, isActive: true, featuresEn: ["a"], featuresHi: ["a"] },
      });
    const a = await mkPlan("a", 100000, pkg.id);
    const b = await mkPlan("b", 150000, pkg.id);
    const c = await mkPlan("c", 50000, null);
    return { pkg, a, b, c };
  }

  beforeAll(async () => {
    serviceSlug = `${TAG}-svc`;
    const svc = await prisma.service.create({
      data: { slug: serviceSlug, titleEn: "T", titleHi: "T", descriptionEn: "d", descriptionHi: "d", isActive: true, highlightsEn: ["x"], highlightsHi: ["x"] },
    });
    serviceId = svc.id;
    for (let i = 0; i < 40; i++) {
      const u = await prisma.user.create({ data: { email: `${TAG}-${i}@example.test`, name: `U${i}` } });
      userIds.push(u.id);
    }
  }, 120000);

  afterAll(async () => {
    await prisma.order.deleteMany({ where: { serviceId } });
    await prisma.plan.deleteMany({ where: { serviceId } });
    await prisma.servicePackage.deleteMany({ where: { serviceId } });
    await prisma.service.deleteMany({ where: { id: serviceId } });
    await prisma.user.deleteMany({ where: { email: { startsWith: TAG } } });
    await prisma.$disconnect();
  }, 120000);

  it(`last seat: 20 customers at once for 1 seat, ${ROUNDS} rounds, exactly 1 wins each time`, async () => {
    for (let r = 0; r < ROUNDS; r++) {
      const { a } = await makePackage(1, `s${r}`);
      const results = await Promise.allSettled(
        userIds.slice(0, 20).map((uid, i) => createBookingOrder(uid, { serviceSlug, planSlug: a.slug, jatakaDetails: details(i) })),
      );
      const ok = results.filter((x) => x.status === "fulfilled").length;
      const rejected = results.filter((x): x is PromiseRejectedResult => x.status === "rejected");
      expect(rejected.every((x) => x.reason instanceof BookingError), `round ${r}: ${rejected.map((x) => String(x.reason?.message)).slice(0, 2)}`).toBe(true);
      expect(ok, `round ${r}`).toBe(1);
    }
  }, 600000);

  it(`seat counting through extra plans: 3 seats, 12 customers (half buy the plan as an extra), ${ROUNDS} rounds, exactly 3 win`, async () => {
    for (let r = 0; r < ROUNDS; r++) {
      const { a, c } = await makePackage(3, `x${r}`);
      const results = await Promise.allSettled(
        userIds.slice(0, 12).map((uid, i) =>
          i % 2 === 0
            ? createBookingOrder(uid, { serviceSlug, planSlug: a.slug, jatakaDetails: details(i) })
            : createBookingOrder(uid, { serviceSlug, planSlug: c.slug, extraPlanSlugs: [a.slug], jatakaDetails: details(i) }),
        ),
      );
      expect(results.filter((x) => x.status === "fulfilled").length, `round ${r}`).toBe(3);
    }
  }, 600000);

  it("order numbers: 40 at once are all different and consecutive", async () => {
    const { a } = await makePackage(null, "n");
    const results = await Promise.all(userIds.map((uid, i) => createBookingOrder(uid, { serviceSlug, planSlug: a.slug, jatakaDetails: details(i) })));
    const nums = results.map((x) => Number(x.orderNumber.split("-").pop())).sort((x, y) => x - y);
    expect(new Set(nums).size).toBe(40);
    expect(nums[nums.length - 1] - nums[0]).toBe(39);
  }, 300000);

  it("invoice style counters: 40 transactions at once, no number twice, none skipped", async () => {
    const id = `${TAG}-COUNTER`;
    const got = await Promise.all(Array.from({ length: 40 }, () => prisma.$transaction((tx) => nextSequence(tx, id), TX_OPTIONS)));
    expect(new Set(got).size).toBe(40);
    expect(Math.min(...got)).toBe(1);
    expect(Math.max(...got)).toBe(40);
    await prisma.counter.deleteMany({ where: { id } });
  }, 120000);

  it("cancel, refund tracking and upgrade work as designed", async () => {
    const { a, b } = await makePackage(null, "u");
    const mk = async (i: number, extra: Record<string, unknown> = {}) => {
      const r = await createBookingOrder(userIds[i], { serviceSlug, planSlug: a.slug, jatakaDetails: details(i) });
      await prisma.order.update({ where: { id: r.orderId }, data: { paymentStatus: PaymentStatus.PAID, ...extra } });
      return r;
    };
    // a customer cancels a paid order: refund is requested, status is REFUNDED, a second cancel is refused
    const o1 = await mk(0);
    const c1 = await prisma.$transaction((tx) => cancelOrderTx(tx, o1.orderId, { by: "USER", actorId: userIds[0], userId: userIds[0], reason: "test", refundMode: "REQUEST" }), TX_OPTIONS);
    expect(c1.refundPaise).toBe(o1.netAmountPaise);
    const row1 = await prisma.order.findUnique({ where: { id: o1.orderId } });
    expect(row1?.paymentStatus).toBe("REFUNDED");
    expect(row1?.refundStatus).toBe("REQUESTED");
    await expect(prisma.$transaction((tx) => cancelOrderTx(tx, o1.orderId, { by: "USER", actorId: userIds[0], userId: userIds[0], reason: "again", refundMode: "REQUEST" }), TX_OPTIONS)).rejects.toThrow();
    // someone else cannot cancel it
    const o2 = await mk(1);
    await expect(prisma.$transaction((tx) => cancelOrderTx(tx, o2.orderId, { by: "USER", actorId: userIds[2], userId: userIds[2], reason: "nope", refundMode: "REQUEST" }), TX_OPTIONS)).rejects.toThrow();
    // upgrade: new order only for the difference; old one closes when the new one is paid
    const up = await prisma.$transaction((tx) => startUpgradeTx(tx, o2.orderId, userIds[1], b.id), TX_OPTIONS);
    expect(up.netAmountPaise).toBeLessThan(b.pricePaise * 1.18);
    expect((await prisma.order.findUnique({ where: { id: o2.orderId } }))?.paymentStatus).toBe("PAID");
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: up.orderId }, data: { paymentStatus: "PAID" } });
      await settleUpgrade(tx, up.orderId);
    }, TX_OPTIONS);
    const closed = await prisma.order.findUnique({ where: { id: o2.orderId } });
    expect(closed?.refundStatus).toBe("CREDITED");
    expect(closed?.cancelledBy).toBe("UPGRADE");
    // a downgrade is refused
    const o3 = await mk(3);
    await prisma.order.update({ where: { id: o3.orderId }, data: { planId: b.id } });
    await expect(prisma.$transaction((tx) => startUpgradeTx(tx, o3.orderId, userIds[3], a.id), TX_OPTIONS)).rejects.toThrow();
  }, 300000);
});
