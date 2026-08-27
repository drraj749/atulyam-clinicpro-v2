-- CreateTable
CREATE TABLE "IpdInvestigation" (
    "id" SERIAL NOT NULL,
    "admissionId" INTEGER NOT NULL,
    "testName" TEXT NOT NULL,
    "testCode" TEXT,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ordered',
    "result" TEXT,
    "remarks" TEXT,
    "orderedBy" TEXT,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IpdInvestigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IpdDischargeSummary" (
    "id" SERIAL NOT NULL,
    "admissionId" INTEGER NOT NULL,
    "finalDiagnosis" TEXT,
    "history" TEXT,
    "examination" TEXT,
    "hospitalCourse" TEXT,
    "investigations" TEXT,
    "treatmentGiven" TEXT,
    "procedures" TEXT,
    "conditionAtDischarge" TEXT,
    "dischargeAdvice" TEXT,
    "followUpAdvice" TEXT,
    "dischargedBy" TEXT,
    "dischargeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IpdDischargeSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IpdInvestigation_admissionId_idx" ON "IpdInvestigation"("admissionId");

-- CreateIndex
CREATE INDEX "IpdInvestigation_status_idx" ON "IpdInvestigation"("status");

-- CreateIndex
CREATE INDEX "IpdInvestigation_orderedAt_idx" ON "IpdInvestigation"("orderedAt");

-- CreateIndex
CREATE UNIQUE INDEX "IpdDischargeSummary_admissionId_key" ON "IpdDischargeSummary"("admissionId");

-- CreateIndex
CREATE INDEX "IpdDischargeSummary_dischargeDate_idx" ON "IpdDischargeSummary"("dischargeDate");

-- AddForeignKey
ALTER TABLE "IpdInvestigation" ADD CONSTRAINT "IpdInvestigation_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "IpdAdmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IpdDischargeSummary" ADD CONSTRAINT "IpdDischargeSummary_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "IpdAdmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

