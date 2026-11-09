-- AlterTable
ALTER TABLE "OtherService" ADD COLUMN "natureEn" TEXT,
ADD COLUMN "natureHi" TEXT,
ADD COLUMN "numberOfDays" INTEGER,
ADD COLUMN "startDate" TIMESTAMP(3),
ADD COLUMN "endDate" TIMESTAMP(3),
ADD COLUMN "itineraryDays" JSONB,
ADD COLUMN "facebookUrl" TEXT,
ADD COLUMN "whatsappGroupUrl" TEXT;
