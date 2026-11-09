-- AlterTable
ALTER TABLE "ServicePackage"
ADD COLUMN "numberOfDays" INTEGER,
ADD COLUMN "startDate" TIMESTAMP(3),
ADD COLUMN "endDate" TIMESTAMP(3),
ADD COLUMN "seats" INTEGER,
ADD COLUMN "itineraryDays" JSONB,
ADD COLUMN "inclusionsEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "inclusionsHi" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "exclusionsEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "exclusionsHi" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "materialsEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "materialsHi" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "youtubeUrl" TEXT,
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "additionalLinks" JSONB;
