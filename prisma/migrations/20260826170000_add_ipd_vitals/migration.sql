-- CreateTable
CREATE TABLE "IpdVital" (
    "id" SERIAL NOT NULL,
    "admissionId" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bp" TEXT,
    "pulse" INTEGER,
    "respiratoryRate" INTEGER,
    "temperature" DOUBLE PRECISION,
    "spo2" INTEGER,
    "weight" DOUBLE PRECISION,
    "randomBloodSugar" DOUBLE PRECISION,
    "painScore" INTEGER,
    "remarks" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IpdVital_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IpdVital_admissionId_idx" ON "IpdVital"("admissionId");

-- CreateIndex
CREATE INDEX "IpdVital_recordedAt_idx" ON "IpdVital"("recordedAt");

-- AddForeignKey
ALTER TABLE "IpdVital" ADD CONSTRAINT "IpdVital_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "IpdAdmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

