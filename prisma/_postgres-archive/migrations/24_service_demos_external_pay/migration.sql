-- AlterTable
ALTER TABLE "Service" ADD COLUMN "demos" JSONB,
ADD COLUMN "externalPayUrl" TEXT,
ADD COLUMN "externalPayNoteEn" TEXT,
ADD COLUMN "externalPayNoteHi" TEXT;

-- AlterTable
ALTER TABLE "OtherService" ADD COLUMN "demos" JSONB;
