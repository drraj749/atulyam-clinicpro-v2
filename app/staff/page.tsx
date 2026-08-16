"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Staff = {
  id: number;
  staffCode: string;
  name: string;
  role: string;
  mobile?: string | null;
  address?: string | null;
  joiningDate?: string | null;
  isActive: boolean;
};

export default function StaffPage() {
  const [staff, setStaff] =
    useState<Staff[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    setLoading(true);

    try {
      const res = await fetch(
        "/api/staff"
      );

      const json = await res.json();

      if (json.success) {
        setStaff(json.staff || []);
      } else {
        alert(
          json.message ||
            "Unable to load staff."
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        "Unable to load staff."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteStaff(
    id: number
  ) {
    if (
      !confirm(
        "Deactivate this staff member?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/staff/${id}`,
        {
          method: "DELETE",
        }
      );

      const json =
        await res.json();

      if (!res.ok) {
        alert(
          json.message ||
            "Unable to deactivate staff."
        );
        return;
      }

      loadStaff();
    } catch (error) {
      console.error(error);

      alert(
        "Unable to deactivate staff."
      );
    }
  }

  const filteredStaff =
    staff.filter((member) => {
      const text =
        search
          .toLowerCase()
          .trim();

      if (!text) {
        return true;
      }

      return (
        member.name
          .toLowerCase()
          .includes(text) ||
        member.staffCode
          .toLowerCase()
          .includes(text) ||
        member.role
          .toLowerCase()
          .includes(text) ||
        (member.mobile || "")
          .toLowerCase()
          .includes(text)
      );
    });

  return (
    <main className="p-8">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-3xl font-bold text-blue-900">
            Staff Management
          </h1>

          <p className="text-gray-500 mt-1">
            Manage hospital staff members
          </p>
        </div>

        <Link
          href="/staff/new"
          className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-lg font-semibold"
        >
          + New Staff
        </Link>

      </div>

      {/* SEARCH */}

      <div className="bg-white rounded-xl shadow p-5 mb-6">

        <input
          type="text"
          placeholder="Search Name / Staff Code / Role / Mobile"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="border rounded-lg p-3 w-full"
        />

      </div>

      {/* STAFF TABLE */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-blue-700 text-white">

            <tr>

              <th className="p-3 text-left">
                Staff Code
              </th>

              <th className="p-3 text-left">
                Name
              </th>

              <th className="p-3 text-left">
                Role
              </th>

              <th className="p-3 text-left">
                Mobile
              </th>

              <th className="p-3 text-left">
                Joining Date
              </th>

              <th className="p-3 text-left">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center p-8"
                >
                  Loading...
                </td>
              </tr>
            )}

            {!loading &&
              filteredStaff.length ===
                0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center p-8 text-gray-500"
                  >
                    No staff found.
                  </td>
                </tr>
              )}

            {!loading &&
              filteredStaff.map(
                (member) => (

                  <tr
                    key={member.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="p-3 font-semibold">
                      {member.staffCode}
                    </td>

                    <td className="p-3">
                      {member.name}
                    </td>

                    <td className="p-3">
                      {member.role}
                    </td>

                    <td className="p-3">
                      {member.mobile ||
                        "-"}
                    </td>

                    <td className="p-3">
                      {member.joiningDate
                        ? new Date(
                            member.joiningDate
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "-"}
                    </td>

                    <td className="p-3 space-x-4">

                      <Link
                        href={`/staff/edit/${member.id}`}
                        className="text-blue-700 hover:text-blue-900 font-semibold"
                      >
                        ✏️ Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          deleteStaff(
                            member.id
                          )
                        }
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Deactivate
                      </button>

                    </td>

                  </tr>

                )
              )}

          </tbody>

        </table>

      </div>

    </main>
  );
}