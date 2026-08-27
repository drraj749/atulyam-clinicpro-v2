CREATE TABLE "IpdMedicationOrder" (
    "id" SERIAL NOT NULL,
    "admissionId" INTEGER NOT NULL,
    "medicineName" TEXT NOT NULL,
    "strength" TEXT,
    "dosage" TEXT,
    "frequency" TEXT,
    "route" TEXT,
    "duration" TEXT,
    "instruction" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Active',
    "orderedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IpdMedicationOrder_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IpdMedicationOrder_admissionId_idx"
ON "IpdMedicationOrder"("admissionId");

CREATE INDEX "IpdMedicationOrder_status_idx"
ON "IpdMedicationOrder"("status");

CREATE INDEX "IpdMedicationOrder_createdAt_idx"
ON "IpdMedicationOrder"("createdAt");

ALTER TABLE "IpdMedicationOrder"
ADD CONSTRAINT "IpdMedicationOrder_admissionId_fkey"
FOREIGN KEY ("admissionId")
REFERENCES "IpdAdmission"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;