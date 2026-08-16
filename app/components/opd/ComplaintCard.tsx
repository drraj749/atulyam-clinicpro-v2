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

export default function ComplaintCard({
  form,
  onChange,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-2xl font-bold text-blue-900 mb-6">
        Patient History
      </h2>

      <div className="space-y-5">

        <div>
          <label className="block font-medium mb-2">
            Chief Complaint
          </label>

          <textarea
            name="complaint"
            value={form.complaint}
            onChange={onChange}
            rows={3}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            History of Present Illness
          </label>

          <textarea
            name="historyOfPresentIllness"
            value={form.historyOfPresentIllness}
            onChange={onChange}
            rows={3}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <label className="block font-medium mb-2">
              Past History
            </label>

            <textarea
              name="pastHistory"
              value={form.pastHistory}
              onChange={onChange}
              rows={3}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Drug History
            </label>

            <textarea
              name="drugHistory"
              value={form.drugHistory}
              onChange={onChange}
              rows={3}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Family History
            </label>

            <textarea
              name="familyHistory"
              value={form.familyHistory}
              onChange={onChange}
              rows={3}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Personal History
            </label>

            <textarea
              name="personalHistory"
              value={form.personalHistory}
              onChange={onChange}
              rows={3}
              className="w-full border rounded-lg p-3"
            />
          </div>

        </div>

        <div>
          <label className="block font-medium mb-2">
            Allergy
          </label>

          <textarea
            name="allergy"
            value={form.allergy}
            onChange={onChange}
            rows={2}
            className="w-full border rounded-lg p-3"
          />
        </div>

      </div>

    </div>
  );
}