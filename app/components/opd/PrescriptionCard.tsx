"use client";

import { useEffect, useRef, useState } from "react";

import { OPDForm, MedicineRow } from "@/types/opd";
import { Medicine } from "@/types/medicine";

type Props = {
  form: OPDForm;
  setForm: React.Dispatch<React.SetStateAction<OPDForm>>;
};

const emptyMedicine = (): MedicineRow => ({
  clientId: crypto.randomUUID(),

  medicineName: "",
  strength: "",

  dosage: "",
  frequency: "",
  duration: "",
  instruction: "",

  morning: false,
  afternoon: false,
  night: false,

  beforeFood: false,
  afterFood: false,

  sos: false,

  quantity: "",
  route: "Oral",
});

/* ---------------------------------------
   FREQUENCY → DOSES PER DAY
---------------------------------------- */

const frequencyMap: Record<string, number> = {
  "1-0-0": 1,
  "0-1-0": 1,
  "0-0-1": 1,

  "1-1-0": 2,
  "1-0-1": 2,
  "0-1-1": 2,

  "1-1-1": 3,

  "2-2-2": 6,
};

/* ---------------------------------------
   CALCULATE QUANTITY
---------------------------------------- */

function calculateQuantity(
  frequency: string,
  duration: string,
  dosage: string
): string {
  if (!frequency || !duration || !dosage) {
    return "";
  }

  /* -----------------------------
     DAYS
  ----------------------------- */

  const daysMatch = duration.match(/\d+/);

  const days = daysMatch
    ? Number(daysMatch[0])
    : 0;

  if (!days) {
    return "";
  }

  /* -----------------------------
     DOSAGE AMOUNT
  ----------------------------- */

  let dosageAmount = 1;

  if (dosage.startsWith("½")) {
    dosageAmount = 0.5;
  } else {
    const dosageMatch = dosage.match(
      /^\d+(?:\.\d+)?/
    );

    if (dosageMatch) {
      dosageAmount = Number(
        dosageMatch[0]
      );
    }
  }

  /* -----------------------------
     ONE TIME ONLY
  ----------------------------- */

  if (frequency === "ONE_TIME") {
    return String(dosageAmount);
  }

  /* -----------------------------
     ONCE WEEKLY
  ----------------------------- */

  if (frequency === "ONCE_WEEKLY") {
    const numberOfDoses = Math.ceil(
      days / 7
    );

    return String(
      numberOfDoses * dosageAmount
    );
  }

  /* -----------------------------
     NORMAL FREQUENCY
  ----------------------------- */

  const dosesPerDay =
    frequencyMap[frequency] ?? 0;

  if (!dosesPerDay) {
    return "";
  }

  const quantity =
    days *
    dosesPerDay *
    dosageAmount;

  return String(quantity);
}

/* ---------------------------------------
   COMPONENT
---------------------------------------- */

