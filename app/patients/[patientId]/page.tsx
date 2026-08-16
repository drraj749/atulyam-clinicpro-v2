"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import PatientInfoCard from "@/app/components/patient/PatientInfoCard";
import PatientActions from "@/app/components/patient/PatientActions";
import PatientVisitHistory from "@/app/components/patient/PatientVisitHistory";

type Patient = {
  patientId: string;
  firstName: string;
  lastName?: string;
  age: number;
  gender: string;
  mobile: string;
  address?: string;
};

type PrescriptionItem = {
  id: number;
  medicineName: string;
  strength?: string | null;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  instruction?: string | null;

  morning: boolean;
  afternoon: boolean;
  night: boolean;

  beforeFood: boolean;
  afterFood: boolean;

  sos: boolean;

  quantity?: number | null;
  route?: string | null;
};

type Visit = {
  id: number;

  opdNo: string;

  doctor: string;

  department: string;

  complaint?: string | null;

  examination?: string | null;

  diagnosis?: string | null;

  advice?: string | null;

  bp?: string | null;

  pulse?: number | null;

  temperature?: number | null;

  spo2?: number | null;

  height?: number | null;

  weight?: number | null;

  followUpDate?: string | null;

  createdAt: string;

  prescription?: {
    id: number;
    investigations?: string | null;
    notes?: string | null;
    items: PrescriptionItem[];
  } | null;
};

export default function PatientProfilePage() {
  const params = useParams();

  const patientId = params.patientId as string;

  const [patient, setPatient] =
    useState<Patient | null>(null);

  const [visits, setVisits] =
    useState<Visit[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (patientId) {
      loadData();
    }
  }, [patientId]);

  async function loadData() {
    try {
      const patientRes = await fetch(
        "/api/patients/" + patientId
      );

      if (!patientRes.ok) {
        throw new Error(
          "Patient not found"
        );
      }

      const patientJson =
        await patientRes.json();

      setPatient(
        patientJson.patient ??
          patientJson
      );

      const visitRes = await fetch(
        "/api/patients/" +
          patientId +
          "/visits"
      );

      if (visitRes.ok) {
        const visitJson =
          await visitRes.json();

        if (Array.isArray(visitJson)) {
          setVisits(visitJson);
        } else if (
          Array.isArray(
            visitJson.visits
          )
        ) {
          setVisits(
            visitJson.visits
          );
        } else {
          setVisits([]);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow p-6">
          Loading Patient...
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow p-6">
          Patient Not Found
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">

      <PatientInfoCard
        patient={patient}
      />

      <PatientActions
        patientId={patient.patientId}
      />

      <PatientVisitHistory
        patientId={patient.patientId}
        visits={visits}
      />

    </div>
  );
}