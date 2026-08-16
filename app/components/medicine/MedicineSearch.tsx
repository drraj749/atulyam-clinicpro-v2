"use client";

import { useEffect, useRef, useState } from "react";

type Medicine = {
  id: number;
  medicineCode: string;
  genericName: string;
  brandName?: string;
  strength?: string;
  dosageForm?: string;
  route?: string;
  manufacturer?: string;
};

type Props = {
  value: string;
  onSelect: (medicine: Medicine) => void;
};

export default function MedicineSearch({
  value,
  onSelect,
}: Props) {
  const [query, setQuery] = useState(value);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showList, setShowList] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  async function loadMedicines() {
    try {
      const response = await fetch("/api/medicines");
      const result = await response.json();

      if (response.ok) {
        setMedicines(result.medicines);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowList(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, []);

  const filtered = medicines.filter((medicine) => {
    const text = (
      medicine.genericName +
      " " +
      (medicine.brandName || "") +
      " " +
      (medicine.medicineCode || "") +
      " " +
      (medicine.manufacturer || "")
    ).toLowerCase();

    return text.includes(query.toLowerCase());
  });

  return (
    <div
      className="relative"
      ref={wrapperRef}
    >
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowList(true);
        }}
        onFocus={() => setShowList(true)}
        placeholder="Search Medicine..."
        className="border rounded-lg p-3 w-full"
      />

      {showList && query.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
          {filtered.length === 0 ? (
            <div className="p-3 text-gray-500">
              No medicine found.
            </div>
          ) : (
            filtered.map((medicine) => (
              <button
                key={medicine.id}
                type="button"
                onClick={() => {
                  setQuery(
                    medicine.brandName || medicine.genericName
                  );

                  setShowList(false);

                  onSelect(medicine);
                }}
                className="w-full text-left p-3 hover:bg-blue-50 border-b"
              >
                <div className="font-semibold">
                  {medicine.brandName || medicine.genericName}
                </div>

                <div className="text-sm text-gray-600">
                  {medicine.genericName}
                </div>

                <div className="text-xs text-gray-500">
                  {medicine.strength || ""}{" "}
                  {medicine.dosageForm || ""}
                  {medicine.route ? ` • ${medicine.route}` : ""}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}