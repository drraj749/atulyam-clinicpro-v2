"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Medicine } from "@/types/medicine";

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicines();
  }, []);

  async function loadMedicines() {
    setLoading(true);

    try {
      const res = await fetch("/api/medicines");
      const json = await res.json();

      setMedicines(json.medicines || []);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMedicine(id: number) {
    if (!confirm("Delete this medicine?")) return;

    await fetch(`/api/medicines/${id}`, {
      method: "DELETE",
    });

    loadMedicines();
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold">
            Medicine Master
          </h1>

          <p className="text-gray-500">
            Manage all medicines
          </p>
        </div>

        <Link
          href="/medicines/new"
          className="bg-blue-700 text-white px-5 py-3 rounded-lg"
        >
          + New Medicine
        </Link>

      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-blue-700 text-white">

            <tr>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Generic</th>
              <th className="p-3 text-left">Brand</th>
              <th className="p-3 text-left">Strength</th>
              <th className="p-3 text-left">Form</th>
              <th className="p-3 text-left">Route</th>
              <th className="p-3 text-left">Action</th>
            </tr>

          </thead>

          <tbody>

            {loading && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center p-6"
                >
                  Loading...
                </td>
              </tr>
            )}

            {!loading &&
              medicines.map((m) => (

                <tr
                  key={m.id}
                  className="border-b"
                >
                  <td className="p-3">{m.medicineCode}</td>
                  <td className="p-3">{m.genericName}</td>
                  <td className="p-3">{m.brandName}</td>
                  <td className="p-3">{m.strength}</td>
                  <td className="p-3">{m.dosageForm}</td>
                  <td className="p-3">{m.route}</td>

                  <td className="p-3 space-x-3">

                    <Link
  href={`/medicines/edit/${m.id}`}
  className="text-blue-700 hover:text-blue-900 font-semibold"
>
  ✏️ Edit
</Link>

                    <button
                      onClick={() =>
                        deleteMedicine(m.id)
                      }
                      className="text-red-600"
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}