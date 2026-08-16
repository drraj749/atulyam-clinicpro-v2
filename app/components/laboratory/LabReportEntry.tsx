"use client";

import { useState } from "react";

import {
  LabReportItem,
  emptyReportItem,
} from "@/app/types/labReport";

export default function LabReportEntry() {
  const [items, setItems] = useState<LabReportItem[]>([
    { ...emptyReportItem, id: 1 },
  ]);

  function update(
    index: number,
    field: keyof LabReportItem,
    value: string
  ) {
    const copy = [...items];

    copy[index] = {
      ...copy[index],
      [field]: value,
    };

    setItems(copy);
  }

  function addRow() {
    setItems([
      ...items,
      {
        ...emptyReportItem,
        id: Date.now(),
      },
    ]);
  }

  function removeRow(index: number) {
    const copy = [...items];

    copy.splice(index, 1);

    if (copy.length === 0) {
      copy.push({
        ...emptyReportItem,
        id: Date.now(),
      });
    }

    setItems(copy);
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold">
          Laboratory Report Entry
        </h2>

        <button
          onClick={addRow}
          className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg"
        >
          + Add Test Result
        </button>

      </div>

      <div className="space-y-4">

        {items.map((item, index) => (

          <div
            key={item.id}
            className="grid grid-cols-5 gap-3"
          >

            <input
              placeholder="Test Name"
              value={item.testName}
              onChange={(e) =>
                update(
                  index,
                  "testName",
                  e.target.value
                )
              }
              className="border rounded-lg p-2"
            />

            <input
              placeholder="Result"
              value={item.result}
              onChange={(e) =>
                update(
                  index,
                  "result",
                  e.target.value
                )
              }
              className="border rounded-lg p-2"
            />

            <input
              placeholder="Unit"
              value={item.unit}
              onChange={(e) =>
                update(
                  index,
                  "unit",
                  e.target.value
                )
              }
              className="border rounded-lg p-2"
            />

            <input
              placeholder="Normal Range"
              value={item.normalRange}
              onChange={(e) =>
                update(
                  index,
                  "normalRange",
                  e.target.value
                )
              }
              className="border rounded-lg p-2"
            />

            <button
              onClick={() =>
                removeRow(index)
              }
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Remove
            </button>

          </div>

        ))}

      </div>

      <button
        className="mt-8 bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg"
      >
        Save Report
      </button>

    </div>
  );
}