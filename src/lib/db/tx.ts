import { Prisma } from "@prisma/client";

/**
 * Options for every multi-step database change (transaction).
 * READ COMMITTED gives MySQL the same behaviour PostgreSQL had: after waiting for a lock, a step sees what other
 * customers have just saved (the default, REPEATABLE READ, would keep showing older data).
 * The generous time limits are for a remote database; the 5 second default is too short for a booking.
 */
export const TX_OPTIONS = {
  isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
  maxWait: 10000,
  timeout: 30000,
};
