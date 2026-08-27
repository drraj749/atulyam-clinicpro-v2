-- CreateTable
CREATE TABLE "IpdClinicalNote" (
    "id" SERIAL NOT NULL,
    "admissionId" INTEGER NOT NULL,
    "noteType" TEXT NOT NULL DEFAULT 'Progress',
    "note" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IpdClinicalNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IpdClinicalNote_admissionId_idx" ON "IpdClinicalNote"("admissionId");

-- CreateIndex
CREATE INDEX "IpdClinicalNote_createdAt_idx" ON "IpdClinicalNote"("createdAt");

-- AddForeignKey
ALTER TABLE "IpdClinicalNote" ADD CONSTRAINT "IpdClinicalNote_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "IpdAdmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

