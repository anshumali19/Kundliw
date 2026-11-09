-- AlterTable: an order can carry up to two more plans of the same service (planId stays the first one)
ALTER TABLE "Order" ADD COLUMN "extraPlanIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
