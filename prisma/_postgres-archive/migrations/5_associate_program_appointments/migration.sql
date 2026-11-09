-- CreateEnum
CREATE TYPE "AssociateStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'EARNED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('REQUESTED', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- AlterTable
ALTER TABLE "AdminSettings" ADD COLUMN "appDownloadUrl" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "associateId" TEXT,
ADD COLUMN "appointmentStatus" "AppointmentStatus",
ADD COLUMN "appointmentNote" TEXT;

-- CreateTable
CREATE TABLE "AssociateProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "status" "AssociateStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionRule" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT,
    "planId" TEXT,
    "type" "DiscountType" NOT NULL,
    "value" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "associateId" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "payoutId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutRequest" (
    "id" TEXT NOT NULL,
    "associateId" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'REQUESTED',
    "note" TEXT,
    "paymentReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssociateProfile_userId_key" ON "AssociateProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AssociateProfile_referralCode_key" ON "AssociateProfile"("referralCode");

-- CreateIndex
CREATE INDEX "AssociateProfile_status_idx" ON "AssociateProfile"("status");

-- CreateIndex
CREATE INDEX "CommissionRule_serviceId_idx" ON "CommissionRule"("serviceId");

-- CreateIndex
CREATE INDEX "CommissionRule_planId_idx" ON "CommissionRule"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "Commission_orderId_key" ON "Commission"("orderId");

-- CreateIndex
CREATE INDEX "Commission_associateId_status_idx" ON "Commission"("associateId", "status");

-- CreateIndex
CREATE INDEX "PayoutRequest_associateId_status_idx" ON "PayoutRequest"("associateId", "status");

-- CreateIndex
CREATE INDEX "Order_associateId_idx" ON "Order"("associateId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_associateId_fkey" FOREIGN KEY ("associateId") REFERENCES "AssociateProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssociateProfile" ADD CONSTRAINT "AssociateProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_associateId_fkey" FOREIGN KEY ("associateId") REFERENCES "AssociateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "PayoutRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_associateId_fkey" FOREIGN KEY ("associateId") REFERENCES "AssociateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
