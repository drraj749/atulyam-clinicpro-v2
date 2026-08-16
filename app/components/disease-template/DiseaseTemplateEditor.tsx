"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import MedicineSearch from "@/app/components/medicine/MedicineSearch";
import type { PrescriptionMedicine } from "@/app/types/prescription";

function createMedicine(): PrescriptionMedicine {
  return {
    id: Date.now() + Math.random(),
    medicineId: null,

    medicineName: "",
    genericName: "",
    brandName: "",

    strength: "",
    dosageForm: "",

    dosage: "1 Tablet",
    frequency: "",
    
    morning: false,
    afternoon: false,
    night: false,

    beforeFood: false,
    afterFood: false,

    sos: false,

    duration: "",
    instruction: "",

    quantity: null,
    route: "",
  };
}

type Props = {
  mode: "create" | "edit";
  templateId?: number;
};

/* =========================================================
   FREQUENCY
========================================================= */

const frequencyOptions = [
  {
    value: "1-0-0",
    label: "1-0-0 (Morning)",
  },
  {
    value: "0-1-0",
    label: "0-1-0 (Afternoon)",
  },
  {
    value: "0-0-1",
    label: "0-0-1 (Night)",
  },
  {
    value: "1-1-0",
    label: "1-1-0 (Morning + Afternoon)",
  },
  {
    value: "1-0-1",
    label: "1-0-1 (Morning + Night)",
  },
  {
    value: "0-1-1",
    label: "0-1-1 (Afternoon + Night)",
  },
  {
    value: "1-1-1",
    label: "1-1-1 (Morning + Afternoon + Night)",
  },
  {
    value: "1-1-1-1",
    label: "1-1-1-1 (Four Times Daily)",
  },
  {
    value: "2-2-2",
    label: "2-2-2",
  },
  {
    value: "SOS",
    label: "SOS",
  },
  {
    value: "ONCE_WEEKLY",
    label: "Once Weekly",
  },
  {
    value: "ONE_TIME",
    label: "One Time Only",
  },
];

/* =========================================================
   DURATION
========================================================= */

const durationOptions = [
  "1 Day",
  "2 Days",
  "3 Days",
  "5 Days",
  "7 Days",
  "10 Days",
  "14 Days",
  "15 Days",
  "21 Days",
  "30 Days",
  "1 Month",
  "2 Months",
  "3 Months",
  "6 Months",
  "Continue",
];

/* =========================================================
   FREQUENCY → DOSES PER DAY
========================================================= */

const frequencyMap: Record<string, number> = {
  "1-0-0": 1,
  "0-1-0": 1,
  "0-0-1": 1,

  "1-1-0": 2,
  "1-0-1": 2,
  "0-1-1": 2,

  "1-1-1": 3,

  "1-1-1-1": 4,

  "2-2-2": 6,

  SOS: 0,

  ONCE_WEEKLY: 1,
  ONE_TIME: 1,
};

/* =========================================================
   DOSAGE → NUMERIC AMOUNT
========================================================= */

function getDosageAmount(dosage: string): number {
  const value = dosage.trim();

  if (!value) {
    return 1;
  }

  if (
    value.startsWith("½") ||
    value.startsWith("1/2")
  ) {
    return 0.5;
  }

  if (
    value.startsWith("¼") ||
    value.startsWith("1/4")
  ) {
    return 0.25;
  }

  const match = value.match(
    /^\d+(?:\.\d+)?/
  );

  if (match) {
    return Number(match[0]);
  }

  return 1;
}

/* =========================================================
   DURATION → DAYS
========================================================= */

function getDurationDays(
  duration: string
): number {
  const value = duration.trim();

  if (!value) {
    return 0;
  }

  const match = value.match(/\d+/);

  if (!match) {
    return 0;
  }

  const number = Number(match[0]);

  if (value.includes("Month")) {
    return number * 30;
  }

  return number;
}

/* =========================================================
   CALCULATE QUANTITY
========================================================= */

