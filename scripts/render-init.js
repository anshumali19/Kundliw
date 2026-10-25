/* eslint-disable */
/**
 * One-time production bootstrap, run by Render's pre-deploy step after migrations.
 *
 * prisma/seed.ts is destructive (it resets banners, gallery, testimonials, FAQ),
 * so it must never run on every deploy. This script seeds only when the database
 * has no ADMIN user yet, i.e. on the very first deploy.
 */
const { PrismaClient } = require("@prisma/client");
const { spawnSync } = require("child_process");

async function main() {
  const prisma = new PrismaClient();
  let admins;
  try {
    admins = await prisma.user.count({ where: { role: "ADMIN" } });
  } finally {
    await prisma.$disconnect();
  }

  if (admins > 0) {
    console.log("[render-init] Admin already exists; skipping seed.");
    return;
  }

  if (!process.env.INITIAL_ADMIN_PASSWORD) {
    console.error("[render-init] INITIAL_ADMIN_PASSWORD is not set; cannot create the first admin.");
    process.exit(1);
  }

  console.log("[render-init] Fresh database detected; seeding initial content...");
  const result = spawnSync(
    "npx",
    ["ts-node", "--compiler-options", '{"module":"CommonJS"}', "prisma/seed.ts"],
    { stdio: "inherit", shell: true, env: { ...process.env, SEED_ALLOW_REMOTE: "true" } }
  );
  process.exit(result.status === null ? 1 : result.status);
}

main().catch((err) => {
  console.error("[render-init] Failed:", err);
  process.exit(1);
});
