"use client";

import { useEffect, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import type { OPDForm } from "@/types/opd";

type Patient = {
  patientId: string;
  firstName: string;
  lastName?: string;
  age: number;
  gender: string;
  mobile: string;
  bloodGroup?: string;
  address?: string;
};

export const initialForm: OPDForm = {
  doctor: "Dr. Rahul Kumar",
  department: "General Medicine",
  fee: "500",
  paymentMode: "Cash",
  followUpDate: "",

  complaint: "",
  historyOfPresentIllness: "",
  pastHistory: "",
  drugHistory: "",
  familyHistory: "",
  personalHistory: "",
  allergy: "",

  generalExamination: "",
  cvs: "",
  rs: "",
  cns: "",
  pa: "",
  localExamination: "",

  diagnosis: "",
  advice: "",

  investigations: "",
  prescriptionNotes: "",
  medicines: [],

  bp: "",
  pulse: "",
  respiratoryRate: "",
  temperature: "",
  spo2: "",
  height: "",
  weight: "",
  bmi: "",
  randomBloodSugar: "",
  painScore: "",
};

export function useOPDForm(
  patientId: string,
  visitId?: number
) {
  const router = useRouter();
  const searchParams = useSearchParams();

const followUpVisitId = searchParams.get(
  "followUpVisitId"
);
const followUpFromId = followUpVisitId
  ? Number(followUpVisitId)
  : null;
  const [patient, setPatient] =
    useState<Patient | null>(null);

  const [loadingPatient, setLoadingPatient] =
    useState(true);

  const [loadingVisit, setLoadingVisit] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] =
    useState<OPDForm>(initialForm);

  useEffect(() => {
    if (patientId) {
      loadPatient();
    } else {
      setLoadingPatient(false);
    }
  }, [patientId]);

  useEffect(() => {
  if (visitId) {
    loadVisit();
  } else if (followUpVisitId) {
    loadVisit(Number(followUpVisitId));
  }
}, [visitId, followUpVisitId]);
  async function loadPatient() {
    try {
      setLoadingPatient(true);

      const res = await fetch(`/api/patients/${patientId}`);

      if (!res.ok) {
        setPatient(null);
        return;
      }

      const json = await res.json();

      setPatient(json.patient);
    } catch (error) {
      console.error(error);
      setPatient(null);
    } finally {
      setLoadingPatient(false);
    }
  }

  async function loadVisit(
  id = visitId
) {
    try {
      setLoadingVisit(true);

      const res = await fetch(`/api/opd/${id}`);

      if (!res.ok) {
  setLoadingVisit(false);
  return;
}

      const json = await res.json();

      const visit = json.visit;

      setPatient(visit.patient);
      const isFollowUp = !!followUpVisitId && !visitId;

      setForm({
        doctor: visit.doctor ?? "",
        department: visit.department ?? "",
        fee: visit.fee?.toString() ?? "",
        paymentMode: visit.paymentMode ?? "",
        followUpDate: isFollowUp
  ? ""
  : visit.followUpDate
  ? visit.followUpDate.substring(0, 10)
  : "",

        complaint: visit.complaint ?? "",
        historyOfPresentIllness:
          visit.historyOfPresentIllness ?? "",
        pastHistory: visit.pastHistory ?? "",
        drugHistory: visit.drugHistory ?? "",
        familyHistory: visit.familyHistory ?? "",
        personalHistory: visit.personalHistory ?? "",
        allergy: visit.allergy ?? "",

        generalExamination:
          visit.generalExamination ?? "",
        cvs: visit.cvs ?? "",
        rs: visit.rs ?? "",
        cns: visit.cns ?? "",
        pa: visit.pa ?? "",
        localExamination:
          visit.localExamination ?? "",

        diagnosis: visit.diagnosis ?? "",
        advice: visit.advice ?? "",

        investigations:
          visit.prescription?.investigations ?? "",

        prescriptionNotes:
          visit.prescription?.notes ?? "",

medicines:
  visit.prescription?.items?.map((item: any) => ({
    clientId: crypto.randomUUID(),

    medicineName: item.medicineName ?? "",
    strength: item.strength ?? "",
    dosage: item.dosage ?? "",
    frequency: item.frequency ?? "",
    duration: item.duration ?? "",
    instruction: item.instruction ?? "",

    morning: Boolean(item.morning),
    afternoon: Boolean(item.afternoon),
    night: Boolean(item.night),

    beforeFood: Boolean(item.beforeFood),
    afterFood: Boolean(item.afterFood),

    sos: Boolean(item.sos),

    // DATABASE NUMBER → FORM STRING
    quantity:
      item.quantity !== null &&
      item.quantity !== undefined
        ? String(item.quantity)
        : "",

    route: item.route ?? "Oral",
  })) ?? [],

        bp: isFollowUp ? "" : visit.bp ?? "",
        pulse: isFollowUp ? "" : visit.pulse?.toString() ?? "",
        respiratoryRate: isFollowUp
  ? ""
  : visit.respiratoryRate?.toString() ?? "",
        temperature: isFollowUp
  ? ""
  : visit.temperature?.toString() ?? "",
        spo2: isFollowUp
  ? ""
  : visit.spo2?.toString() ?? "",
        height: isFollowUp
  ? ""
  : visit.height?.toString() ?? "",
        weight: isFollowUp
  ? ""
  : visit.weight?.toString() ?? "",
        bmi: isFollowUp
  ? ""
  : visit.bmi?.toString() ?? "",
        randomBloodSugar: isFollowUp
  ? ""
  : visit.randomBloodSugar?.toString() ?? "",
        painScore: isFollowUp
  ? ""
  : visit.painScore?.toString() ?? "",
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoadingVisit(false);
    }
  }
function handleChange(
  e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >
) {
  const { name, value } = e.target;

  setForm((prev) => {
    const updated = {
      ...prev,
      [name]: value,
    };

    const height = parseFloat(updated.height);
    const weight = parseFloat(updated.weight);

    if (
      !isNaN(height) &&
      height > 0 &&
      !isNaN(weight) &&
      weight > 0
    ) {
      updated.bmi = (
        weight /
        Math.pow(height / 100, 2)
      ).toFixed(1);
    } else {
      updated.bmi = "";
    }

    return updated;
  });
}

  async function save() {
    if (saving) return;

    if (!patient) {
      alert("Patient not found.");
      return;
    }
if (!form.complaint.trim()) {
  alert("Chief Complaint is required.");
  return;
}

if (!form.diagnosis.trim()) {
  alert("Diagnosis is required.");
  return;
}
    setSaving(true);

    try {
      const url = visitId
        ? `/api/opd/${visitId}`
        : "/api/opd";

      const method = visitId ? "PUT" : "POST";

      const payload = {
  patientId,

  followUpFromId,

  ...form,

  complaint: form.complaint.trim(),
  diagnosis: form.diagnosis.trim(),
  advice: form.advice.trim(),
};

const res = await fetch(url, {
  method,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

  const json = await res.json();

  if (!res.ok) {
    alert(json.message || "Unable to save.");
    return;
  }

  const savedVisitId = json.visitId ?? visitId;

  if (!savedVisitId) {
    alert("OPD saved, but visit ID was not returned.");
    return;
  }

  const validMedicines = form.medicines
    .filter((medicine) => medicine.medicineName?.trim())
    .map((medicine) => ({
      medicineName: medicine.medicineName,
      strength: medicine.strength,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      duration: medicine.duration,
      instruction: medicine.instruction,
      morning: medicine.morning,
      afternoon: medicine.afternoon,
      night: medicine.night,
      beforeFood: medicine.beforeFood,
      afterFood: medicine.afterFood,
      sos: medicine.sos,
      quantity: medicine.quantity,
      route: medicine.route,
    }));

  const prescriptionResponse = await fetch("/api/prescriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      opdVisitId: savedVisitId,
      notes: form.prescriptionNotes.trim(),
      investigations: form.investigations.trim(),
      items: validMedicines,
    }),
  });

  const prescriptionResult = await prescriptionResponse.json();

  if (!prescriptionResponse.ok || !prescriptionResult.success) {
    alert(
      prescriptionResult.message ||
        "OPD saved, but prescription could not be saved."
    );
    return;
  }

alert(
  visitId
    ? "OPD Visit Updated Successfully."
    : "OPD Visit Saved Successfully."
);

router.push(
  `/prescriptions/${prescriptionResult.prescription.id}/print`
);

return;

    } catch (error) {
      console.error(error);
      alert("Server Error.");
    } finally {
      setSaving(false);
    }
  }

  return {
    patient,
    form,
    setForm,
    handleChange,
    save,
    saving,
    loadingPatient,
    loadingVisit,
  };
}