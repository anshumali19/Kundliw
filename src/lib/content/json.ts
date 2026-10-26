import { Prisma } from "@prisma/client";

/** Prisma needs JsonNull (not null) to clear a JSON column. Server-side only. */
export function jsonOrNull<T>(value: T | null | undefined): T | Prisma.NullTypes.JsonNull {
  return value === null || value === undefined ? Prisma.JsonNull : value;
}

/**
 * Converts an optional `additionalLinks` value for Prisma: undefined is left out,
 * null clears the column, and a list is stored as JSON.
 */
export function withJsonLinks<T extends { additionalLinks?: unknown }>(data: T) {
  const { additionalLinks, ...rest } = data;
  if (additionalLinks === undefined) return rest;
  return {
    ...rest,
    additionalLinks:
      additionalLinks === null ? Prisma.JsonNull : (additionalLinks as Prisma.InputJsonValue),
  };
}
