"use client";

import { PrescriptionMedicine } from "@/app/types/prescription";

type Props = {
  index: number;
  medicine: PrescriptionMedicine;
  onChange: (
    value: PrescriptionMedicine
  ) => void;
  onRemove: () => void;
};

export default function MedicineRow({
  index,
  medicine,
  onChange,
  onRemove,
}: Props) {
  function update(
    field: keyof PrescriptionMedicine,
    value: any
  ) {
    onChange({
      ...medicine,
      [field]: value,
    });
  }

  return (
    <div className="border rounded-xl p-5 bg-gray-50">

      <div className="flex justify-between items-center mb-5">

        <h3 className="font-semibold text-blue-900">
          Medicine {index + 1}
        </h3>

        <button
          onClick={onRemove}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
        >
          Remove
        </button>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <input
          value={medicine.medicineName}
          onChange={(e) =>
            update("medicineName", e.target.value)
          }
          placeholder="Medicine"
          className="border rounded-lg p-2"
        />

        <input
          value={medicine.strength ?? ""}
          onChange={(e) =>
            update("strength", e.target.value)
          }
          placeholder="Strength"
          className="border rounded-lg p-2"
        />

        <input
          value={medicine.dosageForm ?? ""}
          onChange={(e) =>
            update("dosageForm", e.target.value)
          }
          placeholder="Dosage Form"
          className="border rounded-lg p-2"
        />

        <input
          value={medicine.duration}
          onChange={(e) =>
            update("duration", e.target.value)
          }
          placeholder="Duration"
          className="border rounded-lg p-2"
        />

      </div>

      <div className="grid grid-cols-3 gap-4 mt-5">

        <label className="flex items-center gap-2">

          <input
            type="checkbox"
            checked={medicine.morning}
            onChange={(e) =>
              update("morning", e.target.checked)
            }
          />

          Morning

        </label>

        <label className="flex items-center gap-2">

          <input
            type="checkbox"
            checked={medicine.afternoon}
            onChange={(e) =>
              update("afternoon", e.target.checked)
            }
          />

          Afternoon

        </label>

        <label className="flex items-center gap-2">

          <input
            type="checkbox"
            checked={medicine.night}
            onChange={(e) =>
              update("night", e.target.checked)
            }
          />

          Night

        </label>

      </div>

      <div className="grid grid-cols-3 gap-4 mt-5">

        <label className="flex items-center gap-2">

          <input
            type="checkbox"
            checked={medicine.beforeFood}
            onChange={(e) =>
              update("beforeFood", e.target.checked)
            }
          />

          Before Food

        </label>

        <label className="flex items-center gap-2">

          <input
            type="checkbox"
            checked={medicine.afterFood}
            onChange={(e) =>
              update("afterFood", e.target.checked)
            }
          />

          After Food

        </label>

        <label className="flex items-center gap-2">

          <input
            type="checkbox"
            checked={medicine.sos}
            onChange={(e) =>
              update("sos", e.target.checked)
            }
          />

          SOS

        </label>

      </div>

      <textarea
        value={medicine.instruction}
        onChange={(e) =>
          update("instruction", e.target.value)
        }
        placeholder="Instruction..."
        className="border rounded-lg p-3 w-full mt-5"
        rows={3}
      />

    </div>
  );
}