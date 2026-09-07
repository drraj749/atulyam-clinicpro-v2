"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Medicine } from "@/types/medicine";

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadMedicines(search);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search]);

  async function loadMedicines(searchTerm = "") {
    setLoading(true);

    try {
      const query = searchTerm.trim()
        ? `?search=${encodeURIComponent(searchTerm.trim())}`
        : "";

      const res = await fetch(`/api/medicines${query}`, {
        cache: "no-store",
      });
      const json = await res.json();

      setMedicines(json.medicines || []);
    } catch (error) {
      console.error("LOAD MEDICINES ERROR:", error);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMedicine(id: number) {
    if (!confirm("Delete this medicine?")) return;

    await fetch(`/api/medicines/${id}`, {
      method: "DELETE",
    });

    loadMedicines(search);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medicine Master</h1>
          <p className="text-gray-500">Manage all medicines</p>
        </div>

        <Link
          href="/medicines/new"
          className="rounded-lg bg-blue-700 px-5 py-3 text-center text-white hover:bg-blue-800"
        >
          + New Medicine
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <label
          htmlFor="medicine-search"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Search Medicine
        </label>
        <div className="relative">
          <input
            id="medicine-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by brand, generic name, strength or medicine code..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-10 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-400 hover:text-gray-700"
              aria-label="Clear medicine search"
            >
              ×
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Search works across brand name, generic name, strength and medicine code.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
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
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    Searching medicines...
                  </td>
                </tr>
              )}

              {!loading && medicines.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    {search.trim()
                      ? `No medicine found for “${search.trim()}”.`
                      : "No medicines found."}
                  </td>
                </tr>
              )}

              {!loading &&
                medicines.map((m) => (
                  <tr key={m.id} className="border-b last:border-b-0">
                    <td className="p-3">{m.medicineCode}</td>
                    <td className="p-3">{m.genericName}</td>
                    <td className="p-3">{m.brandName || "—"}</td>
                    <td className="p-3">{m.strength || "—"}</td>
                    <td className="p-3">{m.dosageForm || "—"}</td>
                    <td className="p-3">{m.route || "—"}</td>
                    <td className="space-x-3 p-3">
                      <Link
                        href={`/medicines/edit/${m.id}`}
                        className="font-semibold text-blue-700 hover:text-blue-900"
                      >
                        ✏️ Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => deleteMedicine(m.id)}
                        className="text-red-600 hover:text-red-800"
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
    </div>
  );
}
