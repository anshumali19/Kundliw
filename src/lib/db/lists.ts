import type { Prisma } from "@prisma/client";

/**
 * MySQL has no list column, so lists of words (features, inclusions, offer plans ...) are saved as JSON.
 * This turns whatever comes back into a plain list of strings. Empty or missing values become [].
 */
export function toList(value: Prisma.JsonValue | unknown | undefined): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}
