"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewStaffPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    staffCode: "",
    name: "",
    role: "",
    mobile: "",
    address: "",
    joiningDate: "",
    username: "",
    password: "",
    loginEnabled: true,
    isActive: true,
  });

 function handleChange(
  e: React.ChangeEvent<
    HTMLInputElement |
    HTMLSelectElement |
    HTMLTextAreaElement
  >
) {
    const {
      name,
      value,
      type,
    } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? (
              e.target as HTMLInputElement
            ).checked
          : value,
    }));
  }

  async function saveStaff() {
    if (!form.name.trim()) {
      alert("Staff name is required.");
      return;
    }

    if (!form.role.trim()) {
      alert("Staff role is required.");
      return;
    }

    if (form.loginEnabled) {
      if (!form.username.trim()) {
        alert("Username is required.");
        return;
      }

      if (form.password.length < 4) {
        alert(
          "Password must be at least 4 characters."
        );
        return;
      }
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/staff",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            ...form,

            staffCode:
              form.staffCode.trim(),

            name:
              form.name.trim(),

            role:
              form.role.trim(),

            mobile:
              form.mobile.trim(),

            address:
              form.address.trim(),

            username:
              form.username.trim(),

            password:
              form.password,

            loginEnabled:
              form.loginEnabled,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Unable to save staff."
        );
        return;
      }

      alert(
        "Staff added successfully."
      );

      router.push("/staff");
    } catch (error) {
      console.error(error);

      alert("Server Error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="p-8">

      {/* HEADER */}

      <div className="bg-white rounded-xl shadow p-6">

        <h1 className="text-3xl font-bold text-blue-900">
          Add New Staff
        </h1>

        <p className="text-gray-500 mt-2">
          Add a hospital staff member
          and create their login account.
        </p>

      </div>

      {/* STAFF DETAILS */}

      <div className="bg-white rounded-xl shadow p-6 mt-6">

        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Staff Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* STAFF CODE */}

          <div>
            <label className="font-medium block mb-2">
              Staff Code
            </label>

            <input
              name="staffCode"
              value={form.staffCode}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
              placeholder="Auto generated if blank"
            />
          </div>

          {/* NAME */}

          <div>
            <label className="font-medium block mb-2">
              Staff Name *
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
              placeholder="Enter staff name"
            />
          </div>

          {/* ROLE */}

          <div>
            <label className="font-medium block mb-2">
              Role *
            </label>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            >
              <option value="">
                Select Role
              </option>

              <option value="Receptionist">
                Receptionist
              </option>

              <option value="Nurse">
                Nurse
              </option>

              <option value="Ward Boy">
                Ward Boy
              </option>

              <option value="Lab Technician">
                Lab Technician
              </option>

              <option value="Pharmacist">
                Pharmacist
              </option>

              <option value="Marketing">
                Marketing
              </option>

              <option value="Housekeeping">
                Housekeeping
              </option>

              <option value="Accountant">
                Accountant
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          {/* MOBILE */}

          <div>
            <label className="font-medium block mb-2">
              Mobile
            </label>

            <input
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
              placeholder="Mobile number"
            />
          </div>

          {/* JOINING DATE */}

          <div>
            <label className="font-medium block mb-2">
              Joining Date
            </label>

            <input
              type="date"
              name="joiningDate"
              value={form.joiningDate}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full"
            />
          </div>

          {/* ADDRESS */}

          <div className="md:col-span-2">
            <label className="font-medium block mb-2">
              Address
            </label>

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              className="border rounded-lg p-3 w-full"
              placeholder="Staff address"
            />
          </div>

        </div>
      </div>

      {/* LOGIN */}

      <div className="bg-white rounded-xl shadow p-6 mt-6">

        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Staff Login
            </h2>

            <p className="text-gray-500 mt-1">
              Give this staff member access
              to the attendance system.
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">

            <input
              type="checkbox"
              name="loginEnabled"
              checked={form.loginEnabled}
              onChange={handleChange}
              className="w-5 h-5"
            />

            <span className="font-medium">
              Enable Login
            </span>

          </label>

        </div>

        {form.loginEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* USERNAME */}

            <div>
              <label className="font-medium block mb-2">
                Username *
              </label>

              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                autoComplete="off"
                className="border rounded-lg p-3 w-full"
                placeholder="Create username"
              />

              <p className="text-sm text-gray-500 mt-1">
                Example: pooja
              </p>
            </div>

            {/* PASSWORD */}

            <div>
              <label className="font-medium block mb-2">
                Password *
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                className="border rounded-lg p-3 w-full"
                placeholder="Create password"
              />
            </div>

          </div>
        )}

      </div>

      {/* BUTTONS */}

      <div className="mt-8 flex gap-4">

        <button
          type="button"
          onClick={saveStaff}
          disabled={saving}
          className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold"
        >
          {saving
            ? "Saving..."
            : "Save Staff"}
        </button>

        <button
          type="button"
          onClick={() =>
            router.push("/staff")
          }
          className="bg-gray-300 hover:bg-gray-400 px-8 py-3 rounded-lg"
        >
          Cancel
        </button>

      </div>

    </main>
  );
}