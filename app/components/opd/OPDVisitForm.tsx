"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import PatientSummaryCard from "./PatientSummaryCard";
import VitalsCard from "./VitalsCard";
import ComplaintCard from "./ComplaintCard";
import ExaminationCard from "./ExaminationCard";
import DiagnosisCard from "./DiagnosisCard";
import PrescriptionCard from "./PrescriptionCard";

import { useOPDForm } from "@/app/hooks/useOPDForm";

type Props = {
  visitId?: number;
};

export default function OPDVisitForm({
  visitId,
}: Props) {
  const searchParams = useSearchParams();

const patientId = useMemo(() => {
  return searchParams.get("patientId") || "";
}, [searchParams]);

const urlVisitId = useMemo(() => {
  const value = searchParams.get("visitId");

  if (!value) return undefined;

  const numberValue = Number(value);

  return Number.isNaN(numberValue)
    ? undefined
    : numberValue;
}, [searchParams]);

const effectiveVisitId = visitId ?? urlVisitId;

const {
  patient,
  form,
  setForm,
  handleChange,
  save,
  saving,
  loadingPatient,
  loadingVisit,
} = useOPDForm(patientId, effectiveVisitId);

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-xl shadow p-6">

        <h1 className="text-3xl font-bold text-blue-900">
          {effectiveVisitId
  ? "Edit OPD Consultation"
  : "New OPD Consultation"}
        </h1>

        <p className="text-gray-500 mt-2">
          UHID :
          <span className="font-semibold ml-2">
            {patientId}
          </span>
        </p>

      </div>

      {loadingPatient || loadingVisit ? (
        <div className="bg-white rounded-xl shadow p-6">
          Loading patient...
        </div>
      ) : (
        <PatientSummaryCard patient={patient} />
      )}

      <VitalsCard
        form={form}
        onChange={handleChange}
      />

      <ComplaintCard
        form={form}
        onChange={handleChange}
      />

      <ExaminationCard
        form={form}
        onChange={handleChange}
      />

      <DiagnosisCard
  form={form}
  onChange={handleChange}
/>

<PrescriptionCard
  form={form}
  setForm={setForm}
/>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-5">
          Consultation Fee
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fee" className="block font-medium mb-2">
              Consultation Fee (INR)
            </label>
            <input
              id="fee"
              name="fee"
              type="number"
              min="0"
              step="1"
              value={form.fee}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
              placeholder="200"
            />
          </div>

          <div>
            <label htmlFor="paymentMode" className="block font-medium mb-2">
              Payment Mode
            </label>
            <select
              id="paymentMode"
              name="paymentMode"
              value={form.paymentMode}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full bg-white"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-3">
          Standard OPD consultation fee: ₹200
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 flex justify-end">

        <button
  type="button"
  onClick={save}
  disabled={saving || !patient}
  className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg"
>
{saving
  ? "Saving..."
  : effectiveVisitId
  ? "Update OPD Visit"
  : "Save OPD Visit"}
</button>

      </div>

    </div>
  );
}