"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMedicinePage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    medicineCode: "",
    genericName: "",
    brandName: "",
    strength: "",
    dosageForm: "",
    route: "",
    manufacturer: "",
    isActive: true,
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  }

  async function saveMedicine() {
    if (!form.genericName.trim()) {
      alert("Generic Name is required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        medicineCode:
          form.medicineCode.trim() ||
          "MED" + Date.now(),
      };

      const response = await fetch(
        "/api/medicines",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Unable to save medicine."
        );
        return;
      }

      alert("Medicine saved successfully.");

      router.push("/medicines");
    } catch (error) {
      console.error(error);
      alert("Server Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8">

      {/* Page Header */}

      <div className="bg-white rounded-xl shadow p-6">

        <h1 className="text-3xl font-bold text-blue-900">
          Add Medicine
        </h1>

        <p className="text-gray-500 mt-2">
          Create a medicine for doctor prescription.
        </p>

      </div>

      {/* Medicine Form */}

      <div className="bg-white rounded-xl shadow p-6 mt-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Medicine Code */}

          <div>
            <label className="font-medium block mb-2">
              Medicine Code (Optional)
            </label>

            <input
              name="medicineCode"
              value={form.medicineCode}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
              placeholder="Auto generated if left blank"
            />
          </div>

          {/* Generic Name */}

          <div>
            <label className="font-medium block mb-2">
              Generic Name *
            </label>

            <input
              name="genericName"
              value={form.genericName}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            />
          </div>

          {/* Brand Name */}

          <div>
            <label className="font-medium block mb-2">
              Brand Name
            </label>

            <input
              name="brandName"
              value={form.brandName}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            />
          </div>

          {/* Strength */}

          <div>
            <label className="font-medium block mb-2">
              Strength
            </label>

            <input
              name="strength"
              value={form.strength}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
              placeholder="500 mg"
            />
          </div>

          {/* Dosage Form */}

          <div>
            <label className="font-medium block mb-2">
              Dosage Form
            </label>

            <select
              name="dosageForm"
              value={form.dosageForm}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            >
              <option value="">
                Select
              </option>

              <option>Tablet</option>
              <option>Capsule</option>
              <option>Syrup</option>
              <option>Injection</option>
              <option>Ointment</option>
              <option>Drops</option>
              <option>Powder</option>
              <option>Inhaler</option>
              <option>Cream</option>
              <option>Gel</option>
            </select>
          </div>

          {/* Route */}

          <div>
            <label className="font-medium block mb-2">
              Route
            </label>

            <select
              name="route"
              value={form.route}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            >
              <option value="">
                Select
              </option>

              <option>Oral</option>
              <option>IV</option>
              <option>IM</option>
              <option>SC</option>
              <option>Topical</option>
              <option>Nasal</option>
              <option>Eye</option>
              <option>Ear</option>
              <option>Rectal</option>
              <option>Inhalation</option>
            </select>
          </div>

          {/* Manufacturer */}

          <div>
            <label className="font-medium block mb-2">
              Manufacturer
            </label>

            <input
              name="manufacturer"
              value={form.manufacturer}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            />
          </div>

        </div>

        {/* Buttons */}

        <div className="mt-8 flex gap-4">

          <button
            type="button"
            onClick={saveMedicine}
            disabled={saving}
            className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg"
          >
            {saving
              ? "Saving..."
              : "Save Medicine"}
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/medicines")
            }
            className="bg-gray-300 hover:bg-gray-400 px-8 py-3 rounded-lg"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
}