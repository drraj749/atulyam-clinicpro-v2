"use client";

import { useEffect, useMemo, useState } from "react";

import { initialLabOrder } from "@/app/types/labOrder";

import type {
  LabOrderForm,
  LabTestOption,
} from "@/app/types/labOrder";

export default function LabOrderForm() {
  const [form, setForm] =
    useState<LabOrderForm>(initialLabOrder);

  const [tests, setTests] = useState<LabTestOption[]>([]);

  const [saving, setSaving] = useState(false);

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

  function toggleTest(id: number) {
    if (form.tests.includes(id)) {
      setForm({
        ...form,
        tests: form.tests.filter((x) => x !== id),
      });
    } else {
      setForm({
        ...form,
        tests: [...form.tests, id],
      });
    }
  }

  const total = useMemo(() => {
    return tests
      .filter((t) => form.tests.includes(t.id))
      .reduce((sum, t) => sum + t.price, 0);
  }, [tests, form.tests]);

  async function saveOrder() {
    if (!form.patientId) {
      alert("Enter Patient UHID");
      return;
    }

    if (form.tests.length === 0) {
      alert("Select at least one test");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/laboratory/orders",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(form),
        }
      );

      const result =
        await response.json();

      if (!result.success) {
        alert(result.message);
        return;
      }

      alert(
        "Lab Order Created\nOrder No : " +
          result.order.orderNo
      );

      setForm(initialLabOrder);

    } catch (error) {

      console.error(error);

      alert("Server Error");

    } finally {

      setSaving(false);

    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-2xl font-bold mb-6">
        New Laboratory Order
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <input
          placeholder="Patient UHID"
          value={form.patientId}
          onChange={(e) =>
            setForm({
              ...form,
              patientId: e.target.value,
            })
          }
          className="border rounded-lg p-3"
        />

        <input
          placeholder="Referred By"
          value={form.referredBy}
          onChange={(e) =>
            setForm({
              ...form,
              referredBy: e.target.value,
            })
          }
          className="border rounded-lg p-3"
        />

      </div>

      <div className="mt-8">

        <h3 className="font-semibold mb-4">
          Select Tests
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

          {tests.map((test) => (

            <label
              key={test.id}
              className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
            >

              <input
                type="checkbox"
                checked={form.tests.includes(test.id)}
                onChange={() =>
                  toggleTest(test.id)
                }
              />{" "}

              <span className="font-medium">
                {test.testName}
              </span>

              <div className="text-sm text-gray-500">
                ₹{test.price}
              </div>

            </label>

          ))}

        </div>

      </div>

      <div className="mt-8 flex justify-between items-center">

        <div className="text-2xl font-bold text-green-700">
          Total : ₹{total.toFixed(2)}
        </div>

        <button
          onClick={saveOrder}
          disabled={saving}
          className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg"
        >
          {saving ? "Saving..." : "Save Lab Order"}
        </button>

      </div>

    </div>
  );
}