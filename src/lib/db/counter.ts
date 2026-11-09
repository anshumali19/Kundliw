import type { Prisma } from "@prisma/client";

/**
 * Next number of a named counter (order numbers, invoice numbers).
 * One INSERT ... ON DUPLICATE KEY UPDATE is atomic in MySQL and MariaDB, and the row stays locked until the
 * surrounding transaction ends, so two customers can never receive the same number.
 * Call it inside a transaction.
 */
export async function nextSequence(tx: Prisma.TransactionClient, id: string): Promise<number> {
  await tx.$executeRaw`INSERT INTO \`Counter\` (\`id\`, \`seq\`) VALUES (${id}, 1) ON DUPLICATE KEY UPDATE \`seq\` = \`seq\` + 1`;
  const rows = await tx.$queryRaw<Array<{ seq: number | bigint }>>`SELECT \`seq\` FROM \`Counter\` WHERE \`id\` = ${id}`;
  return Number(rows[0]?.seq ?? 1);
}
