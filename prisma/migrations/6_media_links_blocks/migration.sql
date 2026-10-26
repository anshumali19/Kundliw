-- AlterTable
ALTER TABLE "Plan" ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "youtubeUrl" TEXT,
ADD COLUMN "additionalLinks" JSONB;

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN "photoUrl" TEXT,
ADD COLUMN "youtubeUrl" TEXT,
ADD COLUMN "additionalLinks" JSONB;

-- AlterTable
ALTER TABLE "OtherService" ADD COLUMN "additionalLinks" JSONB;

-- AlterTable
ALTER TABLE "MediaGalleryItem" ADD COLUMN "additionalLinks" JSONB,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "StaticPage" ADD COLUMN "blocks" JSONB,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "showInFooter" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "FounderProfile" ADD COLUMN "blocks" JSONB;
