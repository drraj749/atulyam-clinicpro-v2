"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Staff = {
  id: number;
  staffCode: string;
  name: string;
  role: string;
  mobile?: string | null;
  address?: string | null;
  joiningDate?: string | null;
  isActive: boolean;

  username?: string | null;
  loginEnabled?: boolean;
};

export default function EditStaffPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingLogin, setSavingLogin] =
    useState(false);

  const [form, setForm] = useState({
    staffCode: "",
    name: "",
    role: "",
    mobile: "",
    address: "",
    joiningDate: "",
    isActive: true,

    username: "",
    loginEnabled: false,
    password: "",
  });

  // ========================================
  // LOAD STAFF
  // ========================================

  useEffect(() => {
    if (id) {
      loadStaff();
    }
  }, [id]);

  async function loadStaff() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/staff/${id}`,
        {
          cache: "no-store",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Unable to load staff."
        );

        return;
      }

      const staff: Staff =
        result.staff;

      setForm({
        staffCode:
          staff.staffCode || "",

        name:
          staff.name || "",

        role:
          staff.role || "",

        mobile:
          staff.mobile || "",

        address:
          staff.address || "",

        joiningDate:
          staff.joiningDate
            ? new Date(
                staff.joiningDate
              )
                .toISOString()
                .split("T")[0]
            : "",

        isActive:
          staff.isActive ?? true,

        username:
          staff.username || "",

        loginEnabled:
          staff.loginEnabled ?? false,

        // Never load password
        password: "",
      });
    } catch (error) {
      console.error(error);

      alert(
        "Unable to load staff."
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // FORM CHANGE
  // ========================================

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
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

  // ========================================
  // UPDATE STAFF DETAILS
  // ========================================

  async function updateStaff() {
    if (!form.name.trim()) {
      alert(
        "Staff name is required."
      );
      return;
    }

    if (!form.role.trim()) {
      alert(
        "Staff role is required."
      );
      return;
    }

    if (!form.staffCode.trim()) {
      alert(
        "Staff code is required."
      );
      return;
    }

    setSaving(true);

    try {
      const response =
        await fetch(
          `/api/staff/${id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
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

              joiningDate:
                form.joiningDate,

              isActive:
                form.isActive,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Unable to update staff."
        );

        return;
      }

      alert(
        "Staff updated successfully."
      );

      router.push("/staff");
      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Server Error."
      );
    } finally {
      setSaving(false);
    }
  }

  // ========================================
  // SAVE STAFF LOGIN
  // ========================================

  async function updateStaffLogin() {
    if (!form.loginEnabled) {
      const confirmed =
        window.confirm(
          "Are you sure you want to disable login for this staff member?"
        );

      if (!confirmed) {
        return;
      }
    }

    if (
      form.loginEnabled &&
      !form.username.trim()
    ) {
      alert(
        "Username is required when login is enabled."
      );

      return;
    }

    if (
      form.loginEnabled &&
      form.username.trim().length < 3
    ) {
      alert(
        "Username must contain at least 3 characters."
      );

      return;
    }

    /*
     * Password is required only when:
     * 1. Login has never been configured
     * 2. Or administrator wants to set a new password
     */

    if (
      form.loginEnabled &&
      !form.password &&
      !form.username
    ) {
      alert(
        "Please enter a password."
      );

      return;
    }

    setSavingLogin(true);

    try {
      const response =
        await fetch(
          `/api/staff/${id}/login`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
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
            "Unable to update staff login."
        );

        return;
      }

      alert(
        result.message ||
          "Staff login updated successfully."
      );

      // Password should never remain
      // in the form after saving.

      setForm((prev) => ({
        ...prev,
        password: "",
      }));
    } catch (error) {
      console.error(error);

      alert(
        "Unable to update staff login."
      );
    } finally {
      setSavingLogin(false);
    }
  }

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <main className="p-8">

        <div className="bg-white rounded-xl shadow p-8 text-center">

          <div className="text-lg font-semibold">
            Loading Staff...
          </div>

          <div className="text-gray-500 mt-2">
            Please wait.
          </div>

        </div>

      </main>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <main className="p-8">

      {/* ================================== */}
      {/* HEADER */}
      {/* ================================== */}

      <div className="bg-white rounded-xl shadow p-6">

        <h1 className="text-3xl font-bold text-blue-900">
          Edit Staff
        </h1>

        <p className="text-gray-500 mt-2">
          Update staff member details and
          login credentials.
        </p>

      </div>

      {/* ================================== */}
      {/* STAFF DETAILS */}
      {/* ================================== */}

      <div className="bg-white rounded-xl shadow p-6 mt-6">

        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Staff Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* STAFF CODE */}

          <div>

            <label className="font-medium block mb-2">
              Staff Code *
            </label>

            <input
              name="staffCode"
              value={
                form.staffCode
              }
              onChange={
                handleChange
              }
              className="border rounded-lg p-3 w-full"
              placeholder="Staff code"
            />

          </div>

          {/* NAME */}

          <div>

            <label className="font-medium block mb-2">
              Staff Name *
            </label>

            <input
              name="name"
              value={
                form.name
              }
              onChange={
                handleChange
              }
              className="border rounded-lg p-3 w-full"
              placeholder="Staff name"
            />

          </div>

          {/* ROLE */}

          <div>

            <label className="font-medium block mb-2">
              Role *
            </label>

            <select
              name="role"
              value={
                form.role
              }
              onChange={
                handleChange
              }
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
              value={
                form.mobile
              }
              onChange={
                handleChange
              }
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
              value={
                form.joiningDate
              }
              onChange={
                handleChange
              }
              className="border rounded-lg p-3 w-full"
            />

          </div>

          {/* ACTIVE STATUS */}

          <div>

            <label className="font-medium block mb-2">
              Staff Status
            </label>

            <label className="flex items-center gap-3 border rounded-lg p-3">

              <input
                type="checkbox"
                name="isActive"
                checked={
                  form.isActive
                }
                onChange={
                  handleChange
                }
                className="w-5 h-5"
              />

              <span className="font-medium">
                Active Staff
              </span>

            </label>

          </div>

          {/* ADDRESS */}

          <div className="md:col-span-2">

            <label className="font-medium block mb-2">
              Address
            </label>

            <textarea
              name="address"
              value={
                form.address
              }
              onChange={
                handleChange
              }
              rows={3}
              className="border rounded-lg p-3 w-full"
              placeholder="Staff address"
            />

          </div>

        </div>

        {/* STAFF DETAILS BUTTONS */}

        <div className="mt-8 flex gap-4">

          <button
            type="button"
            onClick={
              updateStaff
            }
            disabled={
              saving
            }
            className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold"
          >
            {saving
              ? "Updating..."
              : "Update Staff"}
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/staff"
              )
            }
            className="bg-gray-300 hover:bg-gray-400 px-8 py-3 rounded-lg font-semibold"
          >
            Cancel
          </button>

        </div>

      </div>

      {/* ================================== */}
      {/* STAFF LOGIN */}
      {/* ================================== */}

      <div className="bg-white rounded-xl shadow p-6 mt-6">

        <div className="flex items-start justify-between gap-4">

          <div>

            <h2 className="text-xl font-bold text-blue-900">
              Staff Login
            </h2>

            <p className="text-gray-500 mt-1">
              Give this staff member secure
              login access for daily attendance.
            </p>

          </div>

          {/* LOGIN BADGE */}

          <div>

            {form.loginEnabled ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                Login Enabled
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-600">
                Login Disabled
              </span>
            )}

          </div>

        </div>

        <div className="border-t mt-6 pt-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ENABLE LOGIN */}

            <div>

              <label className="font-medium block mb-2">
                Login Status
              </label>

              <label className="flex items-center gap-3 border rounded-lg p-3">

                <input
                  type="checkbox"
                  name="loginEnabled"
                  checked={
                    form.loginEnabled
                  }
                  onChange={
                    handleChange
                  }
                  className="w-5 h-5"
                />

                <div>

                  <div className="font-semibold">
                    Enable Staff Login
                  </div>

                  <div className="text-sm text-gray-500">
                    Allow this staff member to
                    access the attendance system.
                  </div>

                </div>

              </label>

            </div>

            {/* USERNAME */}

            <div>

              <label className="font-medium block mb-2">
                Username *
              </label>

              <input
                name="username"
                value={
                  form.username
                }
                onChange={
                  handleChange
                }
                disabled={
                  !form.loginEnabled
                }
                autoComplete="off"
                className="border rounded-lg p-3 w-full disabled:bg-gray-100 disabled:text-gray-400"
                placeholder="e.g. dilip"
              />

              <p className="text-xs text-gray-500 mt-1">
                Minimum 3 characters.
              </p>

            </div>

            {/* PASSWORD */}

            <div>

              <label className="font-medium block mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={
                  form.password
                }
                onChange={
                  handleChange
                }
                disabled={
                  !form.loginEnabled
                }
                autoComplete="new-password"
                className="border rounded-lg p-3 w-full disabled:bg-gray-100 disabled:text-gray-400"
                placeholder={
                  form.username
                    ? "Enter new password to change it"
                    : "Enter password"
                }
              />

              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 characters.
              </p>

            </div>

            {/* CURRENT USERNAME */}

            <div>

              <label className="font-medium block mb-2">
                Current Login
              </label>

              <div className="border rounded-lg p-3 bg-gray-50">

                {form.loginEnabled &&
                form.username ? (
                  <span className="font-semibold text-green-700">
                    @{form.username}
                  </span>
                ) : (
                  <span className="text-gray-400">
                    No login configured
                  </span>
                )}

              </div>

            </div>

          </div>

          {/* LOGIN BUTTON */}

          <div className="mt-6 flex items-center gap-4">

            <button
              type="button"
              onClick={
                updateStaffLogin
              }
              disabled={
                savingLogin
              }
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-7 py-3 rounded-lg font-semibold"
            >
              {savingLogin
                ? "Saving Login..."
                : "Save Login Credentials"}
            </button>

            {form.loginEnabled && (
              <span className="text-sm text-gray-500">
                Staff will use{" "}
                <strong>
                  /staff/login
                </strong>{" "}
                to sign in.
              </span>
            )}

          </div>

        </div>

      </div>

    </main>
  );
}