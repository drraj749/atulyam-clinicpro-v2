export type MedicineRoute =
  | ""
  | "Oral"
  | "IV"
  | "IM"
  | "SC"
  | "Topical"
  | "Inhalation"
  | "Nasal"
  | "Ophthalmic"
  | "Otic";

export type MedicineRow = {
  clientId: string;

  medicineName: string;
  strength: string;

  dosage: string;
  frequency: string;
  duration: string;
  instruction: string;

  morning: boolean;
  afternoon: boolean;
  night: boolean;

  beforeFood: boolean;
  afterFood: boolean;

  sos: boolean;

  quantity: string;
  route: MedicineRoute;
};

export type OPDForm = {
  // Consultation
  doctor: string;
  department: string;
  fee: string;
  paymentMode: string;
  followUpDate: string;

  // History
  complaint: string;
  historyOfPresentIllness: string;
  pastHistory: string;
  drugHistory: string;
  familyHistory: string;
  personalHistory: string;
  allergy: string;

  // Examination
  generalExamination: string;
  cvs: string;
  rs: string;
  cns: string;
  pa: string;
  localExamination: string;

  // Diagnosis
  diagnosis: string;
  advice: string;

  // Prescription
  investigations: string;
  prescriptionNotes: string;

  medicines: MedicineRow[];

  // Vitals
  bp: string;
  pulse: string;
  respiratoryRate: string;
  temperature: string;
  spo2: string;
  height: string;
  weight: string;
  bmi: string;
  randomBloodSugar: string;
  painScore: string;
};