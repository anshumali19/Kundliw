-- AlterTable
ALTER TABLE "MarqueeItem" ADD COLUMN "pauseOnHover" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "allowClose" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "VaultFile" ADD COLUMN "uploadedByRole" TEXT NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "AssociateProfile" ADD COLUMN "notes" TEXT,
ADD COLUMN "customCommissionType" "DiscountType",
ADD COLUMN "customCommissionValue" INTEGER,
ADD COLUMN "payoutUpi" TEXT,
ADD COLUMN "payoutAccountHolder" TEXT,
ADD COLUMN "payoutAccountNumber" TEXT,
ADD COLUMN "payoutIfsc" TEXT;

-- AlterTable
ALTER TABLE "AdminSettings" ADD COLUMN "mapEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "mapZoom" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN "mapLabelEn" TEXT,
ADD COLUMN "mapLabelHi" TEXT,
ADD COLUMN "associatesEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "associateAutoApprove" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "associateMinPayoutPaise" INTEGER NOT NULL DEFAULT 50000,
ADD COLUMN "associateReferralDays" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN "associateTermsEn" TEXT,
ADD COLUMN "associateTermsHi" TEXT,
ADD COLUMN "backupAutoEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "backupKeepDaily" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN "backupKeepWeekly" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN "backupKeepMonthly" INTEGER NOT NULL DEFAULT 12;

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'OTHER',
    "titleEn" TEXT NOT NULL,
    "titleHi" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionHi" TEXT,
    "documentNumber" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackupRecord" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "tables" INTEGER NOT NULL DEFAULT 0,
    "rows" INTEGER NOT NULL DEFAULT 0,
    "data" BYTEA NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackupRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BackupRecord_kind_createdAt_idx" ON "BackupRecord"("kind", "createdAt");
