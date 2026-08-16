-- CreateTable
CREATE TABLE "OpdVisit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "opdNo" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "doctor" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "complaint" TEXT,
    "examination" TEXT,
    "diagnosis" TEXT,
    "advice" TEXT,
    "bp" TEXT,
    "pulse" INTEGER,
    "temperature" REAL,
    "spo2" INTEGER,
    "height" REAL,
    "weight" REAL,
    "fee" REAL,
    "paymentMode" TEXT,
    "followUpDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OpdVisit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "opdVisitId" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Prescription_opdVisitId_fkey" FOREIGN KEY ("opdVisitId") REFERENCES "OpdVisit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrescriptionItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "prescriptionId" INTEGER NOT NULL,
    "medicineName" TEXT NOT NULL,
    "strength" TEXT,
    "dosage" TEXT,
    "frequency" TEXT,
    "duration" TEXT,
    "instruction" TEXT,
    CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Medicine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "medicineCode" TEXT,
    "genericName" TEXT NOT NULL,
    "brandName" TEXT,
    "strength" TEXT,
    "dosageForm" TEXT,
    "manufacturer" TEXT,
    "schedule" TEXT,
    "mrp" REAL,
    "purchaseRate" REAL,
    "sellingRate" REAL,
    "gst" REAL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LabTest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "testCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "shortName" TEXT,
    "specimen" TEXT NOT NULL,
    "method" TEXT,
    "unit" TEXT,
    "normalRange" TEXT,
    "price" REAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LabOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNo" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "referredBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "collectedAt" DATETIME,
    "reportedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LabOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabOrderItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "testId" INTEGER NOT NULL,
    "result" TEXT,
    "remarks" TEXT,
    CONSTRAINT "LabOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "LabOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LabOrderItem_testId_fkey" FOREIGN KEY ("testId") REFERENCES "LabTest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "OpdVisit_opdNo_key" ON "OpdVisit"("opdNo");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_opdVisitId_key" ON "Prescription"("opdVisitId");

-- CreateIndex
CREATE UNIQUE INDEX "Medicine_medicineCode_key" ON "Medicine"("medicineCode");

-- CreateIndex
CREATE UNIQUE INDEX "LabTest_testCode_key" ON "LabTest"("testCode");

-- CreateIndex
CREATE UNIQUE INDEX "LabOrder_orderNo_key" ON "LabOrder"("orderNo");
