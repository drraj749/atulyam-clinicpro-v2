"use client";

import {
  useEffect,
  useState,
} from "react";

type Attendance = {
  id: number;
  attendanceDate: string;
  status: string;
  checkIn: string | null;
  checkOut: string | null;
  remarks: string | null;
};

type StaffRecord = {
  staffId: number;
  staffCode: string;
  name: string;
  role: string;
  mobile: string | null;
  attendance: Attendance | null;
};

type Summary = {
  totalStaff: number;
  present: number;
  halfDay: number;
  leave: number;
  absent: number;
  checkedIn: number;
  checkedOut: number;
};

export default function AdminAttendancePage() {
  const [date, setDate] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [records, setRecords] =
    useState<StaffRecord[]>(
      []
    );

  const [summary, setSummary] =
    useState<Summary>({
      totalStaff: 0,
      present: 0,
      halfDay: 0,
      leave: 0,
      absent: 0,
      checkedIn: 0,
      checkedOut: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState<StaffRecord | null>(
      null
    );

  /**
   * ========================================
   * INDIA TODAY
   * ========================================
   */

  function getToday() {
    return new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).format(new Date());
  }

  /**
   * ========================================
   * INITIAL LOAD
   * ========================================
   */

  useEffect(() => {
    const today =
      getToday();

    setDate(today);
  }, []);

  useEffect(() => {
    if (date) {
      loadAttendance();
    }
  }, [date]);

  /**
   * ========================================
   * LOAD
   * ========================================
   */

  async function loadAttendance() {
    setLoading(true);

    try {
      const params =
        new URLSearchParams();

      params.set(
        "date",
        date
      );

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      const response =
        await fetch(
          `/api/staff/attendance/admin?${params.toString()}`,
          {
            cache: "no-store",
          }
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

      setRecords(
        result.records || []
      );

      setSummary(
        result.summary || {
          totalStaff: 0,
          present: 0,
          halfDay: 0,
          leave: 0,
          absent: 0,
          checkedIn: 0,
          checkedOut: 0,
        }
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

  /**
   * ========================================
   * STATUS
   * ========================================
   */

  function statusClass(
    status: string
  ) {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-700";

      case "Half Day":
        return "bg-yellow-100 text-yellow-700";

      case "Leave":
        return "bg-red-100 text-red-700";

      case "Absent":
        return "bg-gray-200 text-gray-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  /**
   * ========================================
   * FORMAT TIME
   * ========================================
   */

  function formatTime(
    value: string | null
  ) {
    if (!value) {
      return "—";
    }

    return new Date(
      value
    ).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  /**
   * ========================================
   * WORKING HOURS
   * ========================================
   */

  function workingHours(
    attendance:
      | Attendance
      | null
  ) {
    if (
      !attendance?.checkIn ||
      !attendance?.checkOut
    ) {
      return "—";
    }

    const start =
      new Date(
        attendance.checkIn
      ).getTime();

    const end =
      new Date(
        attendance.checkOut
      ).getTime();

    const difference =
      end - start;

    if (
      difference <= 0
    ) {
      return "—";
    }

    const totalMinutes =
      Math.floor(
        difference /
          60000
      );

    const hours =
      Math.floor(
        totalMinutes /
          60
      );

    const minutes =
      totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  }

  /**
   * ========================================
   * OPEN EDIT
   * ========================================
   */

  function openEdit(
    record: StaffRecord
  ) {
    setEditing(record);
  }

  /**
   * ========================================
   * SAVE ADMIN EDIT
   * ========================================
   */

  async function saveEdit() {
    if (!editing) {
      return;
    }

    setSaving(true);

    try {
      const response =
        await fetch(
          "/api/staff/attendance/admin",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              staffId:
                editing.staffId,

              attendanceDate:
                date,

              status:
                editing.attendance
                  ?.status ||
                "Present",

              checkIn:
                editing.attendance
                  ?.checkIn ||
                null,

              checkOut:
                editing.attendance
                  ?.checkOut ||
                null,

              remarks:
                editing.attendance
                  ?.remarks ||
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

      setEditing(null);

      await loadAttendance();

      alert(
        "Attendance updated successfully."
      );
    } catch (error) {
      console.error(error);

      alert(
        "Unable to save attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * ========================================
   * UPDATE EDIT FORM
   * ========================================
   */

  function updateEditing(
    changes: Partial<Attendance>
  ) {
    if (!editing) {
      return;
    }

    setEditing({
      ...editing,

      attendance: {
        ...(editing.attendance || {
          id: 0,
          attendanceDate:
            date,
          status:
            "Present",
          checkIn:
            null,
          checkOut:
            null,
          remarks:
            null,
        }),

        ...changes,
      },
    });
  }

  /**
   * ========================================
   * PRINT
   * ========================================
   */

  function printReport() {
    window.print();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">

      <div className="max-w-7xl mx-auto">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="bg-blue-900 text-white rounded-2xl shadow p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <p className="text-blue-200 text-sm font-semibold">
                ATULYAM HOSPITAL
              </p>

              <h1 className="text-2xl md:text-3xl font-bold mt-1">
                Staff Attendance
              </h1>

              <p className="text-blue-100 mt-1">
                Admin Attendance Management
              </p>

            </div>

            <button
              type="button"
              onClick={
                printReport
              }
              className="bg-white text-blue-900 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 print:hidden"
            >
              🖨 Print Report
            </button>

          </div>

        </div>

        {/* ================================= */}
        {/* FILTERS */}
        {/* ================================= */}

        <div className="bg-white rounded-2xl shadow mt-5 p-5 print:hidden">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>

              <label className="block font-semibold mb-2">
                Attendance Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
              />

            </div>

            <div>

              <label className="block font-semibold mb-2">
                Search Staff
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key ===
                    "Enter"
                  ) {
                    loadAttendance();
                  }
                }}
                placeholder="Name, code, role or mobile"
                className="border rounded-lg p-3 w-full"
              />

            </div>

            <div className="flex items-end">

              <button
                type="button"
                onClick={
                  loadAttendance
                }
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold w-full"
              >
                🔎 Search / Refresh
              </button>

            </div>

          </div>

        </div>

        {/* ================================= */}
        {/* SUMMARY */}
        {/* ================================= */}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-5">

          <SummaryCard
            title="Total Staff"
            value={
              summary.totalStaff
            }
          />

          <SummaryCard
            title="Present"
            value={
              summary.present
            }
          />

          <SummaryCard
            title="Half Day"
            value={
              summary.halfDay
            }
          />

          <SummaryCard
            title="Leave"
            value={
              summary.leave
            }
          />

          <SummaryCard
            title="Absent"
            value={
              summary.absent
            }
          />

          <SummaryCard
            title="Checked In"
            value={
              summary.checkedIn
            }
          />

          <SummaryCard
            title="Checked Out"
            value={
              summary.checkedOut
            }
          />

        </div>

        {/* ================================= */}
        {/* REPORT */}
        {/* ================================= */}

        <div className="bg-white rounded-2xl shadow mt-5 overflow-hidden">

          <div className="p-5 border-b">

            <h2 className="text-xl font-bold text-blue-900">
              Attendance Report
            </h2>

            <p className="text-gray-500 mt-1">
              Date:{" "}
              <span className="font-semibold">
                {date}
              </span>
            </p>

          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading attendance...
            </div>
          ) : records.length ===
            0 ? (
            <div className="p-12 text-center text-gray-500">
              No active staff found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>

                  <tr className="bg-gray-50 border-b">

                    <th className="text-left p-4">
                      #
                    </th>

                    <th className="text-left p-4">
                      Staff
                    </th>

                    <th className="text-left p-4">
                      Role
                    </th>

                    <th className="text-left p-4">
                      Status
                    </th>

                    <th className="text-left p-4">
                      Check In
                    </th>

                    <th className="text-left p-4">
                      Check Out
                    </th>

                    <th className="text-left p-4">
                      Hours
                    </th>

                    <th className="text-left p-4">
                      Remarks
                    </th>

                    <th className="text-left p-4 print:hidden">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {records.map(
                    (
                      record,
                      index
                    ) => (
                      <tr
                        key={
                          record.staffId
                        }
                        className="border-b hover:bg-gray-50"
                      >

                        <td className="p-4">
                          {index +
                            1}
                        </td>

                        <td className="p-4">

                          <div className="font-bold">
                            {
                              record.name
                            }
                          </div>

                          <div className="text-xs text-gray-500">
                            {
                              record.staffCode
                            }
                          </div>

                        </td>

                        <td className="p-4">
                          {
                            record.role
                          }
                        </td>

                        <td className="p-4">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass(
                              record
                                .attendance
                                ?.status ||
                                "Absent"
                            )}`}
                          >
                            {
                              record
                                .attendance
                                ?.status ||
                                "Absent"
                            }
                          </span>

                        </td>

                        <td className="p-4">
                          {formatTime(
                            record
                              .attendance
                              ?.checkIn ||
                              null
                          )}
                        </td>

                        <td className="p-4">
                          {formatTime(
                            record
                              .attendance
                              ?.checkOut ||
                              null
                          )}
                        </td>

                        <td className="p-4 font-semibold">
                          {workingHours(
                            record.attendance
                          )}
                        </td>

                        <td className="p-4 text-gray-500">
                          {
                            record
                              .attendance
                              ?.remarks ||
                            "—"
                          }
                        </td>

                        <td className="p-4 print:hidden">

                          <button
                            type="button"
                            onClick={() =>
                              openEdit(
                                record
                              )
                            }
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-lg font-semibold"
                          >
                            Edit
                          </button>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* ================================= */}
        {/* EDIT MODAL */}
        {/* ================================= */}

        {editing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

              <div className="bg-blue-900 text-white p-5 rounded-t-2xl">

                <h2 className="text-xl font-bold">
                  Edit Attendance
                </h2>

                <p className="text-blue-100 mt-1">
                  {editing.name}
                </p>

                <p className="text-blue-200 text-sm">
                  {editing.staffCode} •{" "}
                  {date}
                </p>

              </div>

              <div className="p-6">

                {/* STATUS */}

                <div>

                  <label className="block font-semibold mb-2">
                    Status
                  </label>

                  <select
                    value={
                      editing
                        .attendance
                        ?.status ||
                      "Present"
                    }
                    onChange={(e) =>
                      updateEditing({
                        status:
                          e.target
                            .value,
                      })
                    }
                    className="border rounded-lg p-3 w-full"
                  >

                    <option value="Present">
                      Present
                    </option>

                    <option value="Half Day">
                      Half Day
                    </option>

                    <option value="Leave">
                      Leave
                    </option>

                    <option value="Absent">
                      Absent
                    </option>

                  </select>

                </div>

                {/* CHECK IN */}

                <div className="mt-5">

                  <label className="block font-semibold mb-2">
                    Check In
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      editing
                        .attendance
                        ?.checkIn
                        ? new Date(
                            editing
                              .attendance
                              .checkIn
                          )
                            .toISOString()
                            .slice(
                              0,
                              16
                            )
                        : ""
                    }
                    onChange={(e) =>
                      updateEditing({
                        checkIn:
                          e.target
                            .value
                            ? new Date(
                                e.target
                                  .value
                              ).toISOString()
                            : null,
                      })
                    }
                    className="border rounded-lg p-3 w-full"
                  />

                </div>

                {/* CHECK OUT */}

                <div className="mt-5">

                  <label className="block font-semibold mb-2">
                    Check Out
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      editing
                        .attendance
                        ?.checkOut
                        ? new Date(
                            editing
                              .attendance
                              .checkOut
                          )
                            .toISOString()
                            .slice(
                              0,
                              16
                            )
                        : ""
                    }
                    onChange={(e) =>
                      updateEditing({
                        checkOut:
                          e.target
                            .value
                            ? new Date(
                                e.target
                                  .value
                              ).toISOString()
                            : null,
                      })
                    }
                    className="border rounded-lg p-3 w-full"
                  />

                </div>

                {/* REMARKS */}

                <div className="mt-5">

                  <label className="block font-semibold mb-2">
                    Remarks
                  </label>

                  <textarea
                    value={
                      editing
                        .attendance
                        ?.remarks ||
                      ""
                    }
                    onChange={(e) =>
                      updateEditing({
                        remarks:
                          e.target
                            .value,
                      })
                    }
                    rows={3}
                    placeholder="Optional remarks"
                    className="border rounded-lg p-3 w-full"
                  />

                </div>

                {/* BUTTONS */}

                <div className="flex gap-3 mt-6">

                  <button
                    type="button"
                    onClick={
                      saveEdit
                    }
                    disabled={
                      saving
                    }
                    className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold"
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditing(
                        null
                      )
                    }
                    disabled={
                      saving
                    }
                    className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* PRINT CSS */}

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          button,
          input,
          select,
          textarea {
            display: none !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          @page {
            size: A4 landscape;
            margin: 10mm;
          }
        }
      `}</style>

    </main>
  );
}

/**
 * ============================================
 * SUMMARY CARD
 * ============================================
 */

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-4">

      <p className="text-gray-500 text-xs font-semibold">
        {title}
      </p>

      <p className="text-2xl font-bold text-blue-900 mt-1">
        {value}
      </p>

    </div>
  );
}