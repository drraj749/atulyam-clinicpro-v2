export type LabReportItem = {
  id: number;

  testName: string;

  result: string;

  unit: string;

  normalRange: string;

  remarks: string;
};

export type LabReport = {
  orderId: number;

  orderNo: string;

  patientName: string;

  patientId: string;

  age: number;

  gender: string;

  referredBy: string;

  items: LabReportItem[];
};

export const emptyReportItem: LabReportItem = {
  id: 0,

  testName: "",

  result: "",

  unit: "",

  normalRange: "",

  remarks: "",
};