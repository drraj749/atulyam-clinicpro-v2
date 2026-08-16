"use client";

import { useRouter } from "next/navigation";
import PrescriptionEditor from "./PrescriptionEditor";

type Props = {
  opdVisitId: number;
};

export default function PrescriptionView({
  opdVisitId,
}: Props) {
  const router = useRouter();

  async function printPrescription() {
    try {
      // Get prescription by OPD Visit ID
      const response = await fetch(
        `/api/prescriptions?opdVisitId=${opdVisitId}`
      );

      const result = await response.json();

      if (!response.ok || !result.success || !result.prescription) {
        alert(
          result.message ?? "Unable to load prescription."
        );
        return;
      }

      router.push(
        `/prescriptions/${result.prescription.id}/print`
      );

    } catch (error) {
      console.error(error);
      alert("Unable to print prescription.");
    }
  }

  function openFullEditor() {
    router.push(
      `/opd/prescription?visitId=${opdVisitId}`
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-bold text-blue-900">
          Prescription
        </h2>

        <div className="flex gap-3">

          <button
            type="button"
            onClick={openFullEditor}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
          >
            ✏️ Edit
          </button>

          <button
            type="button"
            onClick={printPrescription}
            className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg"
          >
            🖨 Print
          </button>

        </div>

      </div>

      <PrescriptionEditor opdVisitId={opdVisitId} />

    </div>
  );
}