"use client";

import { useState } from "react";

type Medicine = {
  medicine: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
};

export default function PrescriptionCard() {
  const [items, setItems] = useState<Medicine[]>([
    {
      medicine: "",
      dose: "",
      frequency: "",
      duration: "",
      instructions: "",
    },
  ]);

  function update(
    index: number,
    field: keyof Medicine,
    value: string
  ) {
    const list = [...items];
    list[index][field] = value;
    setItems(list);
  }

  function addMedicine() {
    setItems([
      ...items,
      {
        medicine: "",
        dose: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
  }

  function removeMedicine(index: number) {
    if (items.length === 1) return;

    setItems(items.filter((_, i) => i !== index));
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-xl font-bold">
          Prescription
        </h2>

        <button
          type="button"
          onClick={addMedicine}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Medicine
        </button>

      </div>

      {items.map((item, index) => (

        <div
          key={index}
          className="border rounded-lg p-4 mb-5"
        >

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

            <input
              placeholder="Medicine"
              value={item.medicine}
              onChange={(e) =>
                update(index, "medicine", e.target.value)
              }
              className="border rounded-lg p-2"
            />

            <input
              placeholder="Dose"
              value={item.dose}
              onChange={(e) =>
                update(index, "dose", e.target.value)
              }
              className="border rounded-lg p-2"
            />

            <input
              placeholder="Frequency"
              value={item.frequency}
              onChange={(e) =>
                update(index, "frequency", e.target.value)
              }
              className="border rounded-lg p-2"
            />

            <input
              placeholder="Duration"
              value={item.duration}
              onChange={(e) =>
                update(index, "duration", e.target.value)
              }
              className="border rounded-lg p-2"
            />

            <button
              type="button"
              onClick={() => removeMedicine(index)}
              className="bg-red-600 text-white rounded-lg"
            >
              Remove
            </button>

          </div>

          <textarea
            placeholder="Instructions"
            value={item.instructions}
            onChange={(e) =>
              update(index, "instructions", e.target.value)
            }
            className="border rounded-lg p-2 w-full mt-4"
            rows={2}
          />

        </div>

      ))}

    </div>
  );
}