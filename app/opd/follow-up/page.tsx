"use client";

import { useEffect, useState } from "react";

type Patient = {
  id: number;
  patientId: string;
  firstName: string;
  lastName?: string;
  age: number;
  gender: string;
  mobile: string;
};

export default function FollowUpPage() {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    const response = await fetch("/api/patients");

    const result = await response.json();

    if (result.success) {
      setPatients(result.patients);
    }
  }

  const filtered = patients.filter((p) => {
    const text = search.toLowerCase();

    return (
      p.firstName.toLowerCase().includes(text) ||
      p.patientId.toLowerCase().includes(text) ||
      p.mobile.includes(search)
    );
  });

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold text-blue-800">
          Follow-up OPD
        </h1>

        <input
          placeholder="Search Name / UHID / Mobile"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-xl p-4 mt-6"
        />

        <div className="bg-white rounded-xl shadow mt-6 overflow-hidden">

          <table className="w-full">

            <thead className="bg-blue-700 text-white">

              <tr>
                <th className="p-3 text-left">UHID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Age</th>
                <th className="p-3 text-left">Gender</th>
                <th className="p-3 text-left">Mobile</th>
                <th className="p-3 text-left">Action</th>
              </tr>

            </thead>

            <tbody>

              {filtered.map((patient) => (

                <tr key={patient.id} className="border-b">

                  <td className="p-3">
                    {patient.patientId}
                  </td>

                  <td className="p-3">
                    {patient.firstName}
                  </td>

                  <td className="p-3">
                    {patient.age}
                  </td>

                  <td className="p-3">
                    {patient.gender}
                  </td>

                  <td className="p-3">
                    {patient.mobile}
                  </td>

                  <td className="p-3">

                    <button
  onClick={() =>
    window.location.href = `/opd?patientId=${patient.patientId}&followUpVisitId=${patient.id}`
  }
  className="bg-blue-700 text-white px-4 py-2 rounded-lg"
>
  Open OPD
</button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </main>
  );
}