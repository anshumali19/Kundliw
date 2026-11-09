-- AlterTable
ALTER TABLE "StaticPage" ADD COLUMN "showInMenu" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "metaDescEn" TEXT,
ADD COLUMN "metaDescHi" TEXT;
