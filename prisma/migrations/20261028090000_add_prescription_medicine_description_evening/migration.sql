-- Add per-medicine description and evening timing without changing existing records.
ALTER TABLE "PrescriptionItem"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "evening" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "DiseaseTemplateMedicine"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "evening" BOOLEAN NOT NULL DEFAULT false;
