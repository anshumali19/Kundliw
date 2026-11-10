/*
 * One-time data move: PostgreSQL backup (JSON files from the export) -> an EMPTY PostgreSQL database (a new Supabase project).
 *
 *   DATABASE_URL="postgresql://user:pass@host:5432/postgres" node scripts/migrate-pg-to-supabase.cjs <backup-folder> [--verify-only]
 *
 * 1. Reads every table file of the backup (it never touches the source database).
 * 2. Writes each row keeping the same ids, dates, amounts, lists and texts.
 * 3. Verifies: for every table the row count and every column of every row are compared with the backup.
 * Exit code is 0 only if everything matches.
 */
const fs = require("fs");
const path = require("path");
const { PrismaClient, Prisma } = require("@prisma/client");

const dir = process.argv[2];
const verifyOnly = process.argv.includes("--verify-only");
if (!dir || !fs.existsSync(path.join(dir, "_manifest.json"))) {
  console.error("Usage: node scripts/migrate-pg-to-supabase.cjs <backup-folder> [--verify-only]");
  process.exit(2);
}
if (!/^postgres(ql)?:/.test(process.env.DATABASE_URL || "")) {
  console.error("DATABASE_URL must be a postgresql:// address (refusing to run against anything else).");
  process.exit(2);
}

const prisma = new PrismaClient();
const models = Prisma.dmmf.datamodel.models;
const byName = Object.fromEntries(models.map((m) => [m.name, m]));
const lower = (s) => s[0].toLowerCase() + s.slice(1);

// tables in an order where parents come before children
function order() {
  const done = new Set();
  const out = [];
  const visit = (m) => {
    if (done.has(m.name)) return;
    done.add(m.name);
    for (const f of m.fields) {
      if (f.kind === "object" && f.relationFromFields && f.relationFromFields.length && f.type !== m.name) visit(byName[f.type]);
    }
    out.push(m);
  };
  models.forEach(visit);
  return out;
}

const load = (name) => {
  const p = path.join(dir, `${name}.json`);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : [];
};

function toDb(model, row) {
  const data = {};
  for (const f of model.fields) {
    if (f.kind !== "scalar" && f.kind !== "enum") continue;
    let v = row[f.name];
    if (v === undefined) continue;
    if (v === null) {
      data[f.name] = f.type === "Json" ? Prisma.DbNull : null;
      continue;
    }
    if (f.type === "DateTime") v = new Date(v);
    else if (f.type === "Bytes") v = Buffer.from(v.data || v);
    else if (f.type === "BigInt") v = BigInt(v && v.$bigint ? v.$bigint : v);
    data[f.name] = v;
  }
  return data;
}

// ---------- comparison helpers (value as it should look after the move)
const canon = (v) => {
  if (v === null || v === undefined) return null;
  if (Array.isArray(v)) return v.map(canon);
  if (v instanceof Date) return v.getTime();
  if (Buffer.isBuffer(v) || v instanceof Uint8Array) return "bytes:" + Buffer.from(v).toString("hex");
  if (v && typeof v === "object" && v.type === "Buffer" && Array.isArray(v.data)) return "bytes:" + Buffer.from(v.data).toString("hex");
  if (typeof v === "bigint") return v.toString();
  if (typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])]));
  return v;
};
const same = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

function expected(model, row) {
  const out = {};
  for (const f of model.fields) {
    if (f.kind !== "scalar" && f.kind !== "enum") continue;
    let v = row[f.name];
    if (v === undefined) continue;
    if (v !== null && f.type === "DateTime") v = new Date(v);
    out[f.name] = v;
  }
  return out;
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, "_manifest.json"), "utf8"));
  const mods = order();
  let failures = 0;

  if (!verifyOnly) {
    const existing = await prisma.user.count();
    if (existing > 0) {
      console.error("The database is not empty. Use a fresh database (or --verify-only).");
      process.exit(2);
    }
    for (const m of mods) {
      const rows = load(m.name);
      if (!rows.length) continue;
      const delegate = prisma[lower(m.name)];
      for (let i = 0; i < rows.length; i += 200) {
        await delegate.createMany({ data: rows.slice(i, i + 200).map((r) => toDb(m, r)) });
      }
      console.log(`copied ${m.name.padEnd(26)} ${String(rows.length).padStart(5)}`);
    }
  }

  console.log("\n--- verifying every row and column against the backup");
  for (const m of mods) {
    const src = load(m.name);
    const idFields = m.primaryKey ? m.primaryKey.fields : m.fields.filter((f) => f.isId).map((f) => f.name);
    const keyOf = (r) => idFields.map((k) => String(r[k])).join("|");
    const got = await prisma[lower(m.name)].findMany();
    let bad = 0;
    if (got.length !== src.length) {
      console.log(`  COUNT MISMATCH ${m.name}: backup ${src.length}, copy ${got.length}`);
      bad++;
    }
    const gotMap = new Map(got.map((r) => [keyOf(r), r]));
    for (const r of src) {
      const g = gotMap.get(keyOf(r));
      if (!g) {
        console.log(`  MISSING ${m.name} ${keyOf(r)}`);
        bad++;
        continue;
      }
      const exp = expected(m, r);
      for (const f of Object.keys(exp)) {
        if (!same(exp[f], g[f])) {
          console.log(`  DIFF ${m.name}.${f} @ ${keyOf(r)}: backup=${JSON.stringify(canon(exp[f])).slice(0, 80)} copy=${JSON.stringify(canon(g[f])).slice(0, 80)}`);
          bad++;
        }
      }
    }
    failures += bad;
    console.log(`${bad === 0 ? "OK  " : "FAIL"} ${m.name.padEnd(26)} ${src.length} rows`);
  }
  console.log(failures === 0 ? "\nALL TABLES MATCH THE BACKUP" : `\n${failures} PROBLEM(S) FOUND`);
  await prisma.$disconnect();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error("ERROR:", e.message);
  await prisma.$disconnect();
  process.exit(1);
});
