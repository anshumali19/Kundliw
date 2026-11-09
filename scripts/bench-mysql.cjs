/* Times the busiest database queries and shows which index each one uses. Run against a TEST database only:
 *   DATABASE_URL="mysql://root:pw@localhost:3307/kjk" node scripts/bench-mysql.cjs
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function time(label, fn, runs = 15) {
  await fn();
  const t = [];
  for (let i = 0; i < runs; i++) {
    const s = process.hrtime.bigint();
    await fn();
    t.push(Number(process.hrtime.bigint() - s) / 1e6);
  }
  t.sort((a, b) => a - b);
  console.log(`${label.padEnd(58)} median ${t[Math.floor(t.length / 2)].toFixed(1).padStart(7)} ms   worst ${t[t.length - 1].toFixed(1).padStart(7)} ms`);
}

(async () => {
  const user = await prisma.user.findFirst({ where: { role: "USER" }, orderBy: { id: "asc" } });
  const plan = await prisma.plan.findFirst({ where: { packageId: { not: null } } });
  const total = await prisma.order.count();
  console.log(`orders in database: ${total}\n`);
  await time("customer account page: my orders (by user)", () => prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { service: true, plan: true } }));
  await time("admin orders list: newest 50", () => prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { service: true, plan: true } }));
  await time("admin: orders waiting for payment check (count)", () => prisma.order.count({ where: { paymentStatus: "AWAITING_VERIFICATION" } }));
  await time("admin dashboard: orders grouped by status", () => prisma.order.groupBy({ by: ["status"], _count: { _all: true } }));
  await time("track order by order number", () => prisma.order.findFirst({ where: { orderNumber: { equals: "load-054321" } } }));
  await time("package seat count (main plan or extra plan)", () =>
    prisma.order.count({ where: { OR: [{ plan: { packageId: plan.packageId } }, { extraPlans: { some: { planId: { in: [plan.id] } } } }], paymentStatus: { notIn: ["FAILED", "REFUNDED"] } } }),
  );
  await time("services page: services with plans", () => prisma.service.findMany({ where: { isActive: true }, include: { plans: { where: { isActive: true } } } }));
  await time("booking: look up one plan by service and slug", () => prisma.plan.findUnique({ where: { serviceId_slug: { serviceId: plan.serviceId, slug: plan.slug } } }));
  await time("home page: site settings row", () => prisma.siteConfig.findMany());

  console.log("\nHow the database runs each important lookup (what it uses):");
  const explain = async (label, sql) => {
    const rows = await prisma.$queryRawUnsafe(`EXPLAIN ${sql}`);
    const r = rows[0];
    console.log(`  ${label.padEnd(42)} type=${String(r.type).padEnd(6)} index=${String(r.key ?? "NONE").padEnd(26)} rows≈${r.rows}`);
  };
  await explain("orders by user", `SELECT * FROM \`Order\` WHERE userId='${user.id}'`);
  await explain("orders by status", "SELECT id FROM `Order` WHERE status='DELIVERED'");
  await explain("order by order number", "SELECT * FROM `Order` WHERE orderNumber='LOAD-054321'");
  await explain("extra plans by plan (seat count)", "SELECT orderId FROM `OrderExtraPlan` WHERE planId='x'");
  await explain("newest orders (sort by date)", "SELECT id FROM `Order` ORDER BY createdAt DESC LIMIT 50");
  await prisma.$disconnect();
})();
