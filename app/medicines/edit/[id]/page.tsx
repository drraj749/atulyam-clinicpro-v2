"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditMedicinePage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadMedicine();
  }, []);

  async function loadMedicine() {
    try {
      const response = await fetch(
        "/api/medicines/" + id
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message);
        return;
      }

      const medicine = result.medicine;

      setForm({
        medicineCode:
          medicine.medicineCode || "",
        genericName:
          medicine.genericName || "",
        brandName:
          medicine.brandName || "",
        strength:
          medicine.strength || "",
        dosageForm:
          medicine.dosageForm || "",
        route:
          medicine.route || "",
        manufacturer:
          medicine.manufacturer || "",
        isActive:
          medicine.isActive ?? true,
      });
    } catch (error) {
      console.error(error);
      alert("Unable to load medicine.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function updateMedicine() {
    if (!form.genericName.trim()) {
      alert("Generic Name is required.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/medicines/" + id,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message);
        return;
      }

      alert(
        "Medicine updated successfully."
      );

      router.push("/medicines");
    } catch (error) {
      console.error(error);
      alert("Server Error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow p-6">
          Loading Medicine...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* Page Header */}

      <div className="bg-white rounded-xl shadow p-6">

        <h1 className="text-3xl font-bold text-blue-900">
          Edit Medicine
        </h1>

        <p className="text-gray-500 mt-2">
          Update medicine details.
        </p>

      </div>

      {/* Medicine Form */}

      <div className="bg-white rounded-xl shadow p-6 mt-6">

        <div className="grid grid-cols-2 gap-6">

          {/* Medicine Code */}

          <div>
            <label className="font-medium">
              Medicine Code
            </label>

            <input
              name="medicineCode"
              value={form.medicineCode}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full mt-2"
            />
          </div>

          {/* Generic Name */}

          <div>
            <label className="font-medium">
              Generic Name *
            </label>

            <input
              name="genericName"
              value={form.genericName}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full mt-2"
            />
          </div>

          {/* Brand Name */}

          <div>
            <label className="font-medium">
              Brand Name
            </label>

            <input
              name="brandName"
              value={form.brandName}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full mt-2"
            />
          </div>

          {/* Strength */}

          <div>
            <label className="font-medium">
              Strength
            </label>

            <input
              name="strength"
              value={form.strength}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full mt-2"
            />
          </div>

          {/* Dosage Form */}

          <div>
            <label className="font-medium">
              Dosage Form
            </label>

            <select
              name="dosageForm"
              value={form.dosageForm}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full mt-2"
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
            <label className="font-medium">
              Route
            </label>

            <select
              name="route"
              value={form.route}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full mt-2"
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
            <label className="font-medium">
              Manufacturer
            </label>

            <input
              name="manufacturer"
              value={form.manufacturer}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full mt-2"
            />
          </div>

        </div>

        {/* Buttons */}

        <div className="mt-8 flex gap-4">

          <button
            type="button"
            onClick={updateMedicine}
            disabled={saving}
            className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg"
          >
            {saving
              ? "Updating..."
              : "Update Medicine"}
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