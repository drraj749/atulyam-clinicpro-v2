export type LabTest = {
  id: number;

  testCode: string;

  category: string;

  testName: string;

  shortName?: string;

  specimen: string;

  method?: string;

  unit?: string;

  normalRange?: string;

  price: number;

  active: boolean;
};

export type LabReportItem = {
  id: number;

  testId: number;

  testName: string;

  result: string;

  unit?: string;

  normalRange?: string;

  remarks?: string;
};

export type LabReport = {
  id: number;

  patientId: string;

  patientName: string;

  age: number;

  gender: string;

  referredBy?: string;

  collectedAt?: string;

  reportedAt?: string;

  items: LabReportItem[];
};