"use client";

import { useEffect, useState } from "react";

type LabTest = {
  id: number;
  testCode: string;
  category: string;
  testName: string;
  specimen: string;
  price: number;
  active: boolean;
};

export default function LabTestTable() {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    const response = await fetch("/api/laboratory/tests");

    const result = await response.json();

    if (result.success) {
      setTests(result.tests);
    }
  }

  async function deleteTest(id: number) {
    if (!confirm("Delete this test?")) return;

    const response = await fetch(
      "/api/laboratory/tests/" + id,
      {
        method: "DELETE",
      }
    );

    const result = await response.json();

    if (!result.success) {
      alert(result.message);
      return;
    }

    loadTests();
  }

  const filtered = tests.filter((test) => {
    const text =
      (
        test.testCode +
        " " +
        test.testName +
        " " +
        test.category
      ).toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold">
          Laboratory Test Master
        </h2>

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search Test..."
          className="border rounded-lg px-4 py-2 w-72"
        />

      </div>

      <table className="w-full border">

        <thead className="bg-blue-700 text-white">

          <tr>

            <th className="p-3">Code</th>

            <th className="p-3">Test</th>

            <th className="p-3">Category</th>

            <th className="p-3">Specimen</th>

            <th className="p-3">Price</th>

            <th className="p-3">Status</th>

            <th className="p-3">Action</th>

          </tr>

        </thead>

        <tbody>

          {filtered.map((test) => (

            <tr
              key={test.id}
              className="border-b hover:bg-gray-50"
            >

              <td className="p-3">
                {test.testCode}
              </td>

              <td className="p-3 font-semibold">
                {test.testName}
              </td>

              <td className="p-3">
                {test.category}
              </td>

              <td className="p-3">
                {test.specimen}
              </td>

              <td className="p-3">
                ₹{test.price}
              </td>

              <td className="p-3">
                {test.active ? (
                  <span className="text-green-600 font-semibold">
                    Active
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">
                    Inactive
                  </span>
                )}
              </td>

              <td className="p-3 flex gap-2">

                <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteTest(test.id)
                  }
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}