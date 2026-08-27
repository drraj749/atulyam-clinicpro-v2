"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type Bed = {
  id: number;
  bedNumber: string;
  status: string;
  isActive: boolean;
};

type Ward = {
  id: number;
  name: string;
  code: string;
  beds: Bed[];
};

type Patient = {
  id: number;
  patientId: string;
  firstName: string;
  lastName?: string | null;
  age: number;
  gender: string;
  mobile: string;
  address?: string | null;
  bloodGroup?: string | null;
  aadhaar?: string | null;
  occupation?: string | null;
  isActive: boolean;
};

type Admission = {
  id: number;
  ipdNo: string;
  patientId: number;
  bedId: number;
  admittingDoctor: string;
  department: string;
  chiefComplaint?: string | null;
  provisionalDiagnosis?: string | null;
  admissionNotes?: string | null;
  admissionDate: string;
  dischargeDate?: string | null;
  status: string;
  patient: Patient;
  bed: {
    id: number;
    bedNumber: string;
    status: string;
    ward: {
      id: number;
      name: string;
      code: string;
    };
  };
};

type ClinicalNote = {
  id: number;
  admissionId: number;
  noteType: string;
  note: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
};


type IpdVital = {
  id: number;
  admissionId: number;
  recordedAt: string;
  bp?: string | null;
  pulse?: number | null;
  respiratoryRate?: number | null;
  temperature?: number | null;
  spo2?: number | null;
  weight?: number | null;
  randomBloodSugar?: number | null;
  painScore?: number | null;
  remarks?: string | null;
  recordedBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

type MedicationOrder = {
  id: number;
  admissionId: number;
  medicineName: string;
  strength?: string | null;
  dosage?: string | null;
  frequency?: string | null;
  route?: string | null;
  duration?: string | null;
  instruction?: string | null;
  startDate: string;
  endDate?: string | null;
  status: string;
  orderedBy?: string | null;
  createdAt: string;
  updatedAt: string;
};


type IpdInvestigation = {
  id: number;
  admissionId: number;
  testName: string;
  testCode?: string | null;
  category?: string | null;
  status: string;
  result?: string | null;
  remarks?: string | null;
  orderedBy?: string | null;
  orderedAt: string;
  reportedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type IpdDischargeSummary = {
  id: number;
  admissionId: number;
  finalDiagnosis?: string | null;
  history?: string | null;
  examination?: string | null;
  hospitalCourse?: string | null;
  investigations?: string | null;
  treatmentGiven?: string | null;
  procedures?: string | null;
  conditionAtDischarge?: string | null;
  dischargeAdvice?: string | null;
  followUpAdvice?: string | null;
  dischargedBy?: string | null;
  dischargeDate: string;
  createdAt: string;
  updatedAt: string;
};


type IpdCharge = {
  id: number;
  admissionId: number;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  chargeDate: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  patientId?: number | null;
};

type IpdPayment = {
  id: number;
  admissionId: number;
  receiptNo: string;
  amount: number;
  paymentMode: string;
  remarks?: string | null;
  receivedBy?: string | null;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
  patientId?: number | null;
};

type IpdBillingSummary = {
  totalCharges: number;
  totalPayments: number;
  balance: number;
};

const initialNewPatient = {
  firstName: "",
  lastName: "",
  age: "",
  gender: "",
  mobile: "",
  address: "",
  bloodGroup: "",
  aadhaar: "",
  occupation: "",
};


function buildTreatmentGivenFromOrders(orders: MedicationOrder[]) {
  if (!orders.length) return "";
  return orders
    .filter((order) => order.status !== "Stopped" && order.status !== "Cancelled")
    .map((order) => {
      const parts = [
        order.medicineName,
        order.strength,
        order.dosage,
        order.frequency,
        order.route,
        order.duration ? `for ${order.duration}` : "",
        order.instruction ? `(${order.instruction})` : "",
      ].filter(Boolean);
      return `• ${parts.join(" - ")}`;
    })
    .join("\n");
}

const DISCHARGE_MEDICINES_MARKER = "\n\nDISCHARGE MEDICINES / PRESCRIPTION:\n";

function splitDischargeAdvice(value?: string | null) {
  const text = value || "";
  const marker = "DISCHARGE MEDICINES / PRESCRIPTION:";
  const markerIndex = text.indexOf(marker);
  if (markerIndex === -1) {
    return { advice: text, medicines: "" };
  }
  return {
    advice: text.slice(0, markerIndex).trim(),
    medicines: text.slice(markerIndex + marker.length).trim(),
  };
}

function buildDischargeAdvice(advice: string, medicines: string) {
  const cleanAdvice = advice.trim();
  const cleanMedicines = medicines.trim();
  if (cleanAdvice && cleanMedicines) {
    return `${cleanAdvice}${DISCHARGE_MEDICINES_MARKER}${cleanMedicines}`;
  }
  if (cleanMedicines) {
    return `DISCHARGE MEDICINES / PRESCRIPTION:\n${cleanMedicines}`;
  }
  return cleanAdvice;
}

async function readApiResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (contentType.includes("application/json")) {
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error("The server returned invalid JSON.");
    }
  }

  const titleMatch = text.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim();

  throw new Error(
    title
      ? `API request failed (${response.status}): ${title}`
      : `API request failed (${response.status}).`
  );
}

