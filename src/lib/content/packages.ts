import type { Prisma } from "@prisma/client";

/**
 * Prisma filter for plans a customer may see or book: the plan is on, and its package (if it has one)
 * is on too. Switching a package off hides all its plans.
 */
export const activePlanWhere: Prisma.PlanWhereInput = {
  isActive: true,
  OR: [{ packageId: null }, { package: { isActive: true } }],
};
