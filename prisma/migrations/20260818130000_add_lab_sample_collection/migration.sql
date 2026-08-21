-- CreateTable
CREATE TABLE "LabSampleCollection" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "patientName" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "labName" TEXT NOT NULL,

    CONSTRAINT "LabSampleCollection_pkey" PRIMARY KEY ("id")
);

