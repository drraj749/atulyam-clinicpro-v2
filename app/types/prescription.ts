export type PrescriptionMedicine = {
  id: number;

  medicineId: number | null;

  medicineName: string;

  genericName?: string;

  brandName?: string;

  strength?: string;

  dosageForm?: string;

  dosage?: string;

  frequency?: string;

  duration: string;

  instruction: string;

  morning: boolean;

  afternoon: boolean;

  night: boolean;

  beforeFood: boolean;

  afterFood: boolean;

  sos: boolean;

  quantity?: number | null;

  route?: string;
};

export type Prescription = {
  id: number;

  opdVisitId: number;

  notes: string;

  medicines: PrescriptionMedicine[];
};