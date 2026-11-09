import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * On Vercel every serverless instance opens its own connections, and the database allows only a few.
 * Keep each instance to one connection unless the address already says otherwise.
 */
function databaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url || process.env.NODE_ENV !== "production" || /[?&]connection_limit=/.test(url)) return url;
  // Serverless (Vercel): one connection per instance. A normal server (Hostinger): a small shared pool,
  // because shared MySQL allows only a few connections per user.
  const pool = process.env.VERCEL ? "connection_limit=1&pool_timeout=20&connect_timeout=15" : "connection_limit=5&pool_timeout=20&connect_timeout=15";
  return url + (url.includes("?") ? "&" : "?") + pool;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasourceUrl: databaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
