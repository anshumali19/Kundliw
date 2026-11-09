-- AlterTable
ALTER TABLE "MediaGalleryItem" ADD COLUMN "videoUrl" TEXT,
ADD COLUMN "mediaType" TEXT NOT NULL DEFAULT 'IMAGE',
ADD COLUMN "externalLink" TEXT;

-- CreateTable
CREATE TABLE "FounderProfile" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "nameEn" TEXT NOT NULL DEFAULT 'Pt. Radheshyam Shastri',
    "nameHi" TEXT NOT NULL DEFAULT 'पं. राधेश्याम शास्त्री',
    "designationEn" TEXT NOT NULL DEFAULT 'Founder & Chief Astrologer',
    "designationHi" TEXT NOT NULL DEFAULT 'संस्थापक एवं मुख्य ज्योतिषाचार्य',
    "roleEn" TEXT NOT NULL DEFAULT 'Vedic Ephemeris & Siddhanta Jyotish Tradition',
    "roleHi" TEXT NOT NULL DEFAULT 'काशी वेदांग ज्योतिष एवं दृग्गणित सिद्धान्त परंपरा',
    "photoUrl" TEXT,
    "bioEn" TEXT NOT NULL,
    "bioHi" TEXT NOT NULL,
    "youtubeUrl" TEXT,
    "additionalLinks" JSONB,
    "footerNoteEn" TEXT,
    "footerNoteHi" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FounderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL,
    "questionEn" TEXT NOT NULL,
    "questionHi" TEXT NOT NULL,
    "answerEn" TEXT NOT NULL,
    "answerHi" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FaqItem_category_isActive_orderIndex_idx" ON "FaqItem"("category", "isActive", "orderIndex");
