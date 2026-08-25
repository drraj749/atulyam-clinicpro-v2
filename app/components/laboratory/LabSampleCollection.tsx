"use client";

import { FormEvent, useEffect, useState } from "react";

type LabCollection = {
  id: number;
  date: string;
  patientName: string;
  testName: string;
  cost: number;
  labName: string;
};

const LABS = [
  "SRT",
  "APL",
  "Vaishavi",
  "Popular",
  "Utkarsh",
  "JB",
  "Thyrocare",
  "Dr Lal Path",
];

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateForInput(value: string) {
  const parsedDate = new Date(value);

  const year = parsedDate.getFullYear();

  const month = String(
    parsedDate.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    parsedDate.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function LabSampleCollection() {
  const [records, setRecords] =
    useState<LabCollection[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [date, setDate] =
    useState(getTodayDate());

  const [patientName, setPatientName] =
    useState("");

  const [testName, setTestName] =
    useState("");

  const [cost, setCost] =
    useState("");

  const [labName, setLabName] =
    useState("");

  async function loadRecords() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/laboratory/collections",
        {
          cache: "no-store",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Unable to load records."
        );

        return;
      }

      setRecords(
        result.collections || []
      );
    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  function resetForm() {
    setEditingId(null);

    setDate(getTodayDate());

    setPatientName("");

    setTestName("");

    setCost("");

    setLabName("");
  }

  function handleEdit(
    record: LabCollection
  ) {
    setEditingId(record.id);

    setDate(
      getDateForInput(record.date)
    );

    setPatientName(
      record.patientName
    );

    setTestName(
      record.testName
    );

    setCost(
      String(record.cost)
    );

    setLabName(
      record.labName
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!date) {
      alert("Please select date.");
      return;
    }

    if (!patientName.trim()) {
      alert(
        "Please enter patient name."
      );

      return;
    }

    if (!testName.trim()) {
      alert(
        "Please enter test name."
      );

      return;
    }

    if (
      cost === "" ||
      Number(cost) < 0 ||
      !Number.isFinite(Number(cost))
    ) {
      alert(
        "Please enter a valid cost."
      );

      return;
    }

    if (!labName) {
      alert(
        "Please select lab name."
      );

      return;
    }

    setSaving(true);

    try {
      const requestBody = {
        date,
        patientName:
          patientName.trim(),
        testName:
          testName.trim(),
        cost: Number(cost),
        labName,
      };

      const response = await fetch(
        "/api/laboratory/collections",
        {
          method: editingId
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            editingId
              ? {
                  ...requestBody,
                  id: editingId,
                }
              : requestBody
          ),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Unable to save record."
        );

        return;
      }

      const wasEditing =
        editingId !== null;

      resetForm();

      await loadRecords();

      alert(
        wasEditing
          ? "Lab sample record updated successfully."
          : "Lab sample record saved successfully."
      );
    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to server."
      );
    } finally {
      setSaving(false);
    }
  }

  function formatDate(
    value: string
  ) {
    return new Date(
      value
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  }

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-xl shadow-sm border p-5">

        <div className="mb-5">

          <h2 className="text-xl font-bold text-gray-900">
            {editingId
              ? "Edit Lab Sample Record"
              : "Lab Sample Collection"}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {editingId
              ? "Correct the information and update the record."
              : "Record samples collected and sent to laboratory."}
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-x-auto"
        >

          <div className="min-w-[1050px] grid grid-cols-[150px_1fr_1fr_140px_180px_130px_120px] gap-3 items-end">

            <div>

              <label className="block text-sm font-medium mb-2">
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value
                  )
                }
                className="w-full border rounded-lg px-3 py-2.5"
              />

            </div>

            <div>

              <label className="block text-sm font-medium mb-2">
                Patient Name
              </label>

              <input
                type="text"
                value={patientName}
                onChange={(event) =>
                  setPatientName(
                    event.target.value
                  )
                }
                placeholder="Enter patient name"
                className="w-full border rounded-lg px-3 py-2.5"
              />

            </div>

            <div>

              <label className="block text-sm font-medium mb-2">
                Test Name
              </label>

              <input
                type="text"
                value={testName}
                onChange={(event) =>
                  setTestName(
                    event.target.value
                  )
                }
                placeholder="Enter test name"
                className="w-full border rounded-lg px-3 py-2.5"
              />

            </div>

            <div>

              <label className="block text-sm font-medium mb-2">
                Cost
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(event) =>
                  setCost(
                    event.target.value
                  )
                }
                placeholder="₹ Amount"
                className="w-full border rounded-lg px-3 py-2.5"
              />

            </div>

            <div>

              <label className="block text-sm font-medium mb-2">
                Lab Name
              </label>

              <select
                value={labName}
                onChange={(event) =>
                  setLabName(
                    event.target.value
                  )
                }
                className="w-full border rounded-lg px-3 py-2.5 bg-white"
              >

                <option value="">
                  Select Lab
                </option>

                {LABS.map(
                  (lab) => (
                    <option
                      key={lab}
                      value={lab}
                    >
                      {lab}
                    </option>
                  )
                )}

              </select>

            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white rounded-lg px-4 py-2.5 font-semibold"
            >
              {saving
                ? editingId
                  ? "Updating..."
                  : "Saving..."
                : editingId
                  ? "Update Record"
                  : "Save Record"}
            </button>

            <div>

              {editingId ? (

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg px-4 py-2.5 font-semibold"
                >
                  Cancel
                </button>

              ) : (

                <div className="h-[46px]" />

              )}

            </div>

          </div>

        </form>

      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

        <div className="p-5 border-b">

          <h2 className="text-xl font-bold text-gray-900">
            Sample Collection Records
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px]">

            <thead className="bg-gray-50 border-b">

              <tr>

                <th className="text-left px-5 py-3 text-sm font-semibold">
                  Date
                </th>

                <th className="text-left px-5 py-3 text-sm font-semibold">
                  Patient Name
                </th>

                <th className="text-left px-5 py-3 text-sm font-semibold">
                  Test Name
                </th>

                <th className="text-left px-5 py-3 text-sm font-semibold">
                  Cost
                </th>

                <th className="text-left px-5 py-3 text-sm font-semibold">
                  Lab Name
                </th>

                <th className="text-left px-5 py-3 text-sm font-semibold">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    Loading records...
                  </td>

                </tr>

              ) : records.length === 0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    No sample collection records yet.
                  </td>

                </tr>

              ) : (

                records.map(
                  (record) => (

                    <tr
                      key={record.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">
                        {formatDate(
                          record.date
                        )}
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {record.patientName}
                      </td>

                      <td className="px-5 py-4">
                        {record.testName}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        ₹{" "}
                        {Number(
                          record.cost
                        ).toFixed(2)}
                      </td>

                      <td className="px-5 py-4">
                        {record.labName}
                      </td>

                      <td className="px-5 py-4">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              record
                            )
                          }
                          disabled={saving}
                          className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          Edit
                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}