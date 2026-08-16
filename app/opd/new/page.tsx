"use client";

import { useState } from "react";

export default function NewOPDPage() {
  const [form, setForm] = useState({
  firstName: "",
  age: "",
  gender: "",
  mobile: "",
  address: "",
});

  function handleChange(
  e: React.ChangeEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >
) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }
async function savePatient() {
  if (!form.firstName || !form.age || !form.gender) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    const response = await fetch("/api/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  firstName: form.firstName,
  age: Number(form.age),
  gender: form.gender,
  mobile: form.mobile,
  address: form.address,
}),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || "Unable to save patient.");
      return;
    }

    window.location.href = `/opd?patientId=${result.patient.patientId}`;
  } catch (error) {
    console.error(error);
    alert("Server Error");
  }
}
  return (
    <main className="min-h-screen bg-gray-100 p-8 flex justify-center">

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">

        <h1 className="text-3xl font-bold text-blue-800">
          New OPD
        </h1>

        <p className="text-gray-500 mt-2">
          Register New Patient
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6">

          <div>
            <label className="font-medium">
              Patient Name
            </label>

            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full mt-2"
            />
          </div>

          <div>
            <label className="font-medium">
              Age
            </label>

            <input
              name="age"
              value={form.age}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full mt-2"
            />
          </div>

          <div>
            <label className="font-medium">
              Gender
            </label>

            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full mt-2"
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="font-medium">
              Mobile
            </label>

            <input
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full mt-2"
            />
          </div>
<div>
  <label className="font-medium">
    Address
  </label>

  <textarea
    name="address"
    value={form.address}
    onChange={handleChange}
    rows={3}
    className="border rounded-lg p-3 w-full mt-2"
    placeholder="Enter patient address"
  />
</div>
        </div>

        <button
  onClick={savePatient}
  className="mt-10 w-full h-14 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-lg font-semibold"
>
  Save & Continue
</button>

      </div>

    </main>
  );
}