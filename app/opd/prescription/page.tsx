"use client";

import { useSearchParams } from "next/navigation";
import PrescriptionEditor from "@/app/components/opd/view/PrescriptionEditor";

export default function PrescriptionPage() {
  const searchParams = useSearchParams();

  const visitId = Number(searchParams.get("visitId"));

  if (!visitId || Number.isNaN(visitId)) {
    return (
      <div className="p-10">
        <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4">
          Invalid OPD Visit ID.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">

        <h1 className="text-3xl font-bold text-blue-900 mb-6">
          Prescription Editor
        </h1>

        <PrescriptionEditor opdVisitId={visitId} />

      </div>
    </div>
  );
}