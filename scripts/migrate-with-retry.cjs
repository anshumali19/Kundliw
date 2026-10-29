/* Runs `prisma migrate deploy`, retrying only when the database is briefly out of connections
   (several builds in a row can hit "too many connections for role prisma_migration"). */
const { spawnSync } = require("node:child_process");
const attempts = 6;
const transient = /too many connections|P1001|P1002|P1017|timed out|ECONNRESET|Can't reach database/i;
for (let i = 1; i <= attempts; i++) {
  const r = spawnSync("npx", ["prisma", "migrate", "deploy"], { encoding: "utf8", shell: true });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  process.stdout.write(out);
  if (r.status === 0) process.exit(0);
  if (i === attempts || !transient.test(out)) process.exit(r.status || 1);
  const wait = 15 * i;
  console.log(`[migrate] attempt ${i} hit a connection limit; retrying in ${wait}s`);
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, wait * 1000);
}