export default function IpdPage() {
  const [wards, setWards] =
    useState<Ward[]>([]);

  const [admissions, setAdmissions] =
    useState<Admission[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingAdmissions, setLoadingAdmissions] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    admissionError,
    setAdmissionError,
  ] = useState("");

  const [
    showAdmissionForm,
    setShowAdmissionForm,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    patientMode,
    setPatientMode,
  ] = useState<
    "existing" | "new"
  >("existing");

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [
    patientSearch,
    setPatientSearch,
  ] = useState("");

  const [
    loadingPatients,
    setLoadingPatients,
  ] = useState(false);

  const [
    selectedPatient,
    setSelectedPatient,
  ] = useState<Patient | null>(
    null
  );

  const [
    newPatient,
    setNewPatient,
  ] = useState(initialNewPatient);

  const [
    selectedWardId,
    setSelectedWardId,
  ] = useState("");

  const [
    selectedBedId,
    setSelectedBedId,
  ] = useState("");

  const [
    admittingDoctor,
    setAdmittingDoctor,
  ] = useState("");

  const [
    department,
    setDepartment,
  ] = useState("");

  const [
    chiefComplaint,
    setChiefComplaint,
  ] = useState("");

  const [
    provisionalDiagnosis,
    setProvisionalDiagnosis,
  ] = useState("");

  const [
    admissionNotes,
    setAdmissionNotes,
  ] = useState("");

  const [
    selectedAdmission,
    setSelectedAdmission,
  ] = useState<Admission | null>(
    null
  );

  const [
    dischargingId,
    setDischargingId,
  ] = useState<number | null>(
    null
  );

  const [clinicalNotes, setClinicalNotes] =
    useState<ClinicalNote[]>([]);

  const [loadingClinicalNotes, setLoadingClinicalNotes] =
    useState(false);

  const [clinicalNotesError, setClinicalNotesError] =
    useState("");

  const [clinicalNoteType, setClinicalNoteType] =
    useState("Progress");

  const [clinicalNoteText, setClinicalNoteText] =
    useState("");

  const [clinicalNoteCreatedBy, setClinicalNoteCreatedBy] =
    useState("");

  const [savingClinicalNote, setSavingClinicalNote] =
    useState(false);


  const [vitals, setVitals] = useState<IpdVital[]>([]);
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [savingVital, setSavingVital] = useState(false);
  const [vitalsError, setVitalsError] = useState("");
  const [vitalForm, setVitalForm] = useState({
    bp: "",
    pulse: "",
    respiratoryRate: "",
    temperature: "",
    spo2: "",
    weight: "",
    randomBloodSugar: "",
    painScore: "",
    remarks: "",
    recordedBy: "",
  });

  const [medicationOrders, setMedicationOrders] =
    useState<MedicationOrder[]>([]);
  const [loadingMedicationOrders, setLoadingMedicationOrders] =
    useState(false);
  const [savingMedicationOrder, setSavingMedicationOrder] =
    useState(false);
  const [medicationError, setMedicationError] = useState("");
  const [medicationForm, setMedicationForm] = useState({
    medicineName: "",
    strength: "",
    dosage: "",
    frequency: "",
    route: "",
    duration: "",
    instruction: "",
    orderedBy: "",
  });

  const [investigations, setInvestigations] = useState<IpdInvestigation[]>([]);
  const [loadingInvestigations, setLoadingInvestigations] = useState(false);
  const [savingInvestigation, setSavingInvestigation] = useState(false);
  const [investigationError, setInvestigationError] = useState("");
  const [investigationForm, setInvestigationForm] = useState({
    testName: "",
    testCode: "",
    category: "",
    orderedBy: "",
  });

  const [dischargeSummary, setDischargeSummary] = useState<IpdDischargeSummary | null>(null);
  const [loadingDischargeSummary, setLoadingDischargeSummary] = useState(false);
  const [savingDischargeSummary, setSavingDischargeSummary] = useState(false);
  const [dischargeSummaryError, setDischargeSummaryError] = useState("");
  const [dischargeSummaryForm, setDischargeSummaryForm] = useState({
    finalDiagnosis: "", history: "", examination: "", hospitalCourse: "",
    investigations: "", treatmentGiven: "", procedures: "", conditionAtDischarge: "",
    dischargeAdvice: "", followUpAdvice: "", dischargedBy: "",
  });
  const [dischargeMedicineText, setDischargeMedicineText] = useState("");

  const [charges, setCharges] = useState<IpdCharge[]>([]);
  const [payments, setPayments] = useState<IpdPayment[]>([]);
  const [billingSummary, setBillingSummary] = useState<IpdBillingSummary>({
    totalCharges: 0,
    totalPayments: 0,
    balance: 0,
  });
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [savingCharge, setSavingCharge] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [billingError, setBillingError] = useState("");
  const [billingSuccess, setBillingSuccess] = useState("");
  const [chargeForm, setChargeForm] = useState({
    category: "Bed Charges",
    description: "",
    quantity: "1",
    unitPrice: "",
    createdBy: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMode: "Cash",
    remarks: "",
    receivedBy: "",
  });


  useEffect(() => {
    if (!selectedAdmission || medicationOrders.length === 0) return;
    const generatedTreatment = buildTreatmentGivenFromOrders(medicationOrders);
    if (!generatedTreatment) return;

    setDischargeSummaryForm((current) => {
      if (current.treatmentGiven.trim()) return current;
      return { ...current, treatmentGiven: generatedTreatment };
    });
  }, [selectedAdmission?.id, medicationOrders]);

  async function loadBilling(admissionId: number) {
    try {
      setLoadingBilling(true);
      setBillingError("");

      const response = await fetch(
        `/api/ipd/admissions/${admissionId}/billing`,
        { cache: "no-store" }
      );

      const data = await readApiResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load billing details."
        );
      }

      setCharges(data.charges || []);
      setPayments(data.payments || []);
      setBillingSummary(
        data.summary || {
          totalCharges: 0,
          totalPayments: 0,
          balance: 0,
        }
      );
    } catch (error) {
      console.error("LOAD IPD BILLING ERROR:", error);
      setBillingError(
        error instanceof Error
          ? error.message
          : "Unable to load billing details."
      );
    } finally {
      setLoadingBilling(false);
    }
  }

  async function handleChargeSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!selectedAdmission) return;

    const quantity = Number(chargeForm.quantity);
    const unitPrice = Number(chargeForm.unitPrice);

    if (
      !chargeForm.category.trim() ||
      !chargeForm.description.trim() ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      setBillingError(
        "Enter a category, description, valid quantity and unit price."
      );
      return;
    }

    try {
      setSavingCharge(true);
      setBillingError("");
      setBillingSuccess("");

      const response = await fetch(
        `/api/ipd/admissions/${selectedAdmission.id}/billing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: chargeForm.category.trim(),
            description: chargeForm.description.trim(),
            quantity,
            unitPrice,
            createdBy: chargeForm.createdBy.trim() || null,
          }),
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to add IPD charge."
        );
      }

      setChargeForm({
        category: "Bed Charges",
        description: "",
        quantity: "1",
        unitPrice: "",
        createdBy: "",
      });
      setBillingSuccess("IPD charge added successfully.");
      await loadBilling(selectedAdmission.id);
    } catch (error) {
      console.error("ADD IPD CHARGE ERROR:", error);
      setBillingError(
        error instanceof Error
          ? error.message
          : "Unable to add IPD charge."
      );
    } finally {
      setSavingCharge(false);
    }
  }

  async function handlePaymentSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!selectedAdmission) return;

    const amount = Number(paymentForm.amount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !paymentForm.paymentMode.trim()
    ) {
      setBillingError(
        "Enter a valid payment amount and payment mode."
      );
      return;
    }

    try {
      setSavingPayment(true);
      setBillingError("");
      setBillingSuccess("");

      const response = await fetch(
        `/api/ipd/admissions/${selectedAdmission.id}/payments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            paymentMode: paymentForm.paymentMode.trim(),
            remarks: paymentForm.remarks.trim() || null,
            receivedBy: paymentForm.receivedBy.trim() || null,
          }),
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to receive payment."
        );
      }

      setPaymentForm({
        amount: "",
        paymentMode: "Cash",
        remarks: "",
        receivedBy: "",
      });
      setBillingSuccess(
        data.payment?.receiptNo
          ? `Payment received successfully. Receipt: ${data.payment.receiptNo}`
          : "Payment received successfully."
      );
      await loadBilling(selectedAdmission.id);
    } catch (error) {
      console.error("IPD PAYMENT ERROR:", error);
      setBillingError(
        error instanceof Error
          ? error.message
          : "Unable to receive payment."
      );
    } finally {
      setSavingPayment(false);
    }
  }

  async function loadBeds() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/ipd/setup",
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to load IPD beds."
        );
      }

      setWards(
        data.wards || []
      );
    } catch (error) {
      console.error(
        "IPD DASHBOARD ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load IPD dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAdmissions() {
    try {
      setLoadingAdmissions(true);
      setAdmissionError("");

      const response = await fetch(
        "/api/ipd/admissions",
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to load IPD admissions."
        );
      }

      setAdmissions(
        data.admissions || []
      );
    } catch (error) {
      console.error(
        "LOAD IPD ADMISSIONS ERROR:",
        error
      );

      setAdmissionError(
        error instanceof Error
          ? error.message
          : "Unable to load IPD admissions."
      );
    } finally {
      setLoadingAdmissions(false);
    }
  }

  async function loadVitals(admissionId: number) {
    try {
      setLoadingVitals(true);
      setVitalsError("");

      const response = await fetch(
        `/api/ipd/admissions/${admissionId}/vitals`,
        { cache: "no-store" }
      );

      const data = await readApiResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load vitals."
        );
      }

      setVitals(data.vitals || []);
    } catch (error) {
      console.error("LOAD IPD VITALS ERROR:", error);
      setVitalsError(
        error instanceof Error
          ? error.message
          : "Unable to load vitals."
      );
    } finally {
      setLoadingVitals(false);
    }
  }

  async function handleVitalSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!selectedAdmission) return;

    try {
      setSavingVital(true);
      setVitalsError("");

      const numberOrNull = (value: string) =>
        value.trim() === "" ? null : Number(value);

      const response = await fetch(
        `/api/ipd/admissions/${selectedAdmission.id}/vitals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bp: vitalForm.bp.trim() || null,
            pulse: numberOrNull(vitalForm.pulse),
            respiratoryRate: numberOrNull(
              vitalForm.respiratoryRate
            ),
            temperature: numberOrNull(
              vitalForm.temperature
            ),
            spo2: numberOrNull(vitalForm.spo2),
            weight: numberOrNull(vitalForm.weight),
            randomBloodSugar: numberOrNull(
              vitalForm.randomBloodSugar
            ),
            painScore: numberOrNull(
              vitalForm.painScore
            ),
            remarks: vitalForm.remarks.trim() || null,
            recordedBy:
              vitalForm.recordedBy.trim() || null,
          }),
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save vital signs."
        );
      }

      setVitalForm({
        bp: "",
        pulse: "",
        respiratoryRate: "",
        temperature: "",
        spo2: "",
        weight: "",
        randomBloodSugar: "",
        painScore: "",
        remarks: "",
        recordedBy: "",
      });

      await loadVitals(selectedAdmission.id);
    } catch (error) {
      console.error("SAVE IPD VITAL ERROR:", error);
      setVitalsError(
        error instanceof Error
          ? error.message
          : "Unable to save vital signs."
      );
    } finally {
      setSavingVital(false);
    }
  }

  async function loadMedicationOrders(
    admissionId: number
  ) {
    try {
      setLoadingMedicationOrders(true);
      setMedicationError("");

      const response = await fetch(
        `/api/ipd/admissions/${admissionId}/medication-orders`,
        { cache: "no-store" }
      );

      const data = await readApiResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to load medication orders."
        );
      }

      setMedicationOrders(
        data.medicationOrders || []
      );
    } catch (error) {
      console.error(
        "LOAD IPD MEDICATION ORDERS ERROR:",
        error
      );
      setMedicationError(
        error instanceof Error
          ? error.message
          : "Unable to load medication orders."
      );
    } finally {
      setLoadingMedicationOrders(false);
    }
  }

  async function handleMedicationSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!selectedAdmission) return;

    if (!medicationForm.medicineName.trim()) {
      setMedicationError(
        "Medicine name is required."
      );
      return;
    }

    try {
      setSavingMedicationOrder(true);
      setMedicationError("");

      const response = await fetch(
        `/api/ipd/admissions/${selectedAdmission.id}/medication-orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            medicineName:
              medicationForm.medicineName.trim(),
            strength:
              medicationForm.strength.trim(),
            dosage:
              medicationForm.dosage.trim(),
            frequency:
              medicationForm.frequency.trim(),
            route:
              medicationForm.route.trim(),
            duration:
              medicationForm.duration.trim(),
            instruction:
              medicationForm.instruction.trim(),
            orderedBy:
              medicationForm.orderedBy.trim(),
          }),
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to save medication order."
        );
      }

      setMedicationForm({
        medicineName: "",
        strength: "",
        dosage: "",
        frequency: "",
        route: "",
        duration: "",
        instruction: "",
        orderedBy: "",
      });

      await loadMedicationOrders(
        selectedAdmission.id
      );
    } catch (error) {
      console.error(
        "SAVE IPD MEDICATION ORDER ERROR:",
        error
      );
      setMedicationError(
        error instanceof Error
          ? error.message
          : "Unable to save medication order."
      );
    } finally {
      setSavingMedicationOrder(false);
    }
  }

  async function loadInvestigations(admissionId: number) {
    try {
      setLoadingInvestigations(true); setInvestigationError("");
      const response = await fetch(`/api/ipd/admissions/${admissionId}/investigations`, { cache: "no-store" });
      const data = await readApiResponse(response);
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to load investigations.");
      setInvestigations(data.investigations || []);
    } catch (error) {
      setInvestigationError(error instanceof Error ? error.message : "Unable to load investigations.");
    } finally { setLoadingInvestigations(false); }
  }

  async function handleInvestigationSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedAdmission) return;
    if (!investigationForm.testName.trim()) { setInvestigationError("Test name is required."); return; }
    try {
      setSavingInvestigation(true); setInvestigationError("");
      const response = await fetch(`/api/ipd/admissions/${selectedAdmission.id}/investigations`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testName: investigationForm.testName.trim(),
          testCode: investigationForm.testCode.trim(),
          category: investigationForm.category.trim(),
          orderedBy: investigationForm.orderedBy.trim(),
        }),
      });
      const data = await readApiResponse(response);
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to add investigation.");
      setInvestigationForm({ testName: "", testCode: "", category: "", orderedBy: "" });
      await loadInvestigations(selectedAdmission.id);
    } catch (error) {
      setInvestigationError(error instanceof Error ? error.message : "Unable to add investigation.");
    } finally { setSavingInvestigation(false); }
  }

  async function loadDischargeSummary(admissionId: number) {
    try {
      setLoadingDischargeSummary(true); setDischargeSummaryError("");
      const response = await fetch(`/api/ipd/admissions/${admissionId}/discharge-summary`, { cache: "no-store" });
      const data = await readApiResponse(response);
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to load discharge summary.");
      const summary = data.dischargeSummary || data.summary || null;
      const parsedAdvice = splitDischargeAdvice(summary?.dischargeAdvice);
      setDischargeSummary(summary);
      setDischargeSummaryForm({
        finalDiagnosis: summary?.finalDiagnosis || "", history: summary?.history || "",
        examination: summary?.examination || "", hospitalCourse: summary?.hospitalCourse || "",
        investigations: summary?.investigations || "", treatmentGiven: summary?.treatmentGiven || "",
        procedures: summary?.procedures || "", conditionAtDischarge: summary?.conditionAtDischarge || "",
        dischargeAdvice: parsedAdvice.advice, followUpAdvice: summary?.followUpAdvice || "",
        dischargedBy: summary?.dischargedBy || "",
      });
      setDischargeMedicineText(parsedAdvice.medicines);
    } catch (error) {
      setDischargeSummaryError(error instanceof Error ? error.message : "Unable to load discharge summary.");
    } finally { setLoadingDischargeSummary(false); }
  }

  async function handleDischargeSummarySubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedAdmission) return;
    try {
      setSavingDischargeSummary(true); setDischargeSummaryError("");
      const response = await fetch(`/api/ipd/admissions/${selectedAdmission.id}/discharge-summary`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dischargeSummaryForm,
          dischargeAdvice: buildDischargeAdvice(
            dischargeSummaryForm.dischargeAdvice,
            dischargeMedicineText
          ),
        }),
      });
      const data = await readApiResponse(response);
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to save discharge summary.");
      await loadDischargeSummary(selectedAdmission.id);
      setSuccessMessage("Discharge summary saved successfully.");
    } catch (error) {
      setDischargeSummaryError(error instanceof Error ? error.message : "Unable to save discharge summary.");
    } finally { setSavingDischargeSummary(false); }
  }

  function printFinalBill() {
    if (!selectedAdmission) return;

    const patientName = `${selectedAdmission.patient.firstName} ${
      selectedAdmission.patient.lastName || ""
    }`.trim();

    const escapeHtml = (value: string | number | null | undefined) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const billStatus =
      billingSummary.balance <= 0.009
        ? "PAID / CLEARED"
        : billingSummary.totalPayments > 0
          ? "PARTIALLY PAID"
          : "DUE";

    const chargeRows = charges
      .map(
        (charge) =>
          `<tr><td>${escapeHtml(charge.category)}</td><td>${escapeHtml(charge.description)}</td><td>${charge.quantity}</td><td>₹${charge.unitPrice.toFixed(2)}</td><td>₹${charge.total.toFixed(2)}</td></tr>`
      )
      .join("");

    const paymentRows = payments
      .map(
        (payment) =>
          `<tr><td>${escapeHtml(payment.receiptNo)}</td><td>${escapeHtml(payment.paymentMode)}</td><td>₹${payment.amount.toFixed(2)}</td><td>${escapeHtml(formatDateTime(payment.paidAt))}</td></tr>`
      )
      .join("");

    const popup = window.open("", "_blank", "width=900,height=700");

    if (!popup) {
      setBillingError(
        "Unable to open print window. Please allow pop-ups and try again."
      );
      return;
    }

    popup.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>IPD Final Bill - ${escapeHtml(selectedAdmission.ipdNo)}</title>
<style>
body { font-family: Arial, sans-serif; color: #111; margin: 28px; }
h1,h2,h3,p { margin: 0; }
.header { border-bottom: 2px solid #111; padding-bottom: 14px; margin-bottom: 18px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; margin: 16px 0; }
.summary { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin: 18px 0; }
.box { border: 1px solid #bbb; padding: 12px; border-radius: 6px; }
table { width: 100%; border-collapse: collapse; margin: 12px 0 22px; }
th,td { border: 1px solid #bbb; padding: 8px; text-align: left; font-size: 13px; }
th { background: #f3f3f3; }
.right { text-align: right; }
.status { font-weight: 700; font-size: 18px; }
.footer { margin-top: 35px; border-top: 1px solid #bbb; padding-top: 12px; font-size: 12px; color: #555; }
@media print { body { margin: 15px; } .no-print { display:none; } }
</style>
</head>
<body>
<div class="header">
<h1>Atulyam Hospital</h1>
<p>Nagra Road, Near Garwar Police Station, Ballia, UP</p>
<p>Phone: 9162981453</p>
<h2 style="margin-top:12px;">IPD FINAL BILL</h2>
</div>
<div class="grid">
<div><strong>Patient:</strong> ${escapeHtml(patientName)}</div>
<div><strong>IPD No:</strong> ${escapeHtml(selectedAdmission.ipdNo)}</div>
<div><strong>Patient ID:</strong> ${escapeHtml(selectedAdmission.patient.patientId)}</div>
<div><strong>Mobile:</strong> ${escapeHtml(selectedAdmission.patient.mobile)}</div>
<div><strong>Ward / Bed:</strong> ${escapeHtml(selectedAdmission.bed.ward.name)} / ${escapeHtml(selectedAdmission.bed.bedNumber)}</div>
<div><strong>Admission Date:</strong> ${escapeHtml(formatDateTime(selectedAdmission.admissionDate))}</div>
</div>
<div class="summary">
<div class="box"><strong>Total Charges</strong><br>₹${billingSummary.totalCharges.toFixed(2)}</div>
<div class="box"><strong>Total Payments</strong><br>₹${billingSummary.totalPayments.toFixed(2)}</div>
<div class="box"><strong>${billingSummary.balance > 0.009 ? "Balance Due" : "Advance / Credit"}</strong><br>₹${Math.abs(billingSummary.balance).toFixed(2)}</div>
</div>
<p class="status">Bill Status: ${billStatus}</p>
<h3 style="margin-top:22px;">Charge Details</h3>
<table><thead><tr><th>Category</th><th>Description</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead><tbody>${chargeRows || '<tr><td colspan="5">No charges recorded.</td></tr>'}</tbody></table>
<h3>Payment Details</h3>
<table><thead><tr><th>Receipt No.</th><th>Mode</th><th>Amount</th><th>Date</th></tr></thead><tbody>${paymentRows || '<tr><td colspan="4">No payments recorded.</td></tr>'}</tbody></table>
<div class="footer">Generated from Atulyam Hospital IPD Management System on ${escapeHtml(formatDateTime(new Date().toISOString()))}</div>
<div class="no-print" style="margin-top:20px;"><button onclick="window.print()">Print Bill</button></div>
</body>
</html>`);

    popup.document.close();
    popup.focus();
  }

  function printDischargeSummary() {
    if (!selectedAdmission) return;

    const summary = {
      ...(dischargeSummary || dischargeSummaryForm),
      dischargeAdvice: dischargeSummary
        ? dischargeSummary.dischargeAdvice
        : buildDischargeAdvice(
            dischargeSummaryForm.dischargeAdvice,
            dischargeMedicineText
          ),
    } as typeof dischargeSummaryForm & { dischargeDate?: string };
    const patientName = `${selectedAdmission.patient.firstName} ${selectedAdmission.patient.lastName || ""}`.trim();
    const escapeHtml = (value: string | number | null | undefined) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
    const toHtml = (value: string | null | undefined) =>
      escapeHtml(value || "Not documented").replace(/\n/g, "<br />");

    const popup = window.open("", "_blank", "width=900,height=900");
    if (!popup) {
      setDischargeSummaryError("Unable to open print window. Please allow pop-ups and try again.");
      return;
    }

    popup.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<title>Discharge Summary - ${escapeHtml(selectedAdmission.ipdNo)}</title>
<style>
@page { size: A4; margin: 12mm; }
body { font-family: Arial, sans-serif; color:#111; margin:0; font-size:12px; line-height:1.45; }
h1,h2,h3,p { margin:0; }
.header { text-align:center; border-bottom:2px solid #111; padding-bottom:10px; margin-bottom:14px; }
.header h1 { font-size:24px; } .header p { font-size:11px; }
.title { text-align:center; font-size:18px; font-weight:700; margin:12px 0; letter-spacing:.5px; }
.patient { width:100%; border-collapse:collapse; margin-bottom:14px; }
.patient td { border:1px solid #999; padding:6px 8px; width:25%; }
.patient strong { display:inline-block; min-width:75px; }
.section { border:1px solid #999; margin-top:9px; page-break-inside:avoid; }
.section h3 { background:#f1f1f1; border-bottom:1px solid #999; padding:6px 8px; font-size:13px; }
.section .content { padding:8px; min-height:18px; white-space:normal; }
.signatures { display:grid; grid-template-columns:1fr 1fr; gap:50px; margin-top:42px; }
.signature { border-top:1px solid #333; padding-top:5px; text-align:center; font-weight:600; }
.footer { margin-top:20px; padding-top:8px; border-top:1px solid #999; font-size:10px; color:#555; text-align:center; }
.no-print { margin-top:18px; text-align:center; } button { padding:8px 18px; font-weight:600; }
@media print { .no-print { display:none; } }
</style></head><body>
<div class="header"><h1>Atulyam Hospital</h1><p>Nagra Road, Near Garwar Police Station, Ballia, UP</p><p>Phone: 9162981453</p></div>
<div class="title">IPD DISCHARGE SUMMARY</div>
<table class="patient"><tr><td><strong>Patient:</strong> ${escapeHtml(patientName)}</td><td><strong>IPD No:</strong> ${escapeHtml(selectedAdmission.ipdNo)}</td></tr><tr><td><strong>Age/Sex:</strong> ${escapeHtml(selectedAdmission.patient.age)} / ${escapeHtml(selectedAdmission.patient.gender)}</td><td><strong>Patient ID:</strong> ${escapeHtml(selectedAdmission.patient.patientId)}</td></tr><tr><td><strong>Department:</strong> ${escapeHtml(selectedAdmission.department)}</td><td><strong>Doctor:</strong> ${escapeHtml(selectedAdmission.admittingDoctor)}</td></tr><tr><td><strong>Admission:</strong> ${escapeHtml(formatDateTime(selectedAdmission.admissionDate))}</td><td><strong>Discharge:</strong> ${escapeHtml(formatDateTime(selectedAdmission.dischargeDate || summary.dischargeDate || new Date().toISOString()))}</td></tr></table>
${[["Final Diagnosis", summary.finalDiagnosis],["History", summary.history],["Examination", summary.examination],["Hospital Course", summary.hospitalCourse],["Investigations", summary.investigations],["Treatment Given", summary.treatmentGiven],["Procedures", summary.procedures],["Condition at Discharge", summary.conditionAtDischarge],["Discharge Advice", summary.dischargeAdvice],["Follow-up Advice", summary.followUpAdvice]].map(([title,value]) => `<div class="section"><h3>${title}</h3><div class="content">${toHtml(String(value ?? ""))}</div></div>`).join("")}
<div class="signatures"><div class="signature">Patient / Attendant Signature</div><div class="signature">${escapeHtml(summary.dischargedBy || selectedAdmission.admittingDoctor || "Authorized Doctor")}<br/>Doctor / Authorized Signatory</div></div>
<div class="footer">Generated from Atulyam Hospital IPD Management System on ${escapeHtml(formatDateTime(new Date().toISOString()))}</div>
<div class="no-print"><button onclick="window.print()">Print Discharge Summary</button></div>
</body></html>`);
    popup.document.close();
    popup.focus();
  }

  async function loadPatients() {
    try {
      setLoadingPatients(true);

      const response =
        await fetch(
          "/api/patients?status=active",
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to load patients."
        );
      }

      setPatients(
        data.patients || []
      );
    } catch (error) {
      console.error(
        "LOAD PATIENTS ERROR:",
        error
      );

      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to load patients."
      );
    } finally {
      setLoadingPatients(false);
    }
  }

  useEffect(() => {
    loadBeds();
    loadAdmissions();
  }, []);

  const allBeds =
    wards.flatMap(
      (ward) => ward.beds
    );

  const totalBeds =
    allBeds.length;

  const availableBeds =
    allBeds.filter(
      (bed) =>
        bed.status ===
          "Available" &&
        bed.isActive
    ).length;

  const occupiedBeds =
    allBeds.filter(
      (bed) =>
        bed.status ===
          "Occupied"
    ).length;

  const activeAdmissions =
    admissions.filter(
      (admission) =>
        admission.status !==
        "Discharged"
    );

  const dischargedAdmissions =
    admissions.filter(
      (admission) =>
        admission.status ===
        "Discharged"
    );

  const selectedWard =
    wards.find(
      (ward) =>
        String(ward.id) ===
        selectedWardId
    );

  const availableBedsForWard =
    selectedWard?.beds.filter(
      (bed) =>
        bed.status ===
          "Available" &&
        bed.isActive
    ) || [];

  const filteredPatients =
    useMemo(() => {
      const search =
        patientSearch
          .trim()
          .toLowerCase();

      if (!search) {
        return patients.slice(
          0,
          20
        );
      }

      return patients
        .filter((patient) => {
          const fullName =
            `${patient.firstName} ${
              patient.lastName || ""
            }`.toLowerCase();

          return (
            fullName.includes(
              search
            ) ||
            patient.patientId
              .toLowerCase()
              .includes(search) ||
            patient.mobile.includes(
              search
            )
          );
        })
        .slice(0, 20);
    }, [
      patients,
      patientSearch,
    ]);

  function resetAdmissionForm() {
    setPatientMode("existing");

    setPatients([]);

    setPatientSearch("");

    setSelectedPatient(null);

    setNewPatient(
      initialNewPatient
    );

    setSelectedWardId("");

    setSelectedBedId("");

    setAdmittingDoctor("");

    setDepartment("");

    setChiefComplaint("");

    setProvisionalDiagnosis("");

    setAdmissionNotes("");

    setFormError("");
  }

  async function openAdmissionForm() {
    resetAdmissionForm();

    setSuccessMessage("");

    setShowAdmissionForm(true);

    await loadPatients();
  }

  function closeAdmissionForm() {
    if (submitting) {
      return;
    }

    setShowAdmissionForm(false);

    resetAdmissionForm();
  }

  async function handleAdmission(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setSubmitting(true);

      setFormError("");

      setSuccessMessage("");

      if (
        patientMode ===
          "existing" &&
        !selectedPatient
      ) {
        throw new Error(
          "Please select a patient."
        );
      }

      if (!selectedWardId) {
        throw new Error(
          "Please select a ward."
        );
      }

      if (!selectedBedId) {
        throw new Error(
          "Please select a bed."
        );
      }

      if (
        !admittingDoctor.trim()
      ) {
        throw new Error(
          "Please enter admitting doctor."
        );
      }

      if (
        !department.trim()
      ) {
        throw new Error(
          "Please enter department."
        );
      }

      let payload: Record<
        string,
        unknown
      > = {
        bedId:
          Number(selectedBedId),

        admittingDoctor:
          admittingDoctor.trim(),

        department:
          department.trim(),

        chiefComplaint:
          chiefComplaint.trim(),

        provisionalDiagnosis:
          provisionalDiagnosis.trim(),

        admissionNotes:
          admissionNotes.trim(),
      };

      if (
        patientMode ===
        "existing"
      ) {
        payload = {
          ...payload,

          patientId:
            selectedPatient?.id,
        };
      } else {
        if (
          !newPatient.firstName.trim()
        ) {
          throw new Error(
            "Patient first name is required."
          );
        }

        if (!newPatient.age) {
          throw new Error(
            "Patient age is required."
          );
        }

        if (
          !newPatient.gender
        ) {
          throw new Error(
            "Please select patient gender."
          );
        }

        if (
          !newPatient.mobile.trim()
        ) {
          throw new Error(
            "Patient mobile number is required."
          );
        }

        payload = {
          ...payload,

          firstName:
            newPatient.firstName.trim(),

          lastName:
            newPatient.lastName.trim(),

          age:
            Number(
              newPatient.age
            ),

          gender:
            newPatient.gender,

          mobile:
            newPatient.mobile.trim(),

          address:
            newPatient.address.trim(),

          bloodGroup:
            newPatient.bloodGroup,

          aadhaar:
            newPatient.aadhaar.trim(),

          occupation:
            newPatient.occupation.trim(),
        };
      }

      const response =
        await fetch(
          "/api/ipd/admissions",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to admit patient."
        );
      }

      const patientName =
        `${data.admission.patient.firstName} ${
          data.admission.patient
            .lastName || ""
        }`.trim();

      setSuccessMessage(
        `${patientName} admitted successfully. IPD No: ${data.admission.ipdNo}`
      );

      setShowAdmissionForm(
        false
      );

      resetAdmissionForm();

      await Promise.all([
        loadBeds(),
        loadAdmissions(),
      ]);
    } catch (error) {
      console.error(
        "IPD ADMISSION ERROR:",
        error
      );

      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to admit patient."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDischarge(
    admission: Admission
  ) {
    const patientName =
      `${admission.patient.firstName} ${
        admission.patient.lastName ||
        ""
      }`.trim();

    try {
      setDischargingId(admission.id);
      setAdmissionError("");

      // Always check the latest billing position before discharge.
      const billingResponse = await fetch(
        `/api/ipd/admissions/${admission.id}/billing`,
        { cache: "no-store" }
      );
      const billingData = await billingResponse.json();

      if (
        !billingResponse.ok ||
        !billingData.success
      ) {
        throw new Error(
          billingData.message ||
            "Unable to verify billing clearance."
        );
      }

      const latestSummary = {
        totalCharges: Number(
          billingData.summary?.totalCharges || 0
        ),
        totalPayments: Number(
          billingData.summary?.totalPayments || 0
        ),
        balance: Number(
          billingData.summary?.balance || 0
        ),
      };

      setCharges(billingData.charges || []);
      setPayments(billingData.payments || []);
      setBillingSummary(latestSummary);

      let confirmationMessage =
        `Discharge clearance for ${patientName}\n\n` +
        `IPD No: ${admission.ipdNo}\n` +
        `Bed: ${admission.bed.bedNumber}\n\n` +
        `Total Charges: ₹${latestSummary.totalCharges.toFixed(2)}\n` +
        `Total Payments: ₹${latestSummary.totalPayments.toFixed(2)}\n`;

      if (latestSummary.balance > 0.009) {
        const continueWithDue = window.confirm(
          confirmationMessage +
            `Outstanding Balance: ₹${latestSummary.balance.toFixed(2)}\n\n` +
            `WARNING: Payment is still pending.\n\n` +
            `Click OK only if you want to discharge the patient with this balance due.`
        );

        if (!continueWithDue) {
          return;
        }

        const finalConfirmation = window.confirm(
          `Final confirmation: discharge ${patientName} with ₹${latestSummary.balance.toFixed(2)} still due?\n\n` +
            `The bed will become available again.`
        );

        if (!finalConfirmation) {
          return;
        }
      } else {
        const confirmed = window.confirm(
          confirmationMessage +
            `Balance Status: PAID / CLEARED\n\n` +
            `The bed will become available again. Continue with discharge?`
        );

        if (!confirmed) {
          return;
        }
      }

      const response =
        await fetch(
          `/api/ipd/admissions/${admission.id}/discharge`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({}),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to discharge patient."
        );
      }

      setSelectedAdmission(null);

      setSuccessMessage(
        latestSummary.balance > 0.009
          ? `${patientName} discharged successfully with ₹${latestSummary.balance.toFixed(2)} pending. Bed ${admission.bed.bedNumber} is now available.`
          : `${patientName} discharged successfully after billing clearance. Bed ${admission.bed.bedNumber} is now available.`
      );

      await Promise.all([
        loadBeds(),
        loadAdmissions(),
      ]);
    } catch (error) {
      console.error(
        "IPD DISCHARGE ERROR:",
        error
      );

      setAdmissionError(
        error instanceof Error
          ? error.message
          : "Unable to discharge patient."
      );
    } finally {
      setDischargingId(null);
    }
  }

  async function loadClinicalNotes(
    admissionId: number
  ) {
    try {
      setLoadingClinicalNotes(true);
      setClinicalNotesError("");

      const response = await fetch(
        `/api/ipd/admissions/${admissionId}/clinical-notes`,
        {
          cache: "no-store",
        }
      );

      const data = await readApiResponse(response);

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to load clinical notes."
        );
      }

      setClinicalNotes(
        data.notes || []
      );
    } catch (error) {
      console.error(
        "LOAD CLINICAL NOTES ERROR:",
        error
      );

      setClinicalNotesError(
        error instanceof Error
          ? error.message
          : "Unable to load clinical notes."
      );
    } finally {
      setLoadingClinicalNotes(false);
    }
  }

  async function openAdmissionDetails(
    admission: Admission
  ) {
    setSelectedAdmission(admission);
    setClinicalNotes([]);
    setClinicalNotesError("");
    setClinicalNoteType("Progress");
    setClinicalNoteText("");
    setClinicalNoteCreatedBy("");
    setCharges([]);
    setPayments([]);
    setBillingSummary({
      totalCharges: 0,
      totalPayments: 0,
      balance: 0,
    });
    setBillingError("");
    setBillingSuccess("");

    await Promise.all([
      loadClinicalNotes(admission.id),
      loadVitals(admission.id),
      loadMedicationOrders(admission.id),
      loadInvestigations(admission.id),
      loadDischargeSummary(admission.id),
      loadBilling(admission.id),
    ]);
  }

  async function handleClinicalNote(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!selectedAdmission) {
      return;
    }

    if (!clinicalNoteText.trim()) {
      setClinicalNotesError(
        "Please enter the clinical note."
      );
      return;
    }

    try {
      setSavingClinicalNote(true);
      setClinicalNotesError("");

      const response = await fetch(
        `/api/ipd/admissions/${selectedAdmission.id}/clinical-notes`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            noteType:
              clinicalNoteType,
            note:
              clinicalNoteText.trim(),
            createdBy:
              clinicalNoteCreatedBy.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to save clinical note."
        );
      }

      setClinicalNoteText("");

      setClinicalNotes(
        (currentNotes) => [
          data.note,
          ...currentNotes,
        ]
      );
    } catch (error) {
      console.error(
        "SAVE CLINICAL NOTE ERROR:",
        error
      );

      setClinicalNotesError(
        error instanceof Error
          ? error.message
          : "Unable to save clinical note."
      );
    } finally {
      setSavingClinicalNote(false);
    }
  }

  function formatDateTime(
    value: string | null | undefined
  ) {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold">
            IPD Dashboard
          </h1>

          <p className="mt-4 text-gray-500">
            Loading IPD dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              IPD Dashboard
            </h1>

            <p className="mt-1 text-gray-500">
              In-Patient Department
              Management
            </p>
          </div>

          <button
            type="button"
            onClick={
              openAdmissionForm
            }
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow hover:bg-blue-700"
          >
            + New Admission
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 flex flex-col gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {successMessage}
            </span>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage("")
              }
              className="font-semibold underline"
            >
              Close
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}

            <button
              type="button"
              onClick={loadBeds}
              className="ml-4 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {admissionError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {admissionError}

            <button
              type="button"
              onClick={loadAdmissions}
              className="ml-4 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Beds
            </p>

            <p className="mt-2 text-4xl font-bold text-gray-900">
              {totalBeds}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Available Beds
            </p>

            <p className="mt-2 text-4xl font-bold text-green-600">
              {availableBeds}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Occupied Beds
            </p>

            <p className="mt-2 text-4xl font-bold text-red-600">
              {occupiedBeds}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Current Admissions
            </p>

            <p className="mt-2 text-4xl font-bold text-blue-600">
              {activeAdmissions.length}
            </p>
          </div>

        </div>

        <section className="mb-8 rounded-xl bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Current Admitted Patients
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Active patients currently
                admitted in the hospital.
              </p>
            </div>

            <button
              type="button"
              onClick={loadAdmissions}
              disabled={
                loadingAdmissions
              }
              className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {loadingAdmissions
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>

          {loadingAdmissions ? (
            <div className="p-8 text-center text-gray-500">
              Loading admitted patients...
            </div>
          ) : activeAdmissions.length ===
            0 ? (
            <div className="p-8 text-center">
              <p className="text-lg font-semibold text-gray-700">
                No patients are currently admitted.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Use New Admission to admit
                a patient.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-5 py-3 text-sm font-semibold text-gray-600">
                      Patient
                    </th>

                    <th className="px-5 py-3 text-sm font-semibold text-gray-600">
                      IPD No.
                    </th>

                    <th className="px-5 py-3 text-sm font-semibold text-gray-600">
                      Ward / Bed
                    </th>

                    <th className="px-5 py-3 text-sm font-semibold text-gray-600">
                      Doctor
                    </th>

                    <th className="px-5 py-3 text-sm font-semibold text-gray-600">
                      Admission
                    </th>

                    <th className="px-5 py-3 text-sm font-semibold text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {activeAdmissions.map(
                    (admission) => {
                      const patientName =
                        `${admission.patient.firstName} ${
                          admission.patient
                            .lastName || ""
                        }`.trim();

                      return (
                        <tr
                          key={
                            admission.id
                          }
                          className="border-t"
                        >
                          <td className="px-5 py-4">
                            <div className="font-semibold text-gray-900">
                              {patientName}
                            </div>

                            <div className="mt-1 text-sm text-gray-500">
                              UHID:{" "}
                              {
                                admission.patient
                                  .patientId
                              }

                              {" · "}

                              {
                                admission.patient
                                  .age
                              }
                              {" Years · "}

                              {
                                admission.patient
                                  .gender
                              }
                            </div>
                          </td>

                          <td className="px-5 py-4 font-semibold text-blue-700">
                            {
                              admission.ipdNo
                            }
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-medium text-gray-900">
                              {
                                admission.bed
                                  .ward.name
                              }
                            </div>

                            <div className="mt-1 text-sm text-gray-500">
                              Bed:{" "}
                              {
                                admission.bed
                                  .bedNumber
                              }
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-medium text-gray-900">
                              {
                                admission
                                  .admittingDoctor
                              }
                            </div>

                            <div className="mt-1 text-sm text-gray-500">
                              {
                                admission
                                  .department
                              }
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-600">
                            {
                              formatDateTime(
                                admission
                                  .admissionDate
                              )
                            }
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openAdmissionDetails(
                                    admission
                                  )
                                }
                                className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                              >
                                Details
                              </button>

                              <button
                                type="button"
                                disabled={
                                  dischargingId ===
                                  admission.id
                                }
                                onClick={() =>
                                  handleDischarge(
                                    admission
                                  )
                                }
                                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {dischargingId ===
                                admission.id
                                  ? "Discharging..."
                                  : "Discharge"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {wards.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-700">
              No wards found.
            </p>

            <p className="mt-2 text-gray-500">
              Please configure ICU and
              General Ward beds first.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {wards.map(
              (ward) => {
                const wardAvailable =
                  ward.beds.filter(
                    (bed) =>
                      bed.status ===
                      "Available"
                  ).length;

                const wardOccupied =
                  ward.beds.filter(
                    (bed) =>
                      bed.status ===
                      "Occupied"
                  ).length;

                return (
                  <section
                    key={ward.id}
                    className="rounded-xl bg-white p-5 shadow-sm"
                  >
                    <div className="mb-5 flex flex-col gap-2 border-b pb-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {ward.name}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {
                            ward.beds
                              .length
                          }
                          {" Beds · "}
                          {
                            wardAvailable
                          }
                          {" Available · "}
                          {
                            wardOccupied
                          }
                          {" Occupied"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {ward.beds.map(
                        (bed) => {
                          const isAvailable =
                            bed.status ===
                            "Available";

                          const isOccupied =
                            bed.status ===
                            "Occupied";

                          return (
                            <div
                              key={
                                bed.id
                              }
                              className={`rounded-xl border-2 p-5 text-center shadow-sm ${
                                isAvailable
                                  ? "border-green-300 bg-green-50"
                                  : isOccupied
                                    ? "border-red-300 bg-red-50"
                                    : "border-gray-300 bg-gray-50"
                              }`}
                            >
                              <div className="text-xl font-bold text-gray-900">
                                {
                                  bed.bedNumber
                                }
                              </div>

                              <div
                                className={`mt-3 rounded-full px-3 py-1 text-sm font-semibold ${
                                  isAvailable
                                    ? "bg-green-200 text-green-800"
                                    : isOccupied
                                      ? "bg-red-200 text-red-800"
                                      : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                {
                                  bed.status
                                }
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </section>
                );
              }
            )}
          </div>
        )}

        {dischargedAdmissions.length >
          0 && (
          <section className="mt-8 rounded-xl bg-white shadow-sm">

            <div className="border-b p-5">
              <h2 className="text-xl font-bold text-gray-900">
                Recently Discharged
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {dischargedAdmissions.length}
                {" discharged patient(s)"}
              </p>
            </div>

            <div className="divide-y">
              {dischargedAdmissions
                .slice(0, 10)
                .map(
                  (admission) => (
                    <div
                      key={
                        admission.id
                      }
                      className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {
                            admission.patient
                              .firstName
                          }{" "}
                          {
                            admission.patient
                              .lastName ||
                              ""
                          }
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {
                            admission.ipdNo
                          }
                          {" · "}
                          {
                            admission.bed
                              .ward.name
                          }
                          {" · Bed "}
                          {
                            admission.bed
                              .bedNumber
                          }
                        </p>
                      </div>

                      <div className="text-sm text-gray-500">
                        Discharged:{" "}
                        {
                          formatDateTime(
                            admission
                              .dischargeDate
                          )
                        }
                      </div>
                    </div>
                  )
                )}
            </div>
          </section>
        )}

      </div>

      {showAdmissionForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <div className="mx-auto my-8 max-w-4xl rounded-xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  New IPD Admission
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Select an existing patient
                  or create a new patient
                  directly.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeAdmissionForm
                }
                disabled={
                  submitting
                }
                className="rounded-lg px-3 py-2 text-xl font-bold text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleAdmission
              }
              className="p-5"
            >
              {formError && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                  {formError}
                </div>
              )}

              <div className="mb-6">
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Patient Type
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPatientMode(
                        "existing"
                      );

                      setFormError(
                        ""
                      );
                    }}
                    className={`rounded-lg px-5 py-3 font-semibold ${
                      patientMode ===
                      "existing"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Existing Patient
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPatientMode(
                        "new"
                      );

                      setSelectedPatient(
                        null
                      );

                      setFormError(
                        ""
                      );
                    }}
                    className={`rounded-lg px-5 py-3 font-semibold ${
                      patientMode ===
                      "new"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    + New Patient
                  </button>
                </div>
              </div>

              {patientMode ===
              "existing" ? (
                <div className="mb-6 rounded-xl border p-4">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Search Patient
                  </label>

                  <input
                    type="text"
                    value={
                      patientSearch
                    }
                    onChange={(
                      event
                    ) => {
                      setPatientSearch(
                        event.target
                          .value
                      );
                    }}
                    placeholder="Search by name, UHID or mobile number"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                  {loadingPatients ? (
                    <p className="mt-3 text-sm text-gray-500">
                      Loading patients...
                    </p>
                  ) : (
                    <div className="mt-3 max-h-64 overflow-y-auto">
                      {filteredPatients.map(
                        (patient) => {
                          const isSelected =
                            selectedPatient?.id ===
                            patient.id;

                          return (
                            <button
                              key={
                                patient.id
                              }
                              type="button"
                              onClick={() =>
                                setSelectedPatient(
                                  patient
                                )
                              }
                              className={`mb-2 w-full rounded-lg border p-3 text-left ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <div className="font-semibold text-gray-900">
                                {
                                  patient.firstName
                                }{" "}
                                {
                                  patient.lastName ||
                                    ""
                                }
                              </div>

                              <div className="mt-1 text-sm text-gray-500">
                                UHID:{" "}
                                {
                                  patient.patientId
                                }
                                {" · Age: "}
                                {
                                  patient.age
                                }
                                {" · "}
                                {
                                  patient.gender
                                }
                                {" · "}
                                {
                                  patient.mobile
                                }
                              </div>
                            </button>
                          );
                        }
                      )}

                      {filteredPatients.length ===
                        0 && (
                        <p className="py-4 text-center text-sm text-gray-500">
                          No patient found.
                        </p>
                      )}
                    </div>
                  )}

                  {selectedPatient && (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                      <p className="font-semibold text-green-800">
                        Selected Patient:{" "}
                        {
                          selectedPatient.firstName
                        }{" "}
                        {
                          selectedPatient.lastName ||
                            ""
                        }
                      </p>

                      <p className="mt-1 text-sm text-green-700">
                        UHID:{" "}
                        {
                          selectedPatient.patientId
                        }
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-6 rounded-xl border p-4">
                  <h3 className="mb-4 text-lg font-bold text-gray-900">
                    New Patient Details
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        First Name *
                      </label>

                      <input
                        type="text"
                        value={
                          newPatient.firstName
                        }
                        onChange={(
                          event
                        ) =>
                          setNewPatient({
                            ...newPatient,
                            firstName:
                              event.target
                                .value,
                          })
                        }
                        className="w-full rounded-lg border px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Last Name
                      </label>

                      <input
                        type="text"
                        value={
                          newPatient.lastName
                        }
                        onChange={(
                          event
                        ) =>
                          setNewPatient({
                            ...newPatient,
                            lastName:
                              event.target
                                .value,
                          })
                        }
                        className="w-full rounded-lg border px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Age *
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          newPatient.age
                        }
                        onChange={(
                          event
                        ) =>
                          setNewPatient({
                            ...newPatient,
                            age:
                              event.target
                                .value,
                          })
                        }
                        className="w-full rounded-lg border px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Gender *
                      </label>

                      <select
                        value={
                          newPatient.gender
                        }
                        onChange={(
                          event
                        ) =>
                          setNewPatient({
                            ...newPatient,
                            gender:
                              event.target
                                .value,
                          })
                        }
                        className="w-full rounded-lg border px-4 py-3"
                      >
                        <option value="">
                          Select Gender
                        </option>

                        <option value="Male">
                          Male
                        </option>

                        <option value="Female">
                          Female
                        </option>

                        <option value="Other">
                          Other
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Mobile Number *
                      </label>

                      <input
                        type="text"
                        value={
                          newPatient.mobile
                        }
                        onChange={(
                          event
                        ) =>
                          setNewPatient({
                            ...newPatient,
                            mobile:
                              event.target
                                .value,
                          })
                        }
                        className="w-full rounded-lg border px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Blood Group
                      </label>

                      <select
                        value={
                          newPatient.bloodGroup
                        }
                        onChange={(
                          event
                        ) =>
                          setNewPatient({
                            ...newPatient,
                            bloodGroup:
                              event.target
                                .value,
                          })
                        }
                        className="w-full rounded-lg border px-4 py-3"
                      >
                        <option value="">
                          Select
                        </option>

                        <option value="A+">
                          A+
                        </option>

                        <option value="A-">
                          A-
                        </option>

                        <option value="B+">
                          B+
                        </option>

                        <option value="B-">
                          B-
                        </option>

                        <option value="AB+">
                          AB+
                        </option>

                        <option value="AB-">
                          AB-
                        </option>

                        <option value="O+">
                          O+
                        </option>

                        <option value="O-">
                          O-
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Aadhaar Number
                      </label>

                      <input
                        type="text"
                        value={
                          newPatient.aadhaar
                        }
                        onChange={(
                          event
                        ) =>
                          setNewPatient({
                            ...newPatient,
                            aadhaar:
                              event.target
                                .value,
                          })
                        }
                        className="w-full rounded-lg border px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Occupation
                      </label>

                      <input
                        type="text"
                        value={
                          newPatient.occupation
                        }
                        onChange={(
                          event
                        ) =>
                          setNewPatient({
                            ...newPatient,
                            occupation:
                              event.target
                                .value,
                          })
                        }
                        className="w-full rounded-lg border px-4 py-3"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium">
                        Address
                      </label>

                      <textarea
                        rows={3}
                        value={
                          newPatient.address
                        }
                        onChange={(
                          event
                        ) =>
                          setNewPatient({
                            ...newPatient,
                            address:
                              event.target
                                .value,
                          })
                        }
                        className="w-full rounded-lg border px-4 py-3"
                      />
                    </div>

                  </div>
                </div>
              )}

              <div className="mb-6 rounded-xl border p-4">
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  Bed Allocation
                </h3>

                <div className="grid gap-4 md:grid-cols-2">

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Ward *
                    </label>

                    <select
                      value={
                        selectedWardId
                      }
                      onChange={(
                        event
                      ) => {
                        setSelectedWardId(
                          event.target
                            .value
                        );

                        setSelectedBedId(
                          ""
                        );
                      }}
                      className="w-full rounded-lg border px-4 py-3"
                    >
                      <option value="">
                        Select Ward
                      </option>

                      {wards.map(
                        (ward) => (
                          <option
                            key={
                              ward.id
                            }
                            value={
                              ward.id
                            }
                          >
                            {
                              ward.name
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Available Bed *
                    </label>

                    <select
                      value={
                        selectedBedId
                      }
                      disabled={
                        !selectedWardId
                      }
                      onChange={(
                        event
                      ) =>
                        setSelectedBedId(
                          event.target
                            .value
                        )
                      }
                      className="w-full rounded-lg border px-4 py-3 disabled:bg-gray-100"
                    >
                      <option value="">
                        Select Bed
                      </option>

                      {availableBedsForWard.map(
                        (bed) => (
                          <option
                            key={
                              bed.id
                            }
                            value={
                              bed.id
                            }
                          >
                            {
                              bed.bedNumber
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                </div>

                {selectedWardId &&
                  availableBedsForWard.length ===
                    0 && (
                    <p className="mt-3 text-sm font-medium text-red-600">
                      No beds are currently
                      available in this ward.
                    </p>
                  )}
              </div>

              <div className="mb-6 rounded-xl border p-4">
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  Admission Details
                </h3>

                <div className="grid gap-4 md:grid-cols-2">

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Admitting Doctor *
                    </label>

                    <input
                      type="text"
                      value={
                        admittingDoctor
                      }
                      onChange={(
                        event
                      ) =>
                        setAdmittingDoctor(
                          event.target
                            .value
                        )
                      }
                      placeholder="Doctor name"
                      className="w-full rounded-lg border px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Department *
                    </label>

                    <input
                      type="text"
                      value={
                        department
                      }
                      onChange={(
                        event
                      ) =>
                        setDepartment(
                          event.target
                            .value
                        )
                      }
                      placeholder="e.g. Medicine"
                      className="w-full rounded-lg border px-4 py-3"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium">
                      Chief Complaint
                    </label>

                    <textarea
                      rows={3}
                      value={
                        chiefComplaint
                      }
                      onChange={(
                        event
                      ) =>
                        setChiefComplaint(
                          event.target
                            .value
                        )
                      }
                      className="w-full rounded-lg border px-4 py-3"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium">
                      Provisional Diagnosis
                    </label>

                    <textarea
                      rows={3}
                      value={
                        provisionalDiagnosis
                      }
                      onChange={(
                        event
                      ) =>
                        setProvisionalDiagnosis(
                          event.target
                            .value
                        )
                      }
                      className="w-full rounded-lg border px-4 py-3"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium">
                      Admission Notes
                    </label>

                    <textarea
                      rows={3}
                      value={
                        admissionNotes
                      }
                      onChange={(
                        event
                      ) =>
                        setAdmissionNotes(
                          event.target
                            .value
                        )
                      }
                      className="w-full rounded-lg border px-4 py-3"
                    />
                  </div>

                </div>
              </div>


              <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeAdmissionForm
                  }
                  disabled={
                    submitting
                  }
                  className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Admitting Patient..."
                    : "Admit Patient"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {selectedAdmission && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/50 p-4">
          <div className="mx-auto my-8 max-w-3xl rounded-xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  IPD Patient Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  IPD No:{" "}
                  {
                    selectedAdmission.ipdNo
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedAdmission(
                    null
                  );
                  setClinicalNotes([]);
                  setClinicalNotesError("");
                }}
                className="rounded-lg px-3 py-2 text-xl font-bold text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-5">

              <div className="rounded-xl border p-4">
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  Patient Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">
                      Patient Name
                    </p>

                    <p className="font-semibold text-gray-900">
                      {
                        selectedAdmission
                          .patient
                          .firstName
                      }{" "}
                      {
                        selectedAdmission
                          .patient
                          .lastName || ""
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      UHID
                    </p>

                    <p className="font-semibold text-gray-900">
                      {
                        selectedAdmission
                          .patient
                          .patientId
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Age / Gender
                    </p>

                    <p className="font-semibold text-gray-900">
                      {
                        selectedAdmission
                          .patient
                          .age
                      }
                      {" Years · "}
                      {
                        selectedAdmission
                          .patient
                          .gender
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Mobile
                    </p>

                    <p className="font-semibold text-gray-900">
                      {
                        selectedAdmission
                          .patient
                          .mobile
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Blood Group
                    </p>

                    <p className="font-semibold text-gray-900">
                      {
                        selectedAdmission
                          .patient
                          .bloodGroup || "-"
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Address
                    </p>

                    <p className="font-semibold text-gray-900">
                      {
                        selectedAdmission
                          .patient
                          .address || "-"
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  Admission Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>
                    <p className="text-sm text-gray-500">
                      Ward
                    </p>

                    <p className="font-semibold text-gray-900">
                      {
                        selectedAdmission
                          .bed
                          .ward
                          .name
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Bed Number
                    </p>

                    <p className="font-semibold text-gray-900">
                      {
                        selectedAdmission
                          .bed
                          .bedNumber
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Admitting Doctor
                    </p>

                    <p className="font-semibold text-gray-900">
                      {
                        selectedAdmission
                          .admittingDoctor
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Department
                    </p>

                    <p className="font-semibold text-gray-900">
                      {
                        selectedAdmission
                          .department
                      }
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-500">
                      Admission Date & Time
                    </p>

                    <p className="font-semibold text-gray-900">
                      {
                        formatDateTime(
                          selectedAdmission
                            .admissionDate
                        )
                      }
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-500">
                      Chief Complaint
                    </p>

                    <p className="font-semibold text-gray-900">
                      {
                        selectedAdmission
                          .chiefComplaint || "-"
                      }
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-500">
                      Provisional Diagnosis
                    </p>

                    <p className="font-semibold text-gray-900">
                      {
                        selectedAdmission
                          .provisionalDiagnosis ||
                          "-"
                      }
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-500">
                      Admission Notes
                    </p>

                    <p className="font-semibold text-gray-900">
                      {
                        selectedAdmission
                          .admissionNotes ||
                          "-"
                      }
                    </p>
                  </div>

                </div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Clinical Notes
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add and review progress, doctor and nursing notes.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      loadClinicalNotes(
                        selectedAdmission.id
                      )
                    }
                    disabled={
                      loadingClinicalNotes
                    }
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  >
                    {loadingClinicalNotes
                      ? "Refreshing..."
                      : "Refresh Notes"}
                  </button>
                </div>

                {clinicalNotesError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {clinicalNotesError}
                  </div>
                )}

                <form
                  onSubmit={
                    handleClinicalNote
                  }
                  className="mt-4 rounded-xl bg-gray-50 p-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Note Type
                      </label>
                      <select
                        value={
                          clinicalNoteType
                        }
                        onChange={(event) =>
                          setClinicalNoteType(
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                      >
                        <option value="Progress">
                          Progress
                        </option>
                        <option value="Doctor">
                          Doctor Note
                        </option>
                        <option value="Nursing">
                          Nursing Note
                        </option>
                        <option value="Observation">
                          Observation
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Created By
                      </label>
                      <input
                        type="text"
                        value={
                          clinicalNoteCreatedBy
                        }
                        onChange={(event) =>
                          setClinicalNoteCreatedBy(
                            event.target.value
                          )
                        }
                        placeholder="e.g. Dr Rahul"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium">
                        Clinical Note *
                      </label>
                      <textarea
                        rows={4}
                        value={
                          clinicalNoteText
                        }
                        onChange={(event) =>
                          setClinicalNoteText(
                            event.target.value
                          )
                        }
                        placeholder="Enter patient progress, examination findings, treatment response or other clinical observations..."
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={
                        savingClinicalNote
                      }
                      className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {savingClinicalNote
                        ? "Saving Note..."
                        : "Add Clinical Note"}
                    </button>
                  </div>
                </form>

                <div className="mt-5">
                  {loadingClinicalNotes ? (
                    <p className="py-6 text-center text-sm text-gray-500">
                      Loading clinical notes...
                    </p>
                  ) : clinicalNotes.length ===
                    0 ? (
                    <p className="rounded-lg border border-dashed p-5 text-center text-sm text-gray-500">
                      No clinical notes have been added yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {clinicalNotes.map(
                        (clinicalNote) => (
                          <div
                            key={
                              clinicalNote.id
                            }
                            className="rounded-xl border p-4"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                  {
                                    clinicalNote.noteType
                                  }
                                </span>

                                <span className="text-sm text-gray-500">
                                  {
                                    formatDateTime(
                                      clinicalNote.createdAt
                                    )
                                  }
                                </span>
                              </div>

                              {clinicalNote.createdBy && (
                                <span className="text-sm font-medium text-gray-700">
                                  By:{" "}
                                  {
                                    clinicalNote.createdBy
                                  }
                                </span>
                              )}
                            </div>

                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-800">
                              {
                                clinicalNote.note
                              }
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Vital Signs
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Record and review patient vital signs.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      loadVitals(selectedAdmission.id)
                    }
                    disabled={loadingVitals}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  >
                    {loadingVitals
                      ? "Refreshing..."
                      : "Refresh Vitals"}
                  </button>
                </div>

                {vitalsError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {vitalsError}
                  </div>
                )}

                <form
                  onSubmit={handleVitalSubmit}
                  className="mt-4 rounded-xl bg-gray-50 p-4"
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      ["BP", "bp", "e.g. 120/80"],
                      ["Pulse", "pulse", "bpm"],
                      ["Resp. Rate", "respiratoryRate", "/min"],
                      ["Temperature", "temperature", "°C"],
                      ["SpO₂", "spo2", "%"],
                      ["Weight", "weight", "kg"],
                      ["Random Blood Sugar", "randomBloodSugar", "mg/dL"],
                      ["Pain Score", "painScore", "0-10"],
                    ].map(([label, key, placeholder]) => (
                      <div key={key}>
                        <label className="mb-1 block text-sm font-medium">
                          {label}
                        </label>
                        <input
                          type={key === "bp" ? "text" : "number"}
                          step={
                            key === "temperature" ||
                            key === "weight" ||
                            key === "randomBloodSugar"
                              ? "0.1"
                              : "1"
                          }
                          value={
                            vitalForm[
                              key as keyof typeof vitalForm
                            ]
                          }
                          onChange={(event) =>
                            setVitalForm({
                              ...vitalForm,
                              [key]: event.target.value,
                            })
                          }
                          placeholder={placeholder}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                        />
                      </div>
                    ))}

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Recorded By
                      </label>
                      <input
                        type="text"
                        value={vitalForm.recordedBy}
                        onChange={(event) =>
                          setVitalForm({
                            ...vitalForm,
                            recordedBy: event.target.value,
                          })
                        }
                        placeholder="e.g. Nurse / Dr Rahul"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium">
                        Remarks
                      </label>
                      <input
                        type="text"
                        value={vitalForm.remarks}
                        onChange={(event) =>
                          setVitalForm({
                            ...vitalForm,
                            remarks: event.target.value,
                          })
                        }
                        placeholder="Any observation or remarks"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingVital}
                      className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {savingVital
                        ? "Saving Vitals..."
                        : "Save Vital Signs"}
                    </button>
                  </div>
                </form>

                <div className="mt-5 space-y-3">
                  {loadingVitals ? (
                    <p className="py-4 text-center text-sm text-gray-500">
                      Loading vital signs...
                    </p>
                  ) : vitals.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
                      No vital signs recorded yet.
                    </p>
                  ) : (
                    vitals.map((vital) => (
                      <div
                        key={vital.id}
                        className="rounded-xl border p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatDateTime(vital.recordedAt)}
                          </span>
                          {vital.recordedBy && (
                            <span className="text-sm text-gray-500">
                              By: {vital.recordedBy}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 md:grid-cols-4">
                          {[
                            ["BP", vital.bp],
                            ["Pulse", vital.pulse ? `${vital.pulse} bpm` : null],
                            ["RR", vital.respiratoryRate ? `${vital.respiratoryRate}/min` : null],
                            ["Temp", vital.temperature ? `${vital.temperature} °C` : null],
                            ["SpO₂", vital.spo2 ? `${vital.spo2}%` : null],
                            ["Weight", vital.weight ? `${vital.weight} kg` : null],
                            ["RBS", vital.randomBloodSugar ? `${vital.randomBloodSugar} mg/dL` : null],
                            ["Pain", vital.painScore],
                          ].filter(([, value]) => value !== null && value !== undefined && value !== "").map(([label, value]) => (
                            <div key={String(label)} className="rounded-lg bg-gray-50 p-2">
                              <span className="text-gray-500">{label}: </span>
                              <span className="font-semibold text-gray-900">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                        {vital.remarks && (
                          <p className="mt-3 text-sm text-gray-700">
                            {vital.remarks}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Medication / Treatment Orders
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add and review active treatment orders.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      loadMedicationOrders(
                        selectedAdmission.id
                      )
                    }
                    disabled={loadingMedicationOrders}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  >
                    {loadingMedicationOrders
                      ? "Refreshing..."
                      : "Refresh Orders"}
                  </button>
                </div>

                {medicationError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {medicationError}
                  </div>
                )}

                <form
                  onSubmit={handleMedicationSubmit}
                  className="mt-4 rounded-xl bg-gray-50 p-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      ["Medicine Name *", "medicineName", "e.g. Paracetamol"],
                      ["Strength", "strength", "e.g. 500 mg"],
                      ["Dosage", "dosage", "e.g. 1 tablet"],
                      ["Frequency", "frequency", "e.g. TDS"],
                      ["Route", "route", "e.g. Oral / IV"],
                      ["Duration", "duration", "e.g. 5 days"],
                      ["Ordered By", "orderedBy", "e.g. Dr Rahul"],
                    ].map(([label, key, placeholder]) => (
                      <div key={key}>
                        <label className="mb-1 block text-sm font-medium">
                          {label}
                        </label>
                        <input
                          type="text"
                          value={
                            medicationForm[
                              key as keyof typeof medicationForm
                            ]
                          }
                          onChange={(event) =>
                            setMedicationForm({
                              ...medicationForm,
                              [key]: event.target.value,
                            })
                          }
                          placeholder={placeholder}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                        />
                      </div>
                    ))}

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium">
                        Instruction
                      </label>
                      <input
                        type="text"
                        value={medicationForm.instruction}
                        onChange={(event) =>
                          setMedicationForm({
                            ...medicationForm,
                            instruction: event.target.value,
                          })
                        }
                        placeholder="e.g. After food"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingMedicationOrder}
                      className="rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                    >
                      {savingMedicationOrder
                        ? "Saving Order..."
                        : "Add Medication Order"}
                    </button>
                  </div>
                </form>

                <div className="mt-5 space-y-3">
                  {loadingMedicationOrders ? (
                    <p className="py-4 text-center text-sm text-gray-500">
                      Loading medication orders...
                    </p>
                  ) : medicationOrders.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
                      No medication or treatment orders added yet.
                    </p>
                  ) : (
                    medicationOrders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-xl border p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {order.medicineName}
                              {order.strength
                                ? ` (${order.strength})`
                                : ""}
                            </h4>
                            <p className="mt-1 text-sm text-gray-600">
                              {[order.dosage, order.frequency, order.route, order.duration]
                                .filter(Boolean)
                                .join(" · ") || "No schedule details"}
                            </p>
                          </div>
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            {order.status}
                          </span>
                        </div>
                        {order.instruction && (
                          <p className="mt-3 text-sm text-gray-700">
                            Instruction: {order.instruction}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-gray-500">
                          <span>
                            Started: {formatDateTime(order.startDate)}
                          </span>
                          {order.orderedBy && (
                            <span>
                              Ordered by: {order.orderedBy}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><h3 className="text-lg font-bold text-gray-900">Investigations</h3><p className="mt-1 text-sm text-gray-500">Order and review investigations for this admission.</p></div>
                  <button type="button" onClick={() => selectedAdmission && loadInvestigations(selectedAdmission.id)} disabled={loadingInvestigations} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60">{loadingInvestigations ? "Refreshing..." : "Refresh"}</button>
                </div>
                {investigationError && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{investigationError}</div>}
                <form onSubmit={handleInvestigationSubmit} className="mt-4 rounded-xl bg-gray-50 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {[ ["Test Name *", "testName", "e.g. CBC"], ["Test Code", "testCode", "e.g. CBC001"], ["Category", "category", "e.g. Hematology"], ["Ordered By", "orderedBy", "e.g. Dr Rahul"] ].map(([label, key, placeholder]) => <div key={key}><label className="mb-1 block text-sm font-medium">{label}</label><input value={investigationForm[key as keyof typeof investigationForm]} onChange={(event) => setInvestigationForm({ ...investigationForm, [key]: event.target.value })} placeholder={placeholder} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3" /></div>)}
                  </div>
                  <div className="mt-4 flex justify-end"><button type="submit" disabled={savingInvestigation} className="rounded-lg bg-amber-600 px-5 py-3 font-semibold text-white hover:bg-amber-700 disabled:opacity-60">{savingInvestigation ? "Saving..." : "Add Investigation"}</button></div>
                </form>
                <div className="mt-5 space-y-3">
                  {loadingInvestigations ? <p className="py-4 text-center text-sm text-gray-500">Loading investigations...</p> : investigations.length === 0 ? <p className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">No investigations added yet.</p> : investigations.map((item) => <div key={item.id} className="rounded-xl border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-bold text-gray-900">{item.testName}</h4><p className="mt-1 text-sm text-gray-600">{[item.testCode, item.category].filter(Boolean).join(" · ") || "Investigation"}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{item.status}</span></div>{item.result && <p className="mt-3 text-sm text-gray-700">Result: {item.result}</p>}{item.remarks && <p className="mt-1 text-sm text-gray-700">Remarks: {item.remarks}</p>}<div className="mt-3 text-xs text-gray-500">Ordered: {formatDateTime(item.orderedAt)}{item.orderedBy ? ` · By: ${item.orderedBy}` : ""}</div></div>)}
                </div>
              </div>


              <div className="rounded-xl border p-4">
                <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Billing & Payments
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add IPD charges, receive payments and review the outstanding balance.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadBilling(selectedAdmission.id)}
                    disabled={loadingBilling}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  >
                    {loadingBilling ? "Refreshing..." : "Refresh Billing"}
                  </button>
                </div>

                {billingError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {billingError}
                  </div>
                )}

                {billingSuccess && (
                  <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    {billingSuccess}
                  </div>
                )}

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-sm font-medium text-blue-700">Total Charges</p>
                    <p className="mt-1 text-2xl font-bold text-blue-900">
                      ₹{billingSummary.totalCharges.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-700">Total Payments</p>
                    <p className="mt-1 text-2xl font-bold text-green-900">
                      ₹{billingSummary.totalPayments.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-700">
                      {billingSummary.balance > 0 ? "Balance Due" : billingSummary.balance < 0 ? "Advance / Credit" : "Balance"}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-amber-900">
                      ₹{Math.abs(billingSummary.balance).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <form onSubmit={handleChargeSubmit} className="rounded-xl bg-gray-50 p-4">
                    <h4 className="font-bold text-gray-900">Add Charge</h4>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium">Category *</label>
                        <select
                          value={chargeForm.category}
                          onChange={(event) => setChargeForm({ ...chargeForm, category: event.target.value })}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
                        >
                          <option>Bed Charges</option>
                          <option>Doctor Visit</option>
                          <option>Investigation</option>
                          <option>Procedure</option>
                          <option>Medicine</option>
                          <option>Nursing Charges</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Quantity *</label>
                        <input type="number" min="0.01" step="0.01" value={chargeForm.quantity} onChange={(event) => setChargeForm({ ...chargeForm, quantity: event.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Description *</label>
                        <input value={chargeForm.description} onChange={(event) => setChargeForm({ ...chargeForm, description: event.target.value })} placeholder="e.g. General Ward Bed Charge" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Unit Price *</label>
                        <input type="number" min="0" step="0.01" value={chargeForm.unitPrice} onChange={(event) => setChargeForm({ ...chargeForm, unitPrice: event.target.value })} placeholder="0.00" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Created By</label>
                        <input value={chargeForm.createdBy} onChange={(event) => setChargeForm({ ...chargeForm, createdBy: event.target.value })} placeholder="e.g. Dr Rahul" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5" />
                      </div>
                    </div>
                    <button type="submit" disabled={savingCharge} className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                      {savingCharge ? "Adding Charge..." : "Add Charge"}
                    </button>
                  </form>

                  <form onSubmit={handlePaymentSubmit} className="rounded-xl bg-gray-50 p-4">
                    <h4 className="font-bold text-gray-900">Receive Payment</h4>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium">Amount *</label>
                        <input type="number" min="0.01" step="0.01" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} placeholder="0.00" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Payment Mode *</label>
                        <select value={paymentForm.paymentMode} onChange={(event) => setPaymentForm({ ...paymentForm, paymentMode: event.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5">
                          <option>Cash</option>
                          <option>UPI</option>
                          <option>Card</option>
                          <option>Bank Transfer</option>
                          <option>Cheque</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Received By</label>
                        <input value={paymentForm.receivedBy} onChange={(event) => setPaymentForm({ ...paymentForm, receivedBy: event.target.value })} placeholder="e.g. Reception" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Remarks</label>
                        <input value={paymentForm.remarks} onChange={(event) => setPaymentForm({ ...paymentForm, remarks: event.target.value })} placeholder="e.g. Advance payment" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5" />
                      </div>
                    </div>
                    <button type="submit" disabled={savingPayment} className="mt-4 rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-60">
                      {savingPayment ? "Receiving..." : "Receive Payment"}
                    </button>
                  </form>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div>
                    <h4 className="mb-3 font-bold text-gray-900">Charge History</h4>
                    {loadingBilling ? (
                      <p className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">Loading billing...</p>
                    ) : charges.length === 0 ? (
                      <p className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">No charges added yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {charges.map((charge) => (
                          <div key={charge.id} className="rounded-xl border p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-gray-900">{charge.description}</p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {charge.category} · Qty {charge.quantity} × ₹{charge.unitPrice.toFixed(2)}
                                </p>
                              </div>
                              <p className="font-bold text-gray-900">₹{charge.total.toFixed(2)}</p>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                              {formatDateTime(charge.chargeDate)}
                              {charge.createdBy ? ` · By: ${charge.createdBy}` : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="mb-3 font-bold text-gray-900">Payment History</h4>
                    {loadingBilling ? (
                      <p className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">Loading payments...</p>
                    ) : payments.length === 0 ? (
                      <p className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">No payments received yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {payments.map((payment) => (
                          <div key={payment.id} className="rounded-xl border p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-gray-900">₹{payment.amount.toFixed(2)}</p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {payment.paymentMode} · Receipt: {payment.receiptNo}
                                </p>
                              </div>
                              <p className="text-xs text-gray-500">{formatDateTime(payment.paidAt)}</p>
                            </div>
                            {(payment.receivedBy || payment.remarks) && (
                              <p className="mt-2 text-xs text-gray-500">
                                {payment.receivedBy ? `Received by: ${payment.receivedBy}` : ""}
                                {payment.receivedBy && payment.remarks ? " · " : ""}
                                {payment.remarks || ""}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Discharge Clearance
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Verify the final billing position before discharging the patient.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => loadBilling(selectedAdmission.id)}
                      disabled={loadingBilling}
                      className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
                    >
                      {loadingBilling ? "Checking..." : "Recheck Bill"}
                    </button>
                    <button
                      type="button"
                      onClick={printFinalBill}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Print Final Bill
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Charges</p>
                    <p className="mt-1 text-xl font-bold text-gray-900">₹{billingSummary.totalCharges.toFixed(2)}</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Paid</p>
                    <p className="mt-1 text-xl font-bold text-green-700">₹{billingSummary.totalPayments.toFixed(2)}</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Outstanding</p>
                    <p className="mt-1 text-xl font-bold text-red-700">
                      ₹{Math.max(billingSummary.balance, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Clearance Status</p>
                    <p className={`mt-1 text-xl font-bold ${
                      billingSummary.balance <= 0.009
                        ? "text-green-700"
                        : billingSummary.totalPayments > 0
                          ? "text-amber-700"
                          : "text-red-700"
                    }`}>
                      {billingSummary.balance <= 0.009
                        ? "PAID"
                        : billingSummary.totalPayments > 0
                          ? "PARTIALLY PAID"
                          : "DUE"}
                    </p>
                  </div>
                </div>

                {billingSummary.balance > 0.009 ? (
                  <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                    <strong>Payment pending:</strong> ₹{billingSummary.balance.toFixed(2)} is still outstanding.
                    The discharge button will ask for an additional confirmation before allowing discharge with a pending balance.
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-900">
                    <strong>Billing cleared:</strong> No outstanding balance is pending for this admission.
                  </div>
                )}
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-lg font-bold text-gray-900">Discharge Summary</h3><p className="mt-1 text-sm text-gray-500">Prepare, save and print the patient discharge summary.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={printDischargeSummary} disabled={!dischargeSummary && !Object.values(dischargeSummaryForm).some(Boolean) && !dischargeMedicineText.trim()} className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50">Print Discharge Summary</button><button type="button" onClick={() => selectedAdmission && loadDischargeSummary(selectedAdmission.id)} disabled={loadingDischargeSummary} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60">{loadingDischargeSummary ? "Loading..." : "Refresh"}</button></div></div>
                {dischargeSummaryError && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{dischargeSummaryError}</div>}
                <form onSubmit={handleDischargeSummarySubmit} className="mt-4 rounded-xl bg-gray-50 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {[ ["Final Diagnosis", "finalDiagnosis"], ["History", "history"], ["Examination", "examination"], ["Hospital Course", "hospitalCourse"], ["Investigations", "investigations"], ["Procedures", "procedures"], ["Condition at Discharge", "conditionAtDischarge"], ["Follow-up Advice", "followUpAdvice"], ["Discharged By", "dischargedBy"] ].map(([label, key]) => <div key={key} className={key === "hospitalCourse" ? "md:col-span-2" : ""}><label className="mb-1 block text-sm font-medium">{label}</label><textarea rows={key === "hospitalCourse" ? 4 : 2} value={dischargeSummaryForm[key as keyof typeof dischargeSummaryForm]} onChange={(event) => setDischargeSummaryForm({ ...dischargeSummaryForm, [key]: event.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3" /></div>)}
                    <div className="md:col-span-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div><label className="block text-sm font-semibold text-indigo-900">Treatment Given</label><p className="text-xs text-indigo-700">Automatically summarized from Medication / Treatment Orders. You can edit it if needed.</p></div>
                        <button type="button" onClick={() => setDischargeSummaryForm({ ...dischargeSummaryForm, treatmentGiven: buildTreatmentGivenFromOrders(medicationOrders) })} className="rounded-lg border border-indigo-300 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">Fetch Treatment Orders</button>
                      </div>
                      <textarea rows={6} value={dischargeSummaryForm.treatmentGiven} onChange={(event) => setDischargeSummaryForm({ ...dischargeSummaryForm, treatmentGiven: event.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3" />
                    </div>
                    <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium">Discharge Advice</label><textarea rows={3} value={dischargeSummaryForm.dischargeAdvice} onChange={(event) => setDischargeSummaryForm({ ...dischargeSummaryForm, dischargeAdvice: event.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3" placeholder="General advice, diet, activity, warning signs, etc." /></div>
                    <div className="md:col-span-2 rounded-lg border border-green-200 bg-green-50 p-3"><label className="mb-1 block text-sm font-semibold text-green-900">Discharge Medicines / Prescription</label><p className="mb-2 text-xs text-green-700">Write the medicines to continue after discharge. Example: Paracetamol 500 mg - 1 tablet - TDS - 5 days - After food.</p><textarea rows={5} value={dischargeMedicineText} onChange={(event) => setDischargeMedicineText(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3" placeholder="Medicine name - strength - dose - frequency - duration - instructions" /></div>
                  </div>
                  <div className="mt-4 flex justify-end"><button type="submit" disabled={savingDischargeSummary} className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{savingDischargeSummary ? "Saving Summary..." : dischargeSummary ? "Update Discharge Summary" : "Save Discharge Summary"}</button></div>
                </form>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => {
                  setSelectedAdmission(
                    null
                  );
                  setClinicalNotes([]);
                  setClinicalNotesError("");
                }}
                  className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>

                {selectedAdmission.status !==
                  "Discharged" && (
                  <button
                    type="button"
                    disabled={
                      dischargingId ===
                      selectedAdmission.id
                    }
                    onClick={() =>
                      handleDischarge(
                        selectedAdmission
                      )
                    }
                    className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {dischargingId ===
                    selectedAdmission.id
                      ? "Discharging..."
                      : "Discharge Patient"}
                  </button>
                )}

              </div>

            </div>
          </div>
        </div>
      )}

    </main>
  );
}