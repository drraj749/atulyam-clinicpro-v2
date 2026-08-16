"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPatientPage() {
  const router = useRouter();

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

  const [saving, setSaving] = useState(false);

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

    const res = await fetch("/api/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (res.ok) {
      alert("Patient Registered Successfully");
      router.push("/patients");
      router.refresh();
    } else {
      alert("Unable to register patient");
    }
  }

  return (
    <div
      style={{
        maxWidth: 850,
        margin: "30px auto",
        background: "#fff",
        padding: 30,
        borderRadius: 10,
        boxShadow: "0 0 10px rgba(0,0,0,.1)",
        fontFamily: "Arial",
      }}
    >
      <h1>Register New Patient</h1>

      <form onSubmit={savePatient}>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:15}}>

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
            width:"100%",
            padding:10
          }}
        />

        <br />
        <br />

        <button
          type="submit"
          disabled={saving}
          style={{
            background:"#16a34a",
            color:"#fff",
            border:"none",
            padding:"12px 25px",
            borderRadius:6,
            cursor:"pointer",
            fontSize:16
          }}
        >
          {saving ? "Saving..." : "Register Patient"}
        </button>

      </form>
    </div>
  );
}