/* Creates (or resets) a demo customer and a demo associate with sample orders, for client testing.
   Usage: DATABASE_URL=... node scripts/seed-demo-accounts.cjs
   Safe to re-run. Do not run against production unless you want these demo accounts there. */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const USER = { email: "demo.user@kanad-jyotish.in", password: "DemoUser@2026", name: "Demo Customer" };
const ASSOC = { email: "demo.associate@kanad-jyotish.in", password: "DemoAssoc@2026", name: "Demo Associate", code: "DEMO2026" };

async function upsertUser(u, role) {
  const passwordHash = await bcrypt.hash(u.password, 12);
  return prisma.user.upsert({
    where: { email: u.email },
    update: { passwordHash, role, name: u.name, emailVerified: new Date() },
    create: { email: u.email, passwordHash, role, name: u.name, emailVerified: new Date() },
  });
}

async function makeOrder({ n, user, plan, status, associateId, jataka }) {
  const orderNumber = `DEMO-2026-${n}`;
  const base = plan.pricePaise, gst = Math.round(base * 0.18);
  const data = {
    orderNumber, userId: user.id, serviceId: plan.serviceId, planId: plan.id, status,
    jatakaDetails: jataka, baseAmountPaise: base, taxableAmountPaise: base, gstAmountPaise: gst, netAmountPaise: base + gst,
    paymentStatus: "PAID", paymentMode: "MANUAL_UPI", associateId: associateId || null,
  };
  const existing = await prisma.order.findUnique({ where: { orderNumber } });
  const order = existing ? await prisma.order.update({ where: { orderNumber }, data }) : await prisma.order.create({ data });
  return order;
}

(async () => {
  const user = await upsertUser(USER, "USER");
  const assocUser = await upsertUser(ASSOC, "ASSOCIATE");
  const assoc = await prisma.associateProfile.upsert({
    where: { userId: assocUser.id },
    update: { status: "APPROVED", referralCode: ASSOC.code },
    create: { userId: assocUser.id, referralCode: ASSOC.code, status: "APPROVED" },
  });
  const plans = await prisma.plan.findMany({ where: { isActive: true }, take: 3, orderBy: { pricePaise: "asc" } });
  if (!plans.length) { console.log("No plans found; accounts created without orders."); return; }
  const j = { name: "Demo Customer", phone: "9000000000", email: USER.email, gender: "Male", dob: "1990-01-15", tob: "06:30", pob: "Varanasi", language: "hi", queries: "Demo order for testing" };
  const o1 = await makeOrder({ n: "0001", user, plan: plans[0], status: "KUNDLI_COMPLETE", jataka: j });
  const o2 = await makeOrder({ n: "0002", user, plan: plans[plans.length - 1], status: "ORDER_RECEIVED", jataka: j });
  const o3 = await makeOrder({ n: "0003", user, plan: plans[0], status: "DELIVERED", associateId: assoc.id, jataka: j });
  await prisma.orderStatusEvent.deleteMany({ where: { orderId: { in: [o1.id, o3.id] } } }).catch(() => {});
  for (const [o, to] of [[o1, "KUNDLI_COMPLETE"], [o3, "DELIVERED"]]) {
    await prisma.orderStatusEvent.create({ data: { orderId: o.id, status: to, note: "Your kundli report has been prepared by the Kendra." } }).catch((e) => console.log("status event skipped:", e.message.split("\n").pop()));
  }
  await prisma.commission.upsert({
    where: { orderId: o3.id }, update: { amountPaise: 15000, status: "EARNED" },
    create: { orderId: o3.id, associateId: assoc.id, amountPaise: 15000, status: "EARNED" },
  });
  console.log("DEMO USER      ", USER.email, USER.password);
  console.log("DEMO ASSOCIATE ", ASSOC.email, ASSOC.password, "referral:", ASSOC.code);
})().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
