export type Medicine = {
  id: number;

  medicineCode: string;

  genericName: string;
  brandName: string | null;
  strength: string | null;

  dosageForm: string | null;
  route: string | null;

  manufacturer: string | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

export type MedicineForm = {
  medicineCode: string;

  genericName: string;
  brandName: string;

  strength: string;

  dosageForm: string;
  route: string;

  manufacturer: string;

  isActive: boolean;
};

export const emptyMedicineForm: MedicineForm = {
  medicineCode: "",

  genericName: "",
  brandName: "",

  strength: "",

  dosageForm: "",
  route: "Oral",

  manufacturer: "",

  isActive: true,
};