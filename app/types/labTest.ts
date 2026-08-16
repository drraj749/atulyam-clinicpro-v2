export type LabTestForm = {
  testCode: string;

  category: string;

  testName: string;

  shortName: string;

  specimen: string;

  method: string;

  unit: string;

  normalRange: string;

  price: string;
};

export const initialLabTest: LabTestForm = {
  testCode: "",

  category: "",

  testName: "",

  shortName: "",

  specimen: "",

  method: "",

  unit: "",

  normalRange: "",

  price: "",
};