"use client";

import { OPDForm } from "@/types/opd";

type Props = {
  form: OPDForm;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
};

export default function DiagnosisCard({
  form,
  onChange,
}: Props) {
  const investigationOptions = [
    "CBC",
    "ESR",
    "CRP",
    "LFT",
    "KFT",
    "HbA1c",
    "FBS",
    "PPBS",
    "RBS",
    "Lipid Profile",
    "TSH",
    "Vitamin B12",
    "Vitamin D",
    "Urine Routine",
    "Urine Culture",
    "ECG",
    "Chest X-Ray",
    "USG Whole Abdomen",
  ];

  function addInvestigation(test: string) {
    const list = form.investigations
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    if (list.includes(test)) return;

    const event = {
      target: {
        name: "investigations",
        value: [...list, test].join("\n"),
      },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    onChange(event);
  }

  function clearInvestigations() {
    const event = {
      target: {
        name: "investigations",
        value: "",
      },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    onChange(event);
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-2xl font-bold text-blue-900 mb-6">
        Diagnosis & Plan
      </h2>

      <div className="space-y-5">

        {/* DIAGNOSIS */}

        <div>
          <label className="block font-medium mb-2">
            Diagnosis
          </label>

          <textarea
            name="diagnosis"
            value={form.diagnosis}
            onChange={onChange}
            rows={3}
            className="w-full border rounded-lg p-3"
            placeholder="Enter final diagnosis..."
          />
        </div>

        {/* INVESTIGATIONS */}

        <div>
          <label className="block font-medium mb-2">
            Investigations
          </label>

          <div className="flex flex-wrap gap-2 mb-3">

            {investigationOptions.map((test) => (
              <button
                key={test}
                type="button"
                onClick={() => addInvestigation(test)}
                className="px-3 py-1 text-sm rounded-full bg-blue-100 hover:bg-blue-600 hover:text-white transition"
              >
                {test}
              </button>
            ))}

            <button
              type="button"
              onClick={clearInvestigations}
              className="px-3 py-1 text-sm rounded-full bg-red-100 hover:bg-red-600 hover:text-white"
            >
              Clear
            </button>

          </div>

          <textarea
            name="investigations"
            value={form.investigations}
            onChange={onChange}
            rows={5}
            className="w-full border rounded-lg p-3"
            placeholder={`CBC
LFT
KFT
HbA1c
Urine Routine`}
          />
        </div>

        {/* ADVICE */}

        <div>
          <label className="block font-medium mb-2">
            Advice
          </label>

          <textarea
            name="advice"
            value={form.advice}
            onChange={onChange}
            rows={3}
            className="w-full border rounded-lg p-3"
            placeholder="Diet, rest, hydration..."
          />
        </div>

        {/* PRESCRIPTION NOTES */}

        <div>
          <label className="block font-medium mb-2">
            Prescription Notes
          </label>

          <textarea
            name="prescriptionNotes"
            value={form.prescriptionNotes}
            onChange={onChange}
            rows={3}
            className="w-full border rounded-lg p-3"
            placeholder="Special instructions..."
          />
        </div>

      </div>

    </div>
  );
}