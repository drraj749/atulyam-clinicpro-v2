"use client";

import { useEffect, useState } from "react";
import MedicineSearch from "@/app/components/medicine/MedicineSearch";
import type { PrescriptionMedicine } from "@/app/types/prescription";
import { useRouter } from "next/navigation";

type Props = {
  opdVisitId: number;
};

function createMedicine(): PrescriptionMedicine {
  return {
    id: Date.now(),
    medicineId: null,

    medicineName: "",
    genericName: "",
    brandName: "",

    strength: "",
    dosageForm: "",

    dosage: "",
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

export default function PrescriptionEditor({
  opdVisitId,
}: Props) {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

const [notes, setNotes] = useState("");

const [investigations, setInvestigations] = useState("");

  const [medicines, setMedicines] = useState<
    PrescriptionMedicine[]
  >([createMedicine()]);

  useEffect(() => {
  loadPrescription();
  loadTemplates();
}, [opdVisitId]);

  async function loadPrescription() {
    try {
      const response = await fetch(
  `/api/prescriptions?opdVisitId=${opdVisitId}`
);

      const result = await response.json();

      if (!result.success || !result.prescription) return;

      setNotes(result.prescription.notes ?? "");

      setInvestigations(
  result.prescription.investigations ?? ""
);

      if (result.prescription.items?.length > 0) {
        setMedicines(
          result.prescription.items.map((item: any) => ({
            id: item.id,

            medicineId: null,

            medicineName: item.medicineName,

            genericName: "",
            brandName: "",

            strength: item.strength ?? "",
            dosageForm: "",

            dosage: item.dosage ?? "",
            frequency: item.frequency ?? "",

            morning: item.morning ?? false,
            afternoon: item.afternoon ?? false,
            night: item.night ?? false,

            beforeFood: item.beforeFood ?? false,
            afterFood: item.afterFood ?? false,

            sos: item.sos ?? false,

            duration: item.duration ?? "",

            instruction: item.instruction ?? "",

            quantity: item.quantity,

            route: item.route ?? "",
          }))
        );
      }
    } catch (error) {
      console.error(error);
    }
  }
async function loadTemplates() {
  try {
    const res = await fetch("/api/disease-templates");
    const data = await res.json();

    if (data.success) {
      setTemplates(data.templates);
    }
  } catch (err) {
    console.error(err);
  }
}
async function applyTemplate(templateId: number) {
  try {
    const res = await fetch(
      `/api/disease-templates/${templateId}`
    );

    const data = await res.json();

    if (!data.success) return;

    const t = data.template;

    setInvestigations(t.investigations ?? "");

    setNotes(
  [t.advice, t.notes].filter(Boolean).join("\n\n")
);

    if (t.medicines.length > 0) {
      setMedicines(
        t.medicines.map((m: any) => ({
          id: Date.now() + Math.random(),

          medicineId: null,

          medicineName: m.medicineName,

          genericName: "",
          brandName: "",

          strength: m.strength ?? "",

          dosageForm: "",

          dosage: m.dosage ?? "",

          frequency: m.frequency ?? "",

          morning: m.morning,

          afternoon: m.afternoon,

          night: m.night,

          beforeFood: m.beforeFood,

          afterFood: m.afterFood,

          sos: m.sos,

          duration: m.duration ?? "",

          instruction: m.instruction ?? "",

          quantity: m.quantity,

          route: m.route ?? "",
        }))
      );
    }
  } catch (err) {
    console.error(err);
  }
}

function calculateQuantity(
  medicine: PrescriptionMedicine
) {
  if (!medicine.duration) return null;

  let days = 0;

  switch (medicine.duration) {
    case "3 Days":
      days = 3;
      break;

    case "5 Days":
      days = 5;
      break;

    case "7 Days":
      days = 7;
      break;

    case "10 Days":
      days = 10;
      break;

    case "14 Days":
      days = 14;
      break;

    case "15 Days":
      days = 15;
      break;

    case "1 Month":
      days = 30;
      break;

    default:
      return medicine.quantity;
  }

  // Once weekly
  if (medicine.frequency === "ONCE_WEEKLY") {
    return Math.ceil(days / 7);
  }

  // One time only
  if (medicine.frequency === "ONE_TIME") {
    return 1;
  }

  let dosesPerDay = 0;

  switch (medicine.frequency) {
    case "OD":
      dosesPerDay = 1;
      break;

    case "BD":
      dosesPerDay = 2;
      break;

    case "TDS":
      dosesPerDay = 3;
      break;

    case "QID":
      dosesPerDay = 4;
      break;

    case "HS":
      dosesPerDay = 1;
      break;

    default:
      dosesPerDay =
        Number(medicine.morning) +
        Number(medicine.afternoon) +
        Number(medicine.night);
  }

  return days * dosesPerDay;
}

function updateMedicine(
  index: number,
  medicine: PrescriptionMedicine
) {
  medicine.quantity = calculateQuantity(medicine);

  const copy = [...medicines];
  copy[index] = medicine;

  setMedicines(copy);
}

  function addMedicine() {
    setMedicines([...medicines, createMedicine()]);
  }

  function removeMedicine(index: number) {
    const copy = [...medicines];
    copy.splice(index, 1);

    if (copy.length === 0) {
      copy.push(createMedicine());
    }

    setMedicines(copy);
  }

  async function savePrescription() {
    try {
      const response = await fetch("/api/prescriptions", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
         opdVisitId,

         notes,
 
         investigations,

         items: medicines.map((m) => ({
            medicineName: m.medicineName,

            strength: m.strength,

            dosage: m.dosage,

            frequency: m.frequency,

            duration: m.duration,

            instruction: m.instruction,

            morning: m.morning,

            afternoon: m.afternoon,

            night: m.night,

            beforeFood: m.beforeFood,

            afterFood: m.afterFood,

            sos: m.sos,

            quantity: m.quantity,

            route: m.route,
          })),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.message);
        return;
      }

      alert("Prescription saved successfully.");

      router.push(`/opd/view/${opdVisitId}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Unable to save prescription.");
    }
  }

return (
    <div className="bg-white rounded-xl shadow p-6">
<div className="mb-6">

  <label className="block font-semibold mb-2">
    Disease Template
  </label>

  <select
    className="border rounded-lg p-3 w-full"
    value={selectedTemplate}
    onChange={(e) => {
      setSelectedTemplate(e.target.value);

      if (e.target.value) {
        applyTemplate(Number(e.target.value));
      }
    }}
  >

    <option value="">
      Select Disease Template
    </option>

    {templates.map((template) => (

      <option
        key={template.id}
        value={template.id}
      >
        {template.name}
      </option>

    ))}

  </select>

</div>
      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold text-blue-900">
          Prescription
        </h2>

        <button
          type="button"
          onClick={addMedicine}
          className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg"
        >
          + Add Medicine
        </button>

      </div>

      <div className="space-y-6">

        {medicines.map((medicine, index) => (

          <div
            key={medicine.id}
            className="border rounded-xl p-5 bg-gray-50"
          >

            <MedicineSearch
              value={medicine.medicineName}
              onSelect={(selected) =>
                updateMedicine(index, {
                  ...medicine,

                  medicineId: selected.id,

                  medicineName:
                  selected.brandName || selected.genericName,

                  genericName: selected.genericName,

                  brandName: selected.brandName,

                  strength: selected.strength,

                  dosageForm: selected.dosageForm,

                  route: selected.route ?? "",
                })
              }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">

              <input
              className="border rounded-lg p-2 bg-gray-100"
              placeholder="Strength"
              value={medicine.strength ?? ""}
              readOnly
            />
              <input
              className="border rounded-lg p-2 bg-gray-100"
              placeholder="Dosage Form"
              value={medicine.dosageForm ?? ""}
              readOnly
            />

              <input
              className="border rounded-lg p-2 bg-gray-100"
              placeholder="Route"
              value={medicine.route ?? ""}
              readOnly
            />

 <select
  className="border rounded-lg p-2"
  value={medicine.frequency ?? ""}
  onChange={(e) => {
    const frequency = e.target.value;

    updateMedicine(index, {
      ...medicine,
      frequency,

      morning:
        frequency === "OD" ||
        frequency === "BD" ||
        frequency === "TDS" ||
        frequency === "QID",

      afternoon:
        frequency === "TDS" ||
        frequency === "QID",

      night:
        frequency === "BD" ||
        frequency === "TDS" ||
        frequency === "QID",

      sos: frequency === "SOS",

      quantity:
        frequency === "ONCE_WEEKLY" ||
        frequency === "ONE_TIME"
          ? 1
          : medicine.quantity,
    });
  }}
>
  <option value="">Select Frequency</option>
  <option value="OD">OD - Once Daily</option>
  <option value="BD">BD - Twice Daily</option>
  <option value="TDS">TDS - Three Times Daily</option>
  <option value="QID">QID - Four Times Daily</option>
  <option value="HS">HS - Bed Time</option>
  <option value="SOS">SOS</option>
  <option value="ONCE_WEEKLY">Once Weekly</option>
  <option value="ONE_TIME">One Time Only</option>
</select>

<select
  className="border rounded-lg p-2"
  value={medicine.duration}
  onChange={(e) =>
    updateMedicine(index, {
      ...medicine,
      duration: e.target.value,
    })
  }
>
  <option value="">Select Duration</option>
  <option>3 Days</option>
  <option>5 Days</option>
  <option>7 Days</option>
  <option>10 Days</option>
  <option>14 Days</option>
  <option>15 Days</option>
  <option>1 Month</option>
  <option>Continue</option>
</select>

              <input
  type="number"
  className="border rounded-lg p-2 bg-gray-100"
  placeholder="Quantity"
  value={medicine.quantity ?? ""}
  readOnly
/>

<input
  className="border rounded-lg p-2"
  placeholder="Dosage"
  value={medicine.dosage ?? ""}
  onChange={(e) =>
    updateMedicine(index, {
      ...medicine,
      dosage: e.target.value,
    })
  }
/>

              <input
                className="border rounded-lg p-2 md:col-span-2"
                placeholder="Instruction"
                value={medicine.instruction}
                onChange={(e)=>
                  updateMedicine(index,{
                    ...medicine,
                    instruction:e.target.value,
                  })
                }
              />

            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-5">

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={medicine.morning}
                  onChange={(e)=>
                    updateMedicine(index,{
                      ...medicine,
                      morning:e.target.checked,
                    })
                  }
                />
                Morning
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={medicine.afternoon}
                  onChange={(e)=>
                    updateMedicine(index,{
                      ...medicine,
                      afternoon:e.target.checked,
                    })
                  }
                />
                Afternoon
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={medicine.night}
                  onChange={(e)=>
                    updateMedicine(index,{
                      ...medicine,
                      night:e.target.checked,
                    })
                  }
                />
                Night
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={medicine.beforeFood}
                  onChange={(e)=>
                    updateMedicine(index,{
                      ...medicine,
                      beforeFood:e.target.checked,
                    })
                  }
                />
                Before Food
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={medicine.afterFood}
                  onChange={(e)=>
                    updateMedicine(index,{
                      ...medicine,
                      afterFood:e.target.checked,
                    })
                  }
                />
                After Food
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={medicine.sos}
                  onChange={(e)=>
                    updateMedicine(index,{
                      ...medicine,
                      sos:e.target.checked,
                    })
                  }
                />
                SOS
              </label>

            </div>

            <div className="mt-5">

              <button
                type="button"
                onClick={() => removeMedicine(index)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Remove Medicine
              </button>

            </div>

          </div>

        ))}

      </div>

      <div className="mt-6">

  <label className="block font-semibold mb-2">
    Investigation Advice
  </label>
<div className="flex flex-wrap gap-2 mb-4">

  {[
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
  ].map((test) => (

    <button
      key={test}
      type="button"
      className="px-3 py-1 text-sm rounded-full bg-blue-100 hover:bg-blue-600 hover:text-white transition"
      onClick={() => {
        const list = investigations
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean);

        if (!list.includes(test)) {
          setInvestigations(
            [...list, test].join("\n")
          );
        }
      }}
    >
      {test}
    </button>

  ))}

  <button
    type="button"
    className="px-3 py-1 text-sm rounded-full bg-red-100 hover:bg-red-600 hover:text-white"
    onClick={() => setInvestigations("")}
  >
    Clear
  </button>

</div>

  <textarea
    rows={5}
    className="border rounded-lg p-3 w-full mb-6"
    placeholder={`CBC
LFT
KFT
HbA1c
Urine Routine`}
    value={investigations}
    onChange={(e) => setInvestigations(e.target.value)}
  />

  <label className="block font-semibold mb-2">
    Clinical Notes / Advice
  </label>

  <textarea
    rows={4}
    className="border rounded-lg p-3 w-full"
    placeholder="Clinical Notes"
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
  />

</div>

      <div className="mt-6 flex justify-end">

        <button
          type="button"
          onClick={savePrescription}
          className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg"
        >
          Save Prescription
        </button>

      </div>

    </div>
  );
}