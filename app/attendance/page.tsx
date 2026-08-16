"use client";

import { useEffect, useState } from "react";

type Staff = {
  id: number;
  staffCode: string;
  name: string;
  role: string;
  mobile?: string | null;
};

type AttendanceRecord = {
  id?: number;
  status: string;
  checkIn?: string | null;
  checkOut?: string | null;
  remarks?: string | null;
  attendanceDate?: string;
};

type AttendanceRow = {
  staff: Staff;
  attendance: AttendanceRecord | null;
};

const statusOptions = [
  "Present",
  "Absent",
  "Half Day",
  "Leave",
];

export default function AttendancePage() {
  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [rows, setRows] =
    useState<AttendanceRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [savingId, setSavingId] =
    useState<number | null>(null);

  useEffect(() => {
    loadAttendance();
  }, [date]);

  async function loadAttendance() {
    setLoading(true);

    try {
      const response =
        await fetch(
          `/api/attendance?date=${date}`
        );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Unable to load attendance."
        );
        return;
      }

      setRows(
        result.attendance || []
      );
    } catch (error) {
      console.error(error);

      alert(
        "Unable to load attendance."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateRow(
    staffId: number,
    field:
      | "status"
      | "checkIn"
      | "checkOut"
      | "remarks",
    value: string
  ) {
    setRows((previous) =>
      previous.map((row) => {
        if (
          row.staff.id !== staffId
        ) {
          return row;
        }

        const current =
          row.attendance || {
            status: "Present",
            checkIn: null,
            checkOut: null,
            remarks: "",
          };

        return {
          ...row,

          attendance: {
            ...current,
            [field]: value,
          },
        };
      })
    );
  }

  async function saveAttendance(
    row: AttendanceRow
  ) {
    const attendance =
      row.attendance || {
        status: "Present",
        checkIn: null,
        checkOut: null,
        remarks: "",
      };

    setSavingId(row.staff.id);

    try {
      const response =
        await fetch(
          "/api/attendance",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              staffId:
                row.staff.id,

              attendanceDate:
                date,

              status:
                attendance.status ||
                "Present",

              checkIn:
                attendance.checkIn ||
                null,

              checkOut:
                attendance.checkOut ||
                null,

              remarks:
                attendance.remarks ||
                "",
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Unable to save attendance."
        );
        return;
      }

      alert(
        `${row.staff.name} attendance saved.`
      );

      await loadAttendance();
    } catch (error) {
      console.error(error);

      alert(
        "Unable to save attendance."
      );
    } finally {
      setSavingId(null);
    }
  }

  function markAllPresent() {
    setRows((previous) =>
      previous.map((row) => ({
        ...row,

        attendance: {
          ...(row.attendance || {}),
          status: "Present",
        } as AttendanceRecord,
      }))
    );
  }

  const presentCount =
    rows.filter(
      (row) =>
        row.attendance?.status ===
        "Present"
    ).length;

  const absentCount =
    rows.filter(
      (row) =>
        row.attendance?.status ===
        "Absent"
    ).length;

  const halfDayCount =
    rows.filter(
      (row) =>
        row.attendance?.status ===
        "Half Day"
    ).length;

  const leaveCount =
    rows.filter(
      (row) =>
        row.attendance?.status ===
        "Leave"
    ).length;

  return (
    <main className="p-8">

      {/* HEADER */}

      <div className="flex justify-between items-start mb-6">

        <div>
          <h1 className="text-3xl font-bold text-blue-900">
            Staff Attendance
          </h1>

          <p className="text-gray-500 mt-1">
            Daily staff attendance
            management
          </p>
        </div>

        <div className="flex gap-3 items-center">

          <label className="font-medium">
            Date
          </label>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(
                e.target.value
              )
            }
            className="border rounded-lg p-3"
          />

          <button
            type="button"
            onClick={
              markAllPresent
            }
            className="bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-lg font-semibold"
          >
            Mark All Present
          </button>

        </div>

      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Present
          </p>

          <p className="text-3xl font-bold text-green-700 mt-1">
            {presentCount}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Absent
          </p>

          <p className="text-3xl font-bold text-red-600 mt-1">
            {absentCount}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Half Day
          </p>

          <p className="text-3xl font-bold text-orange-600 mt-1">
            {halfDayCount}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Leave
          </p>

          <p className="text-3xl font-bold text-blue-700 mt-1">
            {leaveCount}
          </p>
        </div>

      </div>

      {/* ATTENDANCE TABLE */}

      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full">

          <thead className="bg-blue-700 text-white">

            <tr>

              <th className="p-3 text-left">
                Code
              </th>

              <th className="p-3 text-left">
                Staff Name
              </th>

              <th className="p-3 text-left">
                Role
              </th>

              <th className="p-3 text-left">
                Status
              </th>

              <th className="p-3 text-left">
                Check In
              </th>

              <th className="p-3 text-left">
                Check Out
              </th>

              <th className="p-3 text-left">
                Remarks
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
                  colSpan={8}
                  className="text-center p-10"
                >
                  Loading attendance...
                </td>
              </tr>
            )}

            {!loading &&
              rows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center p-10 text-gray-500"
                  >
                    No active staff found.
                  </td>
                </tr>
              )}

            {!loading &&
              rows.map((row) => {

                const attendance =
                  row.attendance || {
                    status: "Present",
                    checkIn: "",
                    checkOut: "",
                    remarks: "",
                  };

                return (
                  <tr
                    key={row.staff.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="p-3 font-semibold">
                      {
                        row.staff
                          .staffCode
                      }
                    </td>

                    <td className="p-3">
                      {
                        row.staff.name
                      }
                    </td>

                    <td className="p-3">
                      {
                        row.staff.role
                      }
                    </td>

                    {/* STATUS */}

                    <td className="p-3">

                      <select
                        value={
                          attendance.status ||
                          "Present"
                        }
                        onChange={(e) =>
                          updateRow(
                            row.staff.id,
                            "status",
                            e.target.value
                          )
                        }
                        className="border rounded-lg p-2"
                      >

                        {statusOptions.map(
                          (status) => (
                            <option
                              key={
                                status
                              }
                              value={
                                status
                              }
                            >
                              {status}
                            </option>
                          )
                        )}

                      </select>

                    </td>

                    {/* CHECK IN */}

                    <td className="p-3">

                      <input
                        type="time"
                        value={
                          attendance.checkIn
                            ? new Date(
                                attendance.checkIn
                              )
                                .toTimeString()
                                .slice(
                                  0,
                                  5
                                )
                            : ""
                        }
                        onChange={(e) =>
                          updateRow(
                            row.staff.id,
                            "checkIn",
                            e.target.value
                              ? `${date}T${e.target.value}`
                              : ""
                          )
                        }
                        className="border rounded-lg p-2"
                      />

                    </td>

                    {/* CHECK OUT */}

                    <td className="p-3">

                      <input
                        type="time"
                        value={
                          attendance.checkOut
                            ? new Date(
                                attendance.checkOut
                              )
                                .toTimeString()
                                .slice(
                                  0,
                                  5
                                )
                            : ""
                        }
                        onChange={(e) =>
                          updateRow(
                            row.staff.id,
                            "checkOut",
                            e.target.value
                              ? `${date}T${e.target.value}`
                              : ""
                          )
                        }
                        className="border rounded-lg p-2"
                      />

                    </td>

                    {/* REMARKS */}

                    <td className="p-3">

                      <input
                        type="text"
                        value={
                          attendance.remarks ||
                          ""
                        }
                        onChange={(e) =>
                          updateRow(
                            row.staff.id,
                            "remarks",
                            e.target.value
                          )
                        }
                        placeholder="Optional"
                        className="border rounded-lg p-2 w-40"
                      />

                    </td>

                    {/* SAVE */}

                    <td className="p-3">

                      <button
                        type="button"
                        onClick={() =>
                          saveAttendance(
                            row
                          )
                        }
                        disabled={
                          savingId ===
                          row.staff.id
                        }
                        className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        {savingId ===
                        row.staff.id
                          ? "Saving..."
                          : "Save"}
                      </button>

                    </td>

                  </tr>
                );
              })}

          </tbody>

        </table>

      </div>

    </main>
  );
}