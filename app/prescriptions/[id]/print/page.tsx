"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import PrescriptionHeader from "@/app/components/opd/print/PrescriptionHeader";
import PrescriptionMedicineTable from "@/app/components/opd/print/PrescriptionMedicineTable";
import InvestigationBox from "@/app/components/opd/print/InvestigationBox";
import DoctorFooter from "@/app/components/opd/print/DoctorFooter";
import PrescriptionFooter from "@/app/components/opd/print/PrescriptionFooter";

type Prescription = {
  id: number;
  notes: string;
  investigations?: string;
  createdAt: string;

opdVisit: {
  id: number;
  opdNo: string;

  diagnosis?: string;
  advice?: string;
  followUpDate?: string;

  bp?: string;
  pulse?: number;
  respiratoryRate?: number;
  temperature?: number;
  spo2?: number;
  height?: number;
  weight?: number;
  bmi?: number;
  randomBloodSugar?: number;
  painScore?: number;

  patient: {
    patientId: string;
    firstName: string;
    lastName?: string;
    age: number;
    gender: string;
    mobile: string;
  };
};

  items: any[];
};

type HospitalSettings = {
  hospitalName: string;
  tagline?: string;

  address: string;
  city?: string;
  state?: string;
  pincode?: string;

  phone?: string;
  email?: string;
  website?: string;

  doctorName: string;
  qualification?: string;
  registrationNo?: string;

  logo?: string;
  signature?: string;

  prescriptionFooter?: string;
};

export default function PrintPrescriptionPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [prescription, setPrescription] =
    useState<Prescription | null>(null);

  const [settings, setSettings] =
    useState<HospitalSettings | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [prescriptionResponse, settingsResponse] =
      await Promise.all([
        fetch("/api/prescriptions/" + id),
        fetch("/api/settings"),
      ]);

    const prescriptionResult =
      await prescriptionResponse.json();

    const settingsResult =
      await settingsResponse.json();

    if (!prescriptionResult.success) {
      alert(prescriptionResult.message);
      return;
    }

    setPrescription(prescriptionResult.prescription);

    if (settingsResult.success) {
      setSettings(settingsResult.settings);
    }
  }

 function handlePrint() {
  window.print();

  setTimeout(() => {
    router.push("/");
  }, 500);
}

  if (!prescription || !settings) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-gray-200 min-h-screen py-10 print:bg-white print:min-h-0 print:py-0">

      {/* Buttons - Hidden while printing */}
      <div className="w-[210mm] mx-auto mb-4 flex justify-end gap-3 print:hidden">

        <button
          onClick={handlePrint}
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg"
        >
          🖨 Print
        </button>

<button
  onClick={() =>
    router.replace(
      `/opd?patientId=${prescription.opdVisit.patient.patientId}&visitId=${prescription.opdVisit.id}`
    )
  }
  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
>
  ← Back
</button>

      </div>

      <div className="print-area w-[210mm] bg-white mx-auto px-4 py-3 print:shadow-none">

        <PrescriptionHeader
  patient={prescription.opdVisit.patient}
  opdNo={prescription.opdVisit.opdNo}
  date={prescription.createdAt}
  settings={settings}
/>

<div className="mt-2 text-[13px]">
  <span className="font-bold">Diagnosis :</span>{" "}
  {prescription.opdVisit.diagnosis || "-"}
</div>

<div className="mt-1 text-[12px]">
  <div>
    <b>BP:</b> {prescription.opdVisit.bp || "-"}{" | "}
    <b>P:</b> {prescription.opdVisit.pulse ?? "-"}{" | "}
    <b>RR:</b> {prescription.opdVisit.respiratoryRate ?? "-"}{" | "}
    <b>Temp:</b> {prescription.opdVisit.temperature ?? "-"}°F
  </div>

  <div className="mt-0.5">
    <b>SpO₂:</b> {prescription.opdVisit.spo2 ?? "-"}{" | "}
    <b>Ht:</b> {prescription.opdVisit.height ?? "-"}{" | "}
    <b>Wt:</b> {prescription.opdVisit.weight ?? "-"}{" | "}
    <b>BMI:</b> {prescription.opdVisit.bmi ?? "-"}{" | "}
    <b>RBS:</b> {prescription.opdVisit.randomBloodSugar ?? "-"}
  </div>
</div>

<PrescriptionMedicineTable
  medicines={prescription.items}
/>

<InvestigationBox
  investigations={prescription.investigations ?? ""}
/>

<div className="mt-2 text-[13px]">
  <span className="font-bold">Advice :</span>{" "}
  {prescription.opdVisit.advice ||
    prescription.notes ||
    "-"}
</div>

<div className="mt-4">

  <DoctorFooter
    doctorName={settings.doctorName}
    qualification={settings.qualification}
    registrationNo={settings.registrationNo}
    hospitalName={settings.hospitalName}
    followUpDate={
      prescription.opdVisit.followUpDate
        ? new Date(
            prescription.opdVisit.followUpDate
          ).toLocaleDateString("en-IN")
        : ""
    }
    prescriptionFooter={settings.prescriptionFooter}
  />

  <PrescriptionFooter />

</div>
      </div>

    </div>
  );
}