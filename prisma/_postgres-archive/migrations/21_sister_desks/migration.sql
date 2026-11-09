-- CreateTable
CREATE TABLE "MatrimonyProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'FEMALE',
    "dob" TEXT,
    "city" TEXT,
    "about" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isPaidMember" BOOLEAN NOT NULL DEFAULT false,
    "paidUntil" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MatrimonyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelVehicle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "seats" INTEGER NOT NULL DEFAULT 4,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TravelVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "travelDate" TIMESTAMP(3),
    "passengers" INTEGER NOT NULL DEFAULT 1,
    "vehicleId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TravelRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxCase" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "assessmentYear" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "documentUrl" TEXT,
    "filingStatus" TEXT NOT NULL DEFAULT 'RECEIVED',
    "ackNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TaxCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatrimonyProfile_status_idx" ON "MatrimonyProfile"("status");
CREATE INDEX "TravelRequest_status_idx" ON "TravelRequest"("status");
CREATE INDEX "TaxCase_filingStatus_idx" ON "TaxCase"("filingStatus");

-- AddForeignKey
ALTER TABLE "TravelRequest" ADD CONSTRAINT "TravelRequest_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "TravelVehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
