-- CreateTable
CREATE TABLE "IpdCharge" (
    "id" SERIAL NOT NULL,
    "admissionId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "chargeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" INTEGER,

    CONSTRAINT "IpdCharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IpdPayment" (
    "id" SERIAL NOT NULL,
    "admissionId" INTEGER NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "remarks" TEXT,
    "receivedBy" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" INTEGER,

    CONSTRAINT "IpdPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IpdCharge_admissionId_idx" ON "IpdCharge"("admissionId");

-- CreateIndex
CREATE INDEX "IpdCharge_category_idx" ON "IpdCharge"("category");

-- CreateIndex
CREATE INDEX "IpdCharge_chargeDate_idx" ON "IpdCharge"("chargeDate");

-- CreateIndex
CREATE UNIQUE INDEX "IpdPayment_receiptNo_key" ON "IpdPayment"("receiptNo");

-- CreateIndex
CREATE INDEX "IpdPayment_admissionId_idx" ON "IpdPayment"("admissionId");

-- CreateIndex
CREATE INDEX "IpdPayment_paidAt_idx" ON "IpdPayment"("paidAt");

-- AddForeignKey
ALTER TABLE "IpdCharge" ADD CONSTRAINT "IpdCharge_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "IpdAdmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IpdCharge" ADD CONSTRAINT "IpdCharge_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IpdPayment" ADD CONSTRAINT "IpdPayment_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "IpdAdmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IpdPayment" ADD CONSTRAINT "IpdPayment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

