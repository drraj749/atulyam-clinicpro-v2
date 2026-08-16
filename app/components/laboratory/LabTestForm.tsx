"use client";

import { useState } from "react";

import { initialLabTest } from "@/app/types/labTest";
import type { LabTestForm } from "@/app/types/labTest";

export default function LabTestForm() {
  const [form, setForm] =
    useState<LabTestForm>(initialLabTest);

  const [saving, setSaving] =
    useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function saveTest() {
    setSaving(true);

    try {
      const response = await fetch(
        "/api/laboratory/tests",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(form),
        }
      );

      const result =
        await response.json();

      if (!result.success) {
        alert(result.message);
        return;
      }

      alert("Lab Test Saved");

      setForm(initialLabTest);

    } catch (error) {

      console.error(error);

      alert("Server Error");

    } finally {

      setSaving(false);

    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h1 className="text-2xl font-bold mb-6">
        Laboratory Test Master
      </h1>

      <div className="grid grid-cols-2 gap-4">

        <input
          name="testCode"
          placeholder="Test Code"
          value={form.testCode}
          onChange={handleChange}
          className="border rounded-lg p-3"
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          className="border rounded-lg p-3"
        />

        <input
          name="testName"
          placeholder="Test Name"
          value={form.testName}
          onChange={handleChange}
          className="border rounded-lg p-3"
        />

        <input
          name="shortName"
          placeholder="Short Name"
          value={form.shortName}
          onChange={handleChange}
          className="border rounded-lg p-3"
        />

        <input
          name="specimen"
          placeholder="Specimen"
          value={form.specimen}
          onChange={handleChange}
          className="border rounded-lg p-3"
        />

        <input
          name="method"
          placeholder="Method"
          value={form.method}
          onChange={handleChange}
          className="border rounded-lg p-3"
        />

        <input
          name="unit"
          placeholder="Unit"
          value={form.unit}
          onChange={handleChange}
          className="border rounded-lg p-3"
        />

        <input
          name="normalRange"
          placeholder="Normal Range"
          value={form.normalRange}
          onChange={handleChange}
          className="border rounded-lg p-3"
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="border rounded-lg p-3"
        />

      </div>

      <button
        onClick={saveTest}
        disabled={saving}
        className="mt-6 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg"
      >
        {saving ? "Saving..." : "Save Test"}
      </button>

    </div>
  );
}