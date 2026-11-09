-- AlterTable Service
ALTER TABLE "Service" ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "itineraryEn" TEXT,
ADD COLUMN "itineraryHi" TEXT,
ADD COLUMN "samagriEn" TEXT,
ADD COLUMN "samagriHi" TEXT,
ADD COLUMN "youtubeUrl" TEXT,
ADD COLUMN "additionalLinks" JSONB;

-- AlterTable Plan
ALTER TABLE "Plan" ADD COLUMN "programEn" TEXT,
ADD COLUMN "programHi" TEXT,
ADD COLUMN "preparationEn" TEXT,
ADD COLUMN "preparationHi" TEXT,
ADD COLUMN "samagriEn" TEXT,
ADD COLUMN "samagriHi" TEXT,
ADD COLUMN "itineraryEn" TEXT,
ADD COLUMN "itineraryHi" TEXT;

-- AlterTable AdminSettings
ALTER TABLE "AdminSettings" ADD COLUMN "astrosageEmbedUrl" TEXT DEFAULT 'https://www.astrosage.com/freekundli/';

-- AlterTable BlogPost
ALTER TABLE "BlogPost" ADD COLUMN "youtubeUrl" TEXT,
ADD COLUMN "additionalLinks" JSONB;

-- CreateTable OtherService
CREATE TABLE "OtherService" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleHi" TEXT NOT NULL,
    "taglineEn" TEXT,
    "taglineHi" TEXT,
    "descriptionEn" TEXT NOT NULL,
    "descriptionHi" TEXT NOT NULL,
    "imageUrl" TEXT,
    "actionUrl" TEXT,
    "actionTextEn" TEXT DEFAULT 'Visit Portal / Learn More',
    "actionTextHi" TEXT DEFAULT 'पोर्टल पर जाएं / विवरण देखें',
    "youtubeUrl" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtherService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OtherService_slug_key" ON "OtherService"("slug");
