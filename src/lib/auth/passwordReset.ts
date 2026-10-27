import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

/** How long a reset link works. */
export const RESET_LINK_MINUTES = 60;

const identifierFor = (userId: string) => `pwreset:${userId}`;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Makes a single-use reset token for this user and returns it (only the hash is stored).
 * Any earlier unused link for the same user stops working.
 */
export async function createResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.deleteMany({ where: { identifier: identifierFor(userId) } });
  await prisma.verificationToken.create({
    data: {
      identifier: identifierFor(userId),
      token: hashToken(token),
      expires: new Date(Date.now() + RESET_LINK_MINUTES * 60 * 1000),
    },
  });
  return token;
}

/** Finds the user a reset token belongs to, or null when it is wrong, used or expired. */
export async function findUserIdByResetToken(token: string): Promise<string | null> {
  if (!/^[0-9a-f]{64}$/.test(token)) return null;
  const row = await prisma.verificationToken.findUnique({ where: { token: hashToken(token) } });
  if (!row || !row.identifier.startsWith("pwreset:") || row.expires < new Date()) return null;
  return row.identifier.slice("pwreset:".length);
}

/** Uses the token up so the link cannot be opened a second time. */
export async function consumeResetToken(userId: string): Promise<void> {
  await prisma.verificationToken.deleteMany({ where: { identifier: identifierFor(userId) } });
}
