-- AlterTable
ALTER TABLE "AdminSettings" ADD COLUMN "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "maintenanceMessageEn" TEXT,
ADD COLUMN "maintenanceMessageHi" TEXT;

-- AlterTable
ALTER TABLE "ContactEnquiry" ADD COLUMN "leadStatus" TEXT NOT NULL DEFAULT 'NEW';

-- Existing resolved enquiries become Closed
UPDATE "ContactEnquiry" SET "leadStatus" = 'CLOSED' WHERE "isResolved" = true;
