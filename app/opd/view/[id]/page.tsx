"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import VitalsView from "@/app/components/opd/view/VitalsView";
import ClinicalNotesView from "@/app/components/opd/view/ClinicalNotesView";
import PrescriptionView from "@/app/components/opd/view/PrescriptionView";

type Visit = {
  id: number;
  opdNo: string;
  doctor: string;
  department: string;

  complaint?: string;
  examination?: string;
  diagnosis?: string;
  advice?: string;

  bp?: string;
  pulse?: number;
  temperature?: number;
  spo2?: number;

  height?: number;
  weight?: number;

  createdAt: string;

  patient: {
    patientId: string;
    firstName: string;
    lastName?: string;
    age: number;
    gender: string;
    mobile: string;
  };
};

export default function ViewOPDVisitPage() {
  const params = useParams();

  const id = params.id as string;

  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisit();
  }, []);

  async function loadVisit() {
    try {
      const response = await fetch("/api/opd/" + id);

      const result = await response.json();

      if (!response.ok) {
        alert(result.message);
        return;
      }

      setVisit(result.visit);
    } catch (error) {
      console.error(error);
      alert("Unable to load OPD Visit.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        Loading OPD Visit...
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        OPD Visit Not Found
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* OPD Header */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-start">

          <div>
            <h1 className="text-3xl font-bold text-blue-900">
              OPD Consultation
            </h1>

            <p className="text-gray-500 mt-2">
              OPD No : {visit.opdNo}
            </p>

            <p className="text-gray-500">
              {new Date(visit.createdAt).toLocaleString()}
            </p>
          </div>

        </div>
      </div>

      {/* Patient Information */}
      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-5">
          Patient Information
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

          <div>
            <p className="text-gray-500 text-sm">
              UHID
            </p>

            <p className="font-semibold">
              {visit.patient.patientId}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">
              Patient Name
            </p>

            <p className="font-semibold">
              {visit.patient.firstName}{" "}
              {visit.patient.lastName}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">
              Age / Gender
            </p>

            <p className="font-semibold">
              {visit.patient.age} Years /{" "}
              {visit.patient.gender}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">
              Mobile
            </p>

            <p className="font-semibold">
              {visit.patient.mobile}
            </p>
          </div>

        </div>

      </div>

      {/* Vitals */}
      <VitalsView
        bp={visit.bp}
        pulse={visit.pulse}
        temperature={visit.temperature}
        spo2={visit.spo2}
        height={visit.height}
        weight={visit.weight}
      />

      {/* Clinical Notes */}
      <ClinicalNotesView
        complaint={visit.complaint}
        examination={visit.examination}
        diagnosis={visit.diagnosis}
        advice={visit.advice}
      />

      {/* Prescription */}
      <PrescriptionView
        opdVisitId={visit.id}
      />

    </div>
  );
}