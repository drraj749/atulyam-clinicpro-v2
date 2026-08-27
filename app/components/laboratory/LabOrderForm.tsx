"use client";

import { useEffect, useState } from "react";

const LAB_NAMES = [
  "SRT",
  "APL",
  "Vaishavi",
  "Popular",
  "Utkarsh",
  "JB",
  "Thyrocare",
  "Dr Lal Path",
];

type LabCollection = {
  id: number;
  collectionDate: string;
  patientName: string;
  testName: string;
  cost: number;
  labName: string;
};

export default function LabOrderForm() {
  const [collectionDate, setCollectionDate] = useState("");
  const [patientName, setPatientName] = useState("");
  const [testName, setTestName] = useState("");
  const [cost, setCost] = useState("");
  const [labName, setLabName] = useState("");

  const [records, setRecords] = useState<LabCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCollectionDate(new Date().toISOString().split("T")[0]);
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      setLoading(true);

      const response = await fetch("/api/laboratory/collections");

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error(result);
        return;
      }

      setRecords(result.collections || []);
    } catch (error) {
      console.error(error);
      alert("Unable to load lab sample records.");
    } finally {
      setLoading(false);
    }
  }

  async function saveCollection() {
    if (!collectionDate) {
      alert("Please select date.");
      return;
    }

    if (!patientName.trim()) {
      alert("Please enter patient name.");
      return;
    }

    if (!testName.trim()) {
      alert("Please enter test name.");
      return;
    }

    if (!cost || Number(cost) < 0) {
      alert("Please enter valid cost.");
      return;
    }

    if (!labName) {
      alert("Please select lab name.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/laboratory/collections",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            collectionDate,
            patientName: patientName.trim(),
            testName: testName.trim(),
            cost: Number(cost),
            labName,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            "Unable to save lab sample record."
        );
        return;
      }

      setPatientName("");
      setTestName("");
      setCost("");
      setLabName("");

      await loadRecords();

      alert("Lab sample record saved successfully.");

    } catch (error) {
      console.error(error);

      alert("Unable to connect to server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-xl shadow p-6">

        <div className="mb-6">

          <h2 className="text-2xl font-bold text-gray-900">
            Lab Sample Collection
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Record samples collected and sent to external laboratories.
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px] border-collapse">

            <thead>

              <tr className="bg-gray-100 text-left">

                <th className="border p-3">
                  Date
                </th>

                <th className="border p-3">
                  Patient Name
                </th>

                <th className="border p-3">
                  Test Name
                </th>

                <th className="border p-3">
                  Cost
                </th>

                <th className="border p-3">
                  Lab Name
                </th>

                <th className="border p-3 w-[120px]">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td className="border p-2">

                  <input
                    type="date"
                    value={collectionDate}
                    onChange={(e) =>
                      setCollectionDate(e.target.value)
                    }
                    className="border rounded-lg p-2 w-full"
                  />

                </td>

                <td className="border p-2">

                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) =>
                      setPatientName(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveCollection();
                      }
                    }}
                    placeholder="Enter patient name"
                    className="border rounded-lg p-2 w-full"
                  />

                </td>

                <td className="border p-2">

                  <input
                    type="text"
                    value={testName}
                    onChange={(e) =>
                      setTestName(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveCollection();
                      }
                    }}
                    placeholder="Enter test name"
                    className="border rounded-lg p-2 w-full"
                  />

                </td>

                <td className="border p-2">

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cost}
                    onChange={(e) =>
                      setCost(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveCollection();
                      }
                    }}
                    placeholder="₹ Cost"
                    className="border rounded-lg p-2 w-full"
                  />

                </td>

                <td className="border p-2">

                  <select
                    value={labName}
                    onChange={(e) =>
                      setLabName(e.target.value)
                    }
                    className="border rounded-lg p-2 w-full bg-white"
                  >

                    <option value="">
                      Select Lab
                    </option>

                    {LAB_NAMES.map((lab) => (

                      <option
                        key={lab}
                        value={lab}
                      >
                        {lab}
                      </option>

                    ))}

                  </select>

                </td>

                <td className="border p-2">

                  <button
                    type="button"
                    onClick={saveCollection}
                    disabled={saving}
                    className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    {saving
                      ? "Saving..."
                      : "Save"}
                  </button>

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

      <div className="bg-white rounded-xl shadow p-6">

        <div className="flex items-center justify-between mb-6">

          <div>

            <h2 className="text-xl font-bold text-gray-900">
              Lab Sample Records
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              All collected lab samples.
            </p>

          </div>

          <button
            type="button"
            onClick={loadRecords}
            className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg"
          >
            Refresh
          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px] border-collapse">

            <thead>

              <tr className="bg-gray-100 text-left">

                <th className="border p-3">
                  Date
                </th>

                <th className="border p-3">
                  Patient Name
                </th>

                <th className="border p-3">
                  Test Name
                </th>

                <th className="border p-3">
                  Cost
                </th>

                <th className="border p-3">
                  Lab Name
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={5}
                    className="border p-6 text-center text-gray-500"
                  >
                    Loading records...
                  </td>

                </tr>

              ) : records.length === 0 ? (

                <tr>

                  <td
                    colSpan={5}
                    className="border p-6 text-center text-gray-500"
                  >
                    No lab sample records found.
                  </td>

                </tr>

              ) : (

                records.map((record) => (

                  <tr
                    key={record.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="border p-3">

                      {new Date(
                        record.collectionDate
                      ).toLocaleDateString("en-IN")}

                    </td>

                    <td className="border p-3 font-medium">
                      {record.patientName}
                    </td>

                    <td className="border p-3">
                      {record.testName}
                    </td>

                    <td className="border p-3">
                      ₹{Number(record.cost).toFixed(2)}
                    </td>

                    <td className="border p-3">
                      {record.labName}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}