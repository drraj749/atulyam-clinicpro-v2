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

export default function VitalsCard({
  form,
  onChange,
}: Props) {
  function handleVitalChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    onChange(e);

    if (
      e.target.name === "height" ||
      e.target.name === "weight"
    ) {
      const height =
        e.target.name === "height"
          ? parseFloat(e.target.value)
          : parseFloat(form.height);

      const weight =
        e.target.name === "weight"
          ? parseFloat(e.target.value)
          : parseFloat(form.weight);

      if (
        !isNaN(height) &&
        height > 0 &&
        !isNaN(weight) &&
        weight > 0
      ) {
        const bmi = (
          weight /
          Math.pow(height / 100, 2)
        ).toFixed(1);

        onChange({
          target: {
            name: "bmi",
            value: bmi,
          },
        } as React.ChangeEvent<HTMLInputElement>);
      } else {
        onChange({
          target: {
            name: "bmi",
            value: "",
          },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">
        Vitals
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <label className="block mb-1 font-medium">
            BP
          </label>

          <input
            name="bp"
            value={form.bp}
            onChange={handleVitalChange}
            className="border rounded-lg p-2 w-full"
            placeholder="120/80"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Pulse
          </label>

          <input
            name="pulse"
            value={form.pulse}
            onChange={handleVitalChange}
            className="border rounded-lg p-2 w-full"
            placeholder="72"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Respiratory Rate
          </label>

          <input
            name="respiratoryRate"
            value={form.respiratoryRate}
            onChange={handleVitalChange}
            className="border rounded-lg p-2 w-full"
            placeholder="18"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Temperature
          </label>

          <input
            name="temperature"
            value={form.temperature}
            onChange={handleVitalChange}
            className="border rounded-lg p-2 w-full"
            placeholder="98.6"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            SpO₂
          </label>

          <input
            name="spo2"
            value={form.spo2}
            onChange={handleVitalChange}
            className="border rounded-lg p-2 w-full"
            placeholder="99"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Height (cm)
          </label>

          <input
            name="height"
            value={form.height}
            onChange={handleVitalChange}
            className="border rounded-lg p-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Weight (kg)
          </label>

          <input
            name="weight"
            value={form.weight}
            onChange={handleVitalChange}
            className="border rounded-lg p-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            BMI
          </label>

          <input
            name="bmi"
            value={form.bmi}
            readOnly
            className="border rounded-lg p-2 w-full bg-gray-100"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            RBS
          </label>

          <input
            name="randomBloodSugar"
            value={form.randomBloodSugar}
            onChange={handleVitalChange}
            className="border rounded-lg p-2 w-full"
            placeholder="mg/dL"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Pain Score
          </label>

          <input
            name="painScore"
            value={form.painScore}
            onChange={handleVitalChange}
            className="border rounded-lg p-2 w-full"
            placeholder="0-10"
          />
        </div>
      </div>
    </div>
  );
}