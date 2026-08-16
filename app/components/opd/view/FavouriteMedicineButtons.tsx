"use client";

import { favouriteMedicines } from "@/app/lib/favouriteMedicines";

type Props = {
  onSelect: (items: any[]) => void;
};

export default function FavouriteMedicineButtons({
  onSelect,
}: Props) {
  const buttons = [
    { key: "fever", label: "Fever" },
    { key: "uri", label: "URI" },
    { key: "gastritis", label: "Gastritis" },
    { key: "diabetes", label: "Diabetes" },
    { key: "hypertension", label: "Hypertension" },
  ] as const;

  return (
    <div className="mb-6">

      <h3 className="font-semibold mb-3">
        Favourite Prescriptions
      </h3>

      <div className="flex flex-wrap gap-3">

        {buttons.map((button) => (

          <button
            key={button.key}
            type="button"
            onClick={() =>
              onSelect(favouriteMedicines[button.key])
            }
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            {button.label}
          </button>

        ))}

      </div>

    </div>
  );
}