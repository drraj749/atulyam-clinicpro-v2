"use client";

import { OPDForm } from "@/types/opd";

type Props = {
  form: OPDForm;
  onChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
};

export default function ExaminationCard({
  form,
  onChange,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-2xl font-bold text-blue-900 mb-6">
        Clinical Examination
      </h2>

      <div className="space-y-5">

        <div>
          <label className="block font-medium mb-2">
            General Examination
          </label>

          <textarea
            name="generalExamination"
            value={form.generalExamination}
            onChange={onChange}
            rows={3}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block font-medium mb-2">
              CVS
            </label>

            <textarea
              name="cvs"
              value={form.cvs}
              onChange={onChange}
              rows={3}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              RS
            </label>

            <textarea
              name="rs"
              value={form.rs}
              onChange={onChange}
              rows={3}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              CNS
            </label>

            <textarea
              name="cns"
              value={form.cns}
              onChange={onChange}
              rows={3}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              P/A
            </label>

            <textarea
              name="pa"
              value={form.pa}
              onChange={onChange}
              rows={3}
              className="w-full border rounded-lg p-3"
            />
          </div>

        </div>

        <div>
          <label className="block font-medium mb-2">
            Local Examination
          </label>

          <textarea
            name="localExamination"
            value={form.localExamination}
            onChange={onChange}
            rows={3}
            className="w-full border rounded-lg p-3"
          />
        </div>

      </div>

    </div>
  );
}