export default function PrescriptionCard({
  form,
  setForm,
}: Props) {
  const [medicineList, setMedicineList] =
    useState<Medicine[]>([]);

  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);

  const [highlightedIndex, setHighlightedIndex] =
    useState(0);

  const searchTimeout =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const dropdownRef =
    useRef<HTMLDivElement | null>(null);

  const medicineInputRefs =
    useRef<(HTMLInputElement | null)[]>([]);

  /* ---------------------------------------
     LOAD MEDICINES
  ---------------------------------------- */

  async function loadMedicines(
    search: string
  ) {
    try {
      const res = await fetch(
        `/api/medicines?search=${encodeURIComponent(
          search
        )}`
      );

      if (!res.ok) {
        setMedicineList([]);
        return;
      }

      const json = await res.json();

      setMedicineList(
        Array.isArray(json.medicines)
          ? json.medicines
          : []
      );
    } catch (error) {
      console.error(
        "MEDICINE SEARCH ERROR:",
        error
      );

      setMedicineList([]);
    }
  }

  /* ---------------------------------------
     CLOSE DROPDOWN ON OUTSIDE CLICK
  ---------------------------------------- */

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      const target =
        event.target as Node;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setActiveIndex(null);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* ---------------------------------------
     UPDATE MEDICINE
  ---------------------------------------- */

  function updateMedicine(
    index: number,
    field: keyof MedicineRow,
    value: string | boolean
  ) {
    setForm((prev) => {
      const medicines = [...prev.medicines];

      const oldMedicine = medicines[index];

      const medicine: MedicineRow = {
        clientId:
          oldMedicine?.clientId ??
          crypto.randomUUID(),

        medicineName:
          oldMedicine?.medicineName ?? "",

        strength:
          oldMedicine?.strength ?? "",

        dosage:
          oldMedicine?.dosage ?? "",

        frequency:
          oldMedicine?.frequency ?? "",

        duration:
          oldMedicine?.duration ?? "",

        instruction:
          oldMedicine?.instruction ?? "",

        quantity:
          oldMedicine?.quantity ?? "",

        route:
          oldMedicine?.route ?? "Oral",

        morning:
          oldMedicine?.morning ?? false,

        afternoon:
          oldMedicine?.afternoon ?? false,

        night:
          oldMedicine?.night ?? false,

        beforeFood:
          oldMedicine?.beforeFood ?? false,

        afterFood:
          oldMedicine?.afterFood ?? false,

        sos:
          oldMedicine?.sos ?? false,
      };

      /* -----------------------------
         BEFORE / AFTER FOOD
      ----------------------------- */

      if (field === "beforeFood") {
        medicine.beforeFood =
          value as boolean;

        if (value === true) {
          medicine.afterFood = false;
        }
      } else if (field === "afterFood") {
        medicine.afterFood =
          value as boolean;

        if (value === true) {
          medicine.beforeFood = false;
        }
      } else {
  if (field === "medicineName") {
    medicine.medicineName =
      value as string;
  } else if (field === "strength") {
    medicine.strength =
      value as string;
  } else if (field === "dosage") {
    medicine.dosage =
      value as string;
  } else if (field === "frequency") {
    medicine.frequency =
      value as string;
  } else if (field === "duration") {
    medicine.duration =
      value as string;
  } else if (field === "instruction") {
    medicine.instruction =
      value as string;
  } else if (field === "route") {
    medicine.route =
      value as MedicineRow["route"];
  } else if (field === "morning") {
    medicine.morning =
      value as boolean;
  } else if (field === "afternoon") {
    medicine.afternoon =
      value as boolean;
  } else if (field === "night") {
    medicine.night =
      value as boolean;
  } else if (field === "sos") {
    medicine.sos =
      value as boolean;
  }
}

      /* -----------------------------
         AUTOMATIC QUANTITY
      ----------------------------- */

      if (
        field === "dosage" ||
        field === "frequency" ||
        field === "duration"
      ) {
        medicine.quantity =
          calculateQuantity(
            medicine.frequency,
            medicine.duration,
            medicine.dosage
          );
      }

      medicines[index] = medicine;

      return {
        ...prev,
        medicines,
      };
    });
  }

  /* ---------------------------------------
     SELECT MEDICINE FROM SEARCH
  ---------------------------------------- */

  function selectMedicine(
    index: number,
    medicine: Medicine
  ) {
    setForm((prev) => {
      const medicines = [...prev.medicines];

      const current =
        medicines[index] ??
        emptyMedicine();

      medicines[index] = {
  ...current,

  medicineName:
    medicine.brandName ||
    medicine.genericName ||
    "",

  strength:
    medicine.strength ?? "",

  route:
    "Oral",
};

      return {
        ...prev,
        medicines,
      };
    });

    setActiveIndex(null);
    setHighlightedIndex(0);
    setMedicineList([]);

    setTimeout(() => {
      medicineInputRefs.current[
        index
      ]?.focus();
    }, 0);
  }

  /* ---------------------------------------
     ADD MEDICINE
  ---------------------------------------- */

  function addMedicine() {
    setForm((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        emptyMedicine(),
      ],
    }));

    setTimeout(() => {
      const newIndex =
        form.medicines.length;

      medicineInputRefs.current[
        newIndex
      ]?.focus();
    }, 50);
  }

  /* ---------------------------------------
     REMOVE MEDICINE
  ---------------------------------------- */

  function removeMedicine(
    index: number
  ) {
    setForm((prev) => ({
      ...prev,
      medicines:
        prev.medicines.filter(
          (_, i) => i !== index
        ),
    }));

    setActiveIndex(null);
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-4">

        <h2 className="text-2xl font-bold text-blue-900">
          Prescription
        </h2>

        <button
          type="button"
          onClick={addMedicine}
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Add Medicine
        </button>

      </div>

      {/* EMPTY STATE */}

      {form.medicines.length === 0 && (
        <div className="text-center text-gray-500 py-8 border rounded-lg">
          Click "+ Add Medicine" to start
          prescription.
        </div>
      )}

      {/* MEDICINES */}

      <div className="space-y-5">

        {form.medicines.map(
          (medicine, index) => (

          <div
            key={
              medicine.clientId ?? index
            }
            className="border rounded-xl p-5 space-y-4 bg-gray-50"
          >

            {/* MEDICINE HEADER */}

            <div className="flex justify-between items-center">

              <h3 className="font-semibold">
                Medicine {index + 1}
              </h3>

              <button
                type="button"
                onClick={() =>
                  removeMedicine(index)
                }
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                🗑 Delete
              </button>

            </div>

            {/* MAIN MEDICINE ROW */}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">

              {/* MEDICINE SEARCH */}

              <div
                className="relative"
                ref={
                  activeIndex === index
                    ? dropdownRef
                    : null
                }
              >

                <input
                  ref={(el) => {
                    medicineInputRefs.current[
                      index
                    ] = el;
                  }}
                  placeholder="Search Medicine"
                  value={
                    medicine.medicineName ??
                    ""
                  }
                  onFocus={() => {
                    setActiveIndex(index);
                    setHighlightedIndex(0);

                    if (
                      medicine.medicineName.trim()
                    ) {
                      loadMedicines(
                        medicine.medicineName
                      );
                    }
                  }}
                  onKeyDown={(e) => {

                    if (
                      activeIndex !== index
                    ) {
                      return;
                    }

                    /* Arrow Down */

                    if (
                      e.key === "ArrowDown"
                    ) {
                      e.preventDefault();

                      setHighlightedIndex(
                        (previous) =>
                          Math.min(
                            previous + 1,
                            Math.max(
                              medicineList.length -
                                1,
                              0
                            )
                          )
                      );

                      return;
                    }

                    /* Arrow Up */

                    if (
                      e.key === "ArrowUp"
                    ) {
                      e.preventDefault();

                      setHighlightedIndex(
                        (previous) =>
                          Math.max(
                            previous - 1,
                            0
                          )
                      );

                      return;
                    }

                    /* Enter / Tab */

                    if (
                      e.key === "Enter" ||
                      e.key === "Tab"
                    ) {
                      if (
                        medicineList[
                          highlightedIndex
                        ]
                      ) {
                        e.preventDefault();

                        selectMedicine(
                          index,
                          medicineList[
                            highlightedIndex
                          ]
                        );
                      }

                      return;
                    }

                    /* Escape */

                    if (
                      e.key === "Escape"
                    ) {
                      e.preventDefault();

                      setHighlightedIndex(0);
                      setActiveIndex(null);
                      setMedicineList([]);
                    }
                  }}
                  onChange={(e) => {

                    const value =
                      e.target.value;

                    updateMedicine(
                      index,
                      "medicineName",
                      value
                    );

                    setActiveIndex(index);
                    setHighlightedIndex(0);

                    if (
                      searchTimeout.current
                    ) {
                      clearTimeout(
                        searchTimeout.current
                      );
                    }

                    if (!value.trim()) {
                      setMedicineList([]);
                      return;
                    }

                    searchTimeout.current =
                      setTimeout(() => {
                        loadMedicines(value);
                      }, 300);
                  }}
                  className="border rounded-lg p-2 w-full"
                />

                {/* SEARCH DROPDOWN */}

                {activeIndex === index &&
                  medicine.medicineName.trim() !==
                    "" &&
                  medicineList.length > 0 && (

                  <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-56 overflow-y-auto">

                    {medicineList.map(
                      (m, mIndex) => (

                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          selectMedicine(
                            index,
                            m
                          )
                        }
                        className={`w-full text-left px-3 py-2 border-b ${
                          highlightedIndex ===
                          mIndex
                            ? "bg-blue-100"
                            : "hover:bg-blue-50"
                        }`}
                      >

                        <div className="font-medium">
                          {m.brandName ||
                            m.genericName}
                        </div>

                        <div className="text-xs text-gray-500">
                          {m.genericName}

                          {m.strength
                            ? ` • ${m.strength}`
                            : ""}

                          {m.dosageForm
                            ? ` • ${m.dosageForm}`
                            : ""}
                        </div>

                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* DOSAGE */}

              <select
                value={
                  medicine.dosage ?? ""
                }
                onChange={(e) =>
                  updateMedicine(
                    index,
                    "dosage",
                    e.target.value
                  )
                }
                className="border rounded-lg p-2 w-full"
              >
                <option value="">
                  Select Dosage
                </option>

                <option value="½ Tablet">
                  ½ Tablet
                </option>

                <option value="1 Tablet">
                  1 Tablet
                </option>

                <option value="2 Tablets">
                  2 Tablets
                </option>

                <option value="5 ml">
                  5 ml
                </option>

                <option value="10 ml">
                  10 ml
                </option>

                <option value="1 Capsule">
                  1 Capsule
                </option>

                <option value="1 Puff">
                  1 Puff
                </option>

                <option value="2 Puffs">
                  2 Puffs
                </option>

                <option value="1 Drop">
                  1 Drop
                </option>

                <option value="2 Drops">
                  2 Drops
                </option>

                <option value="Apply Thin Layer">
                  Apply Thin Layer
                </option>
              </select>

              {/* FREQUENCY */}

              <select
                value={
                  medicine.frequency ?? ""
                }
                onChange={(e) =>
                  updateMedicine(
                    index,
                    "frequency",
                    e.target.value
                  )
                }
                className="border rounded-lg p-2 w-full"
              >
                <option value="">
                  Select Frequency
                </option>

                <option value="1-0-0">
                  1-0-0 (Morning)
                </option>

                <option value="0-1-0">
                  0-1-0 (Afternoon)
                </option>

                <option value="0-0-1">
                  0-0-1 (Night)
                </option>

                <option value="1-0-1">
                  1-0-1 (Morning + Night)
                </option>

                <option value="1-1-0">
                  1-1-0 (Morning + Afternoon)
                </option>

                <option value="0-1-1">
                  0-1-1 (Afternoon + Night)
                </option>

                <option value="1-1-1">
                  1-1-1 (Three Times)
                </option>

                <option value="2-2-2">
                  2-2-2
                </option>

                <option value="ONCE_WEEKLY">
                  Once Weekly
                </option>

                <option value="ONE_TIME">
                  One Time Only
                </option>
              </select>

              {/* DURATION */}

              <select
                value={
                  medicine.duration ?? ""
                }
                onChange={(e) =>
                  updateMedicine(
                    index,
                    "duration",
                    e.target.value
                  )
                }
                className="border rounded-lg p-2 w-full"
              >
                <option value="">
                  Select Duration
                </option>

                <option value="1 Day">
                  1 Day
                </option>

                <option value="3 Days">
                  3 Days
                </option>

                <option value="5 Days">
                  5 Days
                </option>

                <option value="7 Days">
                  7 Days
                </option>

                <option value="10 Days">
                  10 Days
                </option>

                <option value="14 Days">
                  14 Days
                </option>

                <option value="21 Days">
                  21 Days
                </option>

                <option value="30 Days">
                  30 Days
                </option>

                <option value="60 Days">
                  60 Days
                </option>

                <option value="90 Days">
                  90 Days
                </option>

                <option value="Continue">
                  Continue
                </option>
              </select>

              {/* ROUTE */}

              <select
                value={
                  medicine.route ?? "Oral"
                }
                onChange={(e) =>
                  updateMedicine(
                    index,
                    "route",
                    e.target.value as MedicineRow["route"]
                  )
                }
                className="border rounded-lg p-2 w-full"
              >
                <option value="Oral">
                  Oral
                </option>

                <option value="IV">
                  IV
                </option>

                <option value="IM">
                  IM
                </option>

                <option value="SC">
                  SC
                </option>

                <option value="Topical">
                  Topical
                </option>

                <option value="Inhalation">
                  Inhalation
                </option>

                <option value="Eye">
                  Eye
                </option>

                <option value="Ear">
                  Ear
                </option>

                <option value="Nasal">
                  Nasal
                </option>

                <option value="Rectal">
                  Rectal
                </option>

                <option value="Vaginal">
                  Vaginal
                </option>
              </select>

            </div>

            {/* SECOND ROW */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

              {/* SCHEDULE */}

              <div className="font-medium text-blue-700">
                Schedule:{" "}

                {medicine.frequency ===
                "ONCE_WEEKLY"
                  ? "Once Weekly"
                  : medicine.frequency ===
                    "ONE_TIME"
                  ? "One Time Only"
                  : medicine.frequency ||
                    "-"}
              </div>

              {/* QUANTITY */}

              <div className="font-medium">
                Quantity:{" "}

                {medicine.quantity !== ""
                  ? medicine.quantity
                  : "-"}
              </div>

              {/* BEFORE FOOD */}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    medicine.beforeFood
                  }
                  onChange={(e) =>
                    updateMedicine(
                      index,
                      "beforeFood",
                      e.target.checked
                    )
                  }
                />

                Before Food
              </label>

              {/* AFTER FOOD */}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    medicine.afterFood
                  }
                  onChange={(e) =>
                    updateMedicine(
                      index,
                      "afterFood",
                      e.target.checked
                    )
                  }
                />

                After Food
              </label>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}