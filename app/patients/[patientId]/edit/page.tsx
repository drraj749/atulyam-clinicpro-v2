"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();

  const patientId = params.patientId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "Male",
    mobile: "",
    address: "",
    bloodGroup: "",
    aadhaar: "",
    occupation: "",
  });

  useEffect(() => {
    loadPatient();
  }, []);

  async function loadPatient() {
    const res = await fetch("/api/patients/" + patientId);

    if (!res.ok) {
      alert("Unable to load patient");
      router.push("/patients");
      return;
    }

    const json = await res.json();

    const p = json.patient;

    setForm({
      firstName: p.firstName || "",
      lastName: p.lastName || "",
      age: String(p.age || ""),
      gender: p.gender || "Male",
      mobile: p.mobile || "",
      address: p.address || "",
      bloodGroup: p.bloodGroup || "",
      aadhaar: p.aadhaar || "",
      occupation: p.occupation || "",
    });

    setLoading(false);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function savePatient(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    const res = await fetch("/api/patients/" + patientId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      alert("Unable to update patient");
      return;
    }

    alert("Patient Updated Successfully");

    router.push("/patients/" + patientId);

    router.refresh();
  }

  if (loading) {
    return (
      <div className="p-10 text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "30px auto",
        background: "white",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,.15)",
        fontFamily: "Arial",
      }}
    >
      <h1>Edit Patient</h1>

      <br />

      <form onSubmit={savePatient}>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
          }}
        >

          <input
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            required
          />

          <input
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
          />

          <input
            name="age"
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
            required
          />

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <input
            name="mobile"
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={handleChange}
            required
          />

          <input
            name="bloodGroup"
            placeholder="Blood Group"
            value={form.bloodGroup}
            onChange={handleChange}
          />

          <input
            name="aadhaar"
            placeholder="Aadhaar Number"
            value={form.aadhaar}
            onChange={handleChange}
          />

          <input
            name="occupation"
            placeholder="Occupation"
            value={form.occupation}
            onChange={handleChange}
          />

        </div>

        <br />

        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "10px",
          }}
        />

        <br />
        <br />

        <button
          type="submit"
          disabled={saving}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {saving ? "Updating..." : "Update Patient"}
        </button>

      </form>

    </div>
  );
}