-- AlterTable
ALTER TABLE "AdminSettings" ADD COLUMN "encWhatsappAccessToken" TEXT,
ADD COLUMN "encWhatsappPhoneNumberId" TEXT,
ADD COLUMN "encWhatsappVerifyToken" TEXT,
ADD COLUMN "encWhatsappAppSecret" TEXT;

-- CreateTable
CREATE TABLE "WhatsAppMessage" (
    "id" TEXT NOT NULL,
    "waMessageId" TEXT,
    "contactPhone" TEXT NOT NULL,
    "contactName" TEXT,
    "direction" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WhatsAppMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppMessage_waMessageId_key" ON "WhatsAppMessage"("waMessageId");
CREATE INDEX "WhatsAppMessage_contactPhone_createdAt_idx" ON "WhatsAppMessage"("contactPhone", "createdAt");
