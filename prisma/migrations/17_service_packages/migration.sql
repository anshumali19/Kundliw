-- CreateTable
CREATE TABLE "ServicePackage" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleHi" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionHi" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServicePackage_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN "packageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ServicePackage_serviceId_slug_key" ON "ServicePackage"("serviceId", "slug");

-- AddForeignKey
ALTER TABLE "ServicePackage" ADD CONSTRAINT "ServicePackage_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "ServicePackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Existing plans move into one "Standard Package" per service (the admin can rename or split it)
INSERT INTO "ServicePackage" ("id", "serviceId", "slug", "titleEn", "titleHi", "orderIndex", "createdAt", "updatedAt")
SELECT 'pkg_' || md5(s."id" || '-standard'), s."id", 'standard', 'Standard Package', 'मानक पैकेज', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Service" s
WHERE EXISTS (SELECT 1 FROM "Plan" p WHERE p."serviceId" = s."id");

UPDATE "Plan" p SET "packageId" = 'pkg_' || md5(p."serviceId" || '-standard') WHERE p."packageId" IS NULL;