function calculateQuantity(
  frequency: string,
  duration: string,
  dosage: string
): number | null {
  const dosageAmount =
    getDosageAmount(dosage);

  /* -----------------------------
     ONE TIME ONLY
  ----------------------------- */

  if (frequency === "ONE_TIME") {
    return dosageAmount;
  }

  /* -----------------------------
     SOS
  ----------------------------- */

  if (frequency === "SOS") {
    return null;
  }

  const days =
    getDurationDays(duration);

  if (!days) {
    return null;
  }

  /* -----------------------------
     ONCE WEEKLY
  ----------------------------- */

  if (frequency === "ONCE_WEEKLY") {
    const numberOfDoses =
      Math.ceil(days / 7);

    return (
      numberOfDoses * dosageAmount
    );
  }

  /* -----------------------------
     NORMAL FREQUENCY
  ----------------------------- */

  const dosesPerDay =
    frequencyMap[frequency] ?? 0;

  if (!dosesPerDay) {
    return null;
  }

  return (
    days *
    dosesPerDay *
    dosageAmount
  );
}

/* =========================================================
   CONVERT NUMBER
========================================================= */

function cleanQuantity(
  quantity: number | null
) {
  if (quantity === null) {
    return null;
  }

  if (Number.isInteger(quantity)) {
    return quantity;
  }

  return Number(
    quantity.toFixed(2)
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function DiseaseTemplateEditor({
  mode,
  templateId,
}: Props) {
  const router = useRouter();

  const [name, setName] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [investigations, setInvestigations] =
    useState("");

  const [advice, setAdvice] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [medicines, setMedicines] =
    useState<PrescriptionMedicine[]>([
      createMedicine(),
    ]);

  const [saving, setSaving] =
    useState(false);

  /* =========================================================
     LOAD TEMPLATE
  ========================================================= */

  useEffect(() => {
    if (
      mode === "edit" &&
      templateId
    ) {
      loadTemplate();
    }
  }, [mode, templateId]);

  async function loadTemplate() {
    try {
      const res = await fetch(
        `/api/disease-templates/${templateId}`
      );

      const data =
        await res.json();

      if (!data.success) {
        alert(
          data.message ||
            "Unable to load template."
        );
        return;
      }

      const t =
        data.template;

      setName(
        t.name ?? ""
      );

      setCategory(
        t.category ?? ""
      );

      setInvestigations(
        t.investigations ?? ""
      );

      setAdvice(
        t.advice ?? ""
      );

      setNotes(
        t.notes ?? ""
      );

      if (
        t.medicines &&
        t.medicines.length > 0
      ) {
        setMedicines(
          t.medicines.map(
            (m: any) => ({
              id: m.id,

              medicineId:
                null,

              medicineName:
                m.medicineName ??
                "",

              genericName:
                "",

              brandName:
                "",

              strength:
                m.strength ??
                "",

              dosageForm:
                "",

              dosage:
                m.dosage ??
                "1 Tablet",

              frequency:
                m.frequency ??
                "",

              morning:
                Boolean(
                  m.morning
                ),

              afternoon:
                Boolean(
                  m.afternoon
                ),

              night:
                Boolean(
                  m.night
                ),

              beforeFood:
                Boolean(
                  m.beforeFood
                ),

              afterFood:
                Boolean(
                  m.afterFood
                ),

              sos:
                Boolean(
                  m.sos
                ),

              duration:
                m.duration ??
                "",

              instruction:
                m.instruction ??
                "",

              quantity:
                m.quantity !==
                  null &&
                m.quantity !==
                  undefined
                  ? Number(
                      m.quantity
                    )
                  : calculateQuantity(
                      m.frequency ??
                        "",
                      m.duration ??
                        "",
                      m.dosage ??
                        "1 Tablet"
                    ),

              route:
                m.route ??
                "Oral",
            })
          )
        );
      }
    } catch (error) {
      console.error(
        "LOAD TEMPLATE ERROR:",
        error
      );

      alert(
        "Unable to load template."
      );
    }
  }

  /* =========================================================
     UPDATE MEDICINE
  ========================================================= */

  function updateMedicine(
    index: number,
    medicine: PrescriptionMedicine
  ) {
    const copy =
      [...medicines];

    copy[index] =
      medicine;

    setMedicines(copy);
  }

  /* =========================================================
     UPDATE MEDICINE FIELD
  ========================================================= */

  function updateMedicineField(
    index: number,
    field: string,
    value: any
  ) {
    setMedicines(
      (previous) => {
        const copy =
          [...previous];

        const current =
          {
            ...copy[index],
            [field]: value,
          };

        /* -------------------------
           FOOD
        ------------------------- */

        if (
          field ===
          "beforeFood" &&
          value === true
        ) {
          current.afterFood =
            false;
        }

        if (
          field ===
          "afterFood" &&
          value === true
        ) {
          current.beforeFood =
            false;
        }

        /* -------------------------
           FREQUENCY → CHECKBOXES
        ------------------------- */

        if (
          field ===
          "frequency"
        ) {
          const frequency =
            String(value);

          current.frequency =
            frequency;

          if (
            frequency ===
              "1-0-0"
          ) {
            current.morning =
              true;
            current.afternoon =
              false;
            current.night =
              false;
          }

          else if (
            frequency ===
              "0-1-0"
          ) {
            current.morning =
              false;
            current.afternoon =
              true;
            current.night =
              false;
          }

          else if (
            frequency ===
              "0-0-1"
          ) {
            current.morning =
              false;
            current.afternoon =
              false;
            current.night =
              true;
          }

          else if (
            frequency ===
              "1-1-0"
          ) {
            current.morning =
              true;
            current.afternoon =
              true;
            current.night =
              false;
          }

          else if (
            frequency ===
              "1-0-1"
          ) {
            current.morning =
              true;
            current.afternoon =
              false;
            current.night =
              true;
          }

          else if (
            frequency ===
              "0-1-1"
          ) {
            current.morning =
              false;
            current.afternoon =
              true;
            current.night =
              true;
          }

          else if (
            frequency ===
              "1-1-1"
          ) {
            current.morning =
              true;
            current.afternoon =
              true;
            current.night =
              true;
          }

          else {
            current.morning =
              false;
            current.afternoon =
              false;
            current.night =
              false;
          }
        }

        /* -------------------------
           RECALCULATE QUANTITY
        ------------------------- */

        if (
          field ===
            "dosage" ||
          field ===
            "frequency" ||
          field ===
            "duration"
        ) {
          current.quantity =
            cleanQuantity(
              calculateQuantity(
                current.frequency ??
                  "",
                current.duration ??
                  "",
                current.dosage ??
                  "1 Tablet"
              )
            );
        }

        copy[index] =
          current;

        return copy;
      }
    );
  }

  /* =========================================================
     MEDICINE SELECTED
  ========================================================= */

  function selectMedicine(
    index: number,
    selected: any
  ) {
    setMedicines(
      (previous) => {
        const copy =
          [...previous];

        const current =
          copy[index];

        copy[index] = {
          ...current,

          medicineId:
            selected.id,

          medicineName:
            selected.brandName ||
            selected.genericName ||
            "",

          genericName:
            selected.genericName ||
            "",

          brandName:
            selected.brandName ||
            "",

          strength:
            selected.strength ||
            "",

          dosageForm:
            selected.dosageForm ||
            "",

          route:
            selected.route ||
            "Oral",

          /* Default dosage */
          dosage:
            current.dosage ||
            "1 Tablet",

          /* Keep existing
             frequency/duration */
          frequency:
            current.frequency ||
            "",

          duration:
            current.duration ||
            "",

          quantity:
            calculateQuantity(
              current.frequency ||
                "",
              current.duration ||
                "",
              current.dosage ||
                "1 Tablet"
            ),
        };

        return copy;
      }
    );
  }

  /* =========================================================
     ADD MEDICINE
  ========================================================= */

  function addMedicine() {
    setMedicines(
      (previous) => [
        ...previous,
        createMedicine(),
      ]
    );
  }

  /* =========================================================
     REMOVE MEDICINE
  ========================================================= */

  function removeMedicine(
    index: number
  ) {
    setMedicines(
      (previous) => {
        const copy =
          [...previous];

        copy.splice(
          index,
          1
        );

        if (
          copy.length === 0
        ) {
          copy.push(
            createMedicine()
          );
        }

        return copy;
      }
    );
  }

  /* =========================================================
     SAVE TEMPLATE
  ========================================================= */

  async function saveTemplate() {
    if (saving) {
      return;
    }

    if (!name.trim()) {
      alert(
        "Template name is required."
      );
      return;
    }

    setSaving(true);

    try {
      const response =
        await fetch(
          mode === "create"
            ? "/api/disease-templates"
            : `/api/disease-templates/${templateId}`,
          {
            method:
              mode === "create"
                ? "POST"
                : "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                name:
                  name.trim(),

                category:
                  category.trim(),

                investigations:
                  investigations.trim(),

                advice:
                  advice.trim(),

                notes:
                  notes.trim(),

                medicines:
                  medicines
                    .filter(
                      (m) =>
                        m.medicineName?.trim()
                    )
                    .map(
                      (m) => ({
                        medicineName:
                          m.medicineName,

                        strength:
                          m.strength,

                        dosage:
                          m.dosage,

                        frequency:
                          m.frequency,

                        duration:
                          m.duration,

                        instruction:
                          m.instruction,

                        morning:
                          Boolean(
                            m.morning
                          ),

                        afternoon:
                          Boolean(
                            m.afternoon
                          ),

                        night:
                          Boolean(
                            m.night
                          ),

                        beforeFood:
                          Boolean(
                            m.beforeFood
                          ),

                        afterFood:
                          Boolean(
                            m.afterFood
                          ),

                        sos:
                          Boolean(
                            m.sos
                          ),

                        quantity:
                          m.quantity !==
                            null &&
                          m.quantity !==
                            undefined
                            ? Number(
                                m.quantity
                              )
                            : null,

                        route:
                          m.route ||
                          "Oral",
                      })
                    ),
              }),
          }
        );

      const result =
        await response.json();

      if (!response.ok ||
          !result.success) {
        alert(
          result.message ||
            "Unable to save template."
        );
        return;
      }

      alert(
        mode === "create"
          ? "Disease Template created successfully."
          : "Disease Template updated successfully."
      );

      router.push(
        "/disease-templates"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "SAVE TEMPLATE ERROR:",
        error
      );

      alert(
        "Unable to save template."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="bg-white rounded-xl shadow p-6">

      {/* =========================
          TEMPLATE DETAILS
      ========================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        <input
          className="border rounded-lg p-3"
          placeholder="Disease Template Name"
          value={name}
          onChange={(e) =>
            setName(
              e.target.value
            )
          }
        />

        <input
          className="border rounded-lg p-3"
          placeholder="Category"
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value
            )
          }
        />

      </div>

      {/* =========================
          MEDICINES HEADER
      ========================= */}

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold text-blue-900">
          Medicines
        </h2>

        <button
          type="button"
          onClick={
            addMedicine
          }
          className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg"
        >
          + Add Medicine
        </button>

      </div>

      {/* =========================
          MEDICINES
      ========================= */}

      <div className="space-y-6">

        {medicines.map(
          (
            medicine,
            index
          ) => (

            <div
              key={
                medicine.id
              }
              className="border rounded-xl p-5 bg-gray-50 space-y-4"
            >

              {/* HEADER */}

              <div className="flex justify-between items-center">

                <h3 className="font-semibold text-lg">
                  Medicine #
                  {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    removeMedicine(
                      index
                    )
                  }
                  className="text-red-600 font-medium"
                >
                  Remove
                </button>

              </div>

              {/* MEDICINE SEARCH */}

              <MedicineSearch
                value={
                  medicine.medicineName
                }
                onSelect={(
                  selected
                ) =>
                  selectMedicine(
                    index,
                    selected
                  )
                }
              />

              {/* =========================
                  MEDICINE INFORMATION
              ========================= */}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">

                {/* STRENGTH */}

                <input
                  className="border rounded-lg p-2 bg-gray-100"
                  placeholder="Strength"
                  value={
                    medicine.strength ??
                    ""
                  }
                  readOnly
                />

                {/* DOSAGE */}

                <input
                  className="border rounded-lg p-2"
                  placeholder="Dosage"
                  value={
                    medicine.dosage ??
                    ""
                  }
                  onChange={(e) =>
                    updateMedicineField(
                      index,
                      "dosage",
                      e.target.value
                    )
                  }
                />

                {/* FREQUENCY */}

                <select
                  className="border rounded-lg p-2"
                  value={
                    medicine.frequency ??
                    ""
                  }
                  onChange={(e) =>
                    updateMedicineField(
                      index,
                      "frequency",
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Frequency
                  </option>

                  {frequencyOptions.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {
                          option.label
                        }
                      </option>
                    )
                  )}

                </select>

                {/* DURATION */}

                <select
                  className="border rounded-lg p-2"
                  value={
                    medicine.duration ??
                    ""
                  }
                  onChange={(e) =>
                    updateMedicineField(
                      index,
                      "duration",
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Duration
                  </option>

                  {durationOptions.map(
                    (duration) => (
                      <option
                        key={
                          duration
                        }
                        value={
                          duration
                        }
                      >
                        {
                          duration
                        }
                      </option>
                    )
                  )}

                </select>

                {/* QUANTITY */}

                <input
                  type="number"
                  className="border rounded-lg p-2 bg-gray-100"
                  placeholder="Quantity"
                  value={
                    medicine.quantity ??
                    ""
                  }
                  readOnly
                />

              </div>

              {/* =========================
                  ROUTE
              ========================= */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                <select
                  className="border rounded-lg p-2"
                  value={
                    medicine.route ??
                    ""
                  }
                  onChange={(e) =>
                    updateMedicineField(
                      index,
                      "route",
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Route
                  </option>

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

                  <option value="Nasal">
                    Nasal
                  </option>

                  <option value="Ophthalmic">
                    Ophthalmic
                  </option>

                  <option value="Otic">
                    Otic
                  </option>

                </select>

              </div>

              {/* =========================
                  TIMING
              ========================= */}

              <div className="flex flex-wrap gap-5">

                <label className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    checked={
                      Boolean(
                        medicine.morning
                      )
                    }
                    onChange={(e) =>
                      updateMedicineField(
                        index,
                        "morning",
                        e.target.checked
                      )
                    }
                  />

                  Morning

                </label>

                <label className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    checked={
                      Boolean(
                        medicine.afternoon
                      )
                    }
                    onChange={(e) =>
                      updateMedicineField(
                        index,
                        "afternoon",
                        e.target.checked
                      )
                    }
                  />

                  Afternoon

                </label>

                <label className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    checked={
                      Boolean(
                        medicine.night
                      )
                    }
                    onChange={(e) =>
                      updateMedicineField(
                        index,
                        "night",
                        e.target.checked
                      )
                    }
                  />

                  Night

                </label>

              </div>

              {/* =========================
                  FOOD / SOS
              ========================= */}

              <div className="flex flex-wrap gap-5">

                <label className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    checked={
                      Boolean(
                        medicine.beforeFood
                      )
                    }
                    onChange={(e) =>
                      updateMedicineField(
                        index,
                        "beforeFood",
                        e.target.checked
                      )
                    }
                  />

                  Before Food

                </label>

                <label className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    checked={
                      Boolean(
                        medicine.afterFood
                      )
                    }
                    onChange={(e) =>
                      updateMedicineField(
                        index,
                        "afterFood",
                        e.target.checked
                      )
                    }
                  />

                  After Food

                </label>

                <label className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    checked={
                      Boolean(
                        medicine.sos
                      )
                    }
                    onChange={(e) =>
                      updateMedicineField(
                        index,
                        "sos",
                        e.target.checked
                      )
                    }
                  />

                  SOS

                </label>

              </div>

              {/* =========================
                  INSTRUCTION
              ========================= */}

              <input
                className="border rounded-lg p-2 w-full"
                placeholder="Instruction"
                value={
                  medicine.instruction ??
                  ""
                }
                onChange={(e) =>
                  updateMedicineField(
                    index,
                    "instruction",
                    e.target.value
                  )
                }
              />

            </div>

          )
        )}

      </div>

      {/* =========================
          OTHER TEMPLATE DETAILS
      ========================= */}

      <div className="mt-8 space-y-5">

        <textarea
          className="w-full border rounded-lg p-3"
          rows={4}
          placeholder="Investigations"
          value={
            investigations
          }
          onChange={(e) =>
            setInvestigations(
              e.target.value
            )
          }
        />

        <textarea
          className="w-full border rounded-lg p-3"
          rows={4}
          placeholder="Advice"
          value={advice}
          onChange={(e) =>
            setAdvice(
              e.target.value
            )
          }
        />

        <textarea
          className="w-full border rounded-lg p-3"
          rows={4}
          placeholder="Notes"
          value={notes}
          onChange={(e) =>
            setNotes(
              e.target.value
            )
          }
        />

      </div>

      {/* =========================
          SAVE
      ========================= */}

      <div className="mt-8 flex justify-end">

        <button
          type="button"
          onClick={
            saveTemplate
          }
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold"
        >
          {saving
            ? "Saving..."
            : "Save Disease Template"}
        </button>

      </div>

    </div>
  );
}