-- CreateTable
CREATE TABLE "IpdMedicationAdministration" (
    "id" SERIAL NOT NULL,
    "admissionId" INTEGER NOT NULL,
    "medicationOrderId" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "administeredAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Given',
    "doseGiven" TEXT,
    "remarks" TEXT,
    "administeredBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IpdMedicationAdministration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IpdMedicationAdministration_admissionId_idx" ON "IpdMedicationAdministration"("admissionId");

-- CreateIndex
CREATE INDEX "IpdMedicationAdministration_medicationOrderId_idx" ON "IpdMedicationAdministration"("medicationOrderId");

-- CreateIndex
CREATE INDEX "IpdMedicationAdministration_scheduledAt_idx" ON "IpdMedicationAdministration"("scheduledAt");

-- CreateIndex
CREATE INDEX "IpdMedicationAdministration_status_idx" ON "IpdMedicationAdministration"("status");

-- AddForeignKey
ALTER TABLE "IpdMedicationAdministration" ADD CONSTRAINT "IpdMedicationAdministration_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "IpdAdmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IpdMedicationAdministration" ADD CONSTRAINT "IpdMedicationAdministration_medicationOrderId_fkey" FOREIGN KEY ("medicationOrderId") REFERENCES "IpdMedicationOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

