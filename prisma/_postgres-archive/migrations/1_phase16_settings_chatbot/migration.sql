-- AlterTable
ALTER TABLE "AdminSettings" ADD COLUMN "chatbotEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "chatbotWelcomeEn" TEXT,
ADD COLUMN "chatbotWelcomeHi" TEXT,
ADD COLUMN "encAstrosageApiKey" TEXT,
ADD COLUMN "encAstrosageUserId" TEXT,
ADD COLUMN "encFacebookAppId" TEXT,
ADD COLUMN "encFacebookAppSecret" TEXT,
ADD COLUMN "encGoogleClientId" TEXT,
ADD COLUMN "encGoogleClientSecret" TEXT,
ADD COLUMN "encMsg91AuthKey" TEXT,
ADD COLUMN "encMsg91OtpTemplateId" TEXT,
ADD COLUMN "encMsg91SenderId" TEXT,
ADD COLUMN "encRazorpayKeyId" TEXT,
ADD COLUMN "encRazorpayKeySecret" TEXT,
ADD COLUMN "encRazorpayWebhookSecret" TEXT,
ADD COLUMN "encSmtpFrom" TEXT,
ADD COLUMN "encSmtpHost" TEXT,
ADD COLUMN "encSmtpPass" TEXT,
ADD COLUMN "encSmtpPort" INTEGER,
ADD COLUMN "encSmtpUser" TEXT,
ADD COLUMN "googleAnalyticsId" TEXT,
ADD COLUMN "googleMapEmbedUrl" TEXT,
ADD COLUMN "socialTelegram" TEXT,
ADD COLUMN "socialWhatsapp" TEXT,
ADD COLUMN "whatsappNumber" TEXT;

-- CreateTable
CREATE TABLE "ChatbotQA" (
    "id" TEXT NOT NULL,
    "questionEn" TEXT NOT NULL,
    "questionHi" TEXT NOT NULL,
    "answerEn" TEXT NOT NULL,
    "answerHi" TEXT NOT NULL,
    "keywords" TEXT[],
    "quickReplyEn" TEXT,
    "quickReplyHi" TEXT,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatbotQA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactEnquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'CONTACT_PAGE',
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatbotQA_category_isActive_idx" ON "ChatbotQA"("category", "isActive");

-- CreateIndex
CREATE INDEX "ContactEnquiry_isResolved_createdAt_idx" ON "ContactEnquiry"("isResolved", "createdAt");
