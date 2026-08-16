export type LabOrderForm = {
  patientId: string;

  referredBy: string;

  tests: number[];
};

export const initialLabOrder: LabOrderForm = {
  patientId: "",

  referredBy: "",

  tests: [],
};

export type LabTestOption = {
  id: number;

  testCode: string;

  testName: string;

  category: string;

  price: number;
};