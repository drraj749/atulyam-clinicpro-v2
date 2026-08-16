"use client";

import { useRouter } from "next/navigation";

export default function OPDPatientSelection() {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-8">

      <h1 className="text-3xl font-bold text-blue-950">
        Start OPD Consultation
      </h1>

      <p className="mt-2 text-gray-500">
        Select an existing patient or register a new patient.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">

        {/* EXISTING PATIENT */}

        <button
          type="button"
          onClick={() =>
            router.push("/patients?mode=opd")
          }
          className="text-left bg-blue-700 hover:bg-blue-800 text-white rounded-2xl p-6 transition shadow-sm"
        >

          <div className="text-3xl mb-4">
            👥
          </div>

          <h2 className="text-xl font-bold">
            Select Existing Patient
          </h2>

          <p className="text-blue-100 text-sm mt-2">
            Search a registered patient and start an OPD consultation.
          </p>

        </button>

        {/* NEW PATIENT */}

        <button
          type="button"
          onClick={() =>
            router.push("/patients/new")
          }
          className="text-left bg-green-600 hover:bg-green-700 text-white rounded-2xl p-6 transition shadow-sm"
        >

          <div className="text-3xl mb-4">
            ➕
          </div>

          <h2 className="text-xl font-bold">
            Register New Patient
          </h2>

          <p className="text-green-100 text-sm mt-2">
            Register a new patient before starting the consultation.
          </p>

        </button>

        {/* TODAY'S OPD */}

        <button
          type="button"
          onClick={() =>
            router.push("/opd/today")
          }
          className="text-left bg-purple-700 hover:bg-purple-800 text-white rounded-2xl p-6 transition shadow-sm"
        >

          <div className="text-3xl mb-4">
            📋
          </div>

          <h2 className="text-xl font-bold">
            Today's OPD
          </h2>

          <p className="text-purple-100 text-sm mt-2">
            View today's OPD visits, patients and consultation details.
          </p>

        </button>

      </div>

    </div>
  );
}