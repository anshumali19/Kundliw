import { z } from "zod";

/**
 * A "send only what changed" version of an object schema.
 *
 * Zod 4 keeps filling in `.default(...)` values for fields that are missing even after
 * `.partial()`, which would silently reset untouched fields (active flag, order, lists...)
 * on every edit. This strips those defaults first so a missing field stays missing.
 */
export function partialUpdate<T extends z.ZodObject>(schema: T) {
  const shape: Record<string, z.ZodType> = {};
  for (const [key, field] of Object.entries(schema.shape)) {
    let inner = field as z.ZodType;
    for (;;) {
      if (inner instanceof z.ZodDefault) inner = inner.removeDefault() as z.ZodType;
      else if (inner instanceof z.ZodOptional) inner = inner.unwrap() as z.ZodType;
      else break;
    }
    shape[key] = inner;
  }
  // Same field types as `schema.partial()`, minus the defaults
  return schema.extend(shape).partial() as unknown as ReturnType<T["partial"]>;
}
