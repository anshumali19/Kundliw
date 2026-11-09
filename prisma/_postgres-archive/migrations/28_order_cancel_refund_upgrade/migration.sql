-- AlterTable
ALTER TABLE "Order" ADD COLUMN "cancelledAt" TIMESTAMP(3),
ADD COLUMN "cancelReason" TEXT,
ADD COLUMN "cancelledBy" TEXT,
ADD COLUMN "refundStatus" TEXT,
ADD COLUMN "refundAmountPaise" INTEGER,
ADD COLUMN "refundedAt" TIMESTAMP(3),
ADD COLUMN "upgradeFromOrderId" TEXT;

-- CreateIndex
CREATE INDEX "Order_upgradeFromOrderId_idx" ON "Order"("upgradeFromOrderId");

-- Orders already marked refunded count as refunded and sent
UPDATE "Order" SET "refundStatus" = 'SENT', "refundedAt" = "updatedAt", "refundAmountPaise" = "netAmountPaise" WHERE "paymentStatus" = 'REFUNDED';
