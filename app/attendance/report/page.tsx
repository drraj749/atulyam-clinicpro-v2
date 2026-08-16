"use client";

import { useEffect, useState } from "react";

type AttendanceRecord = {
  id: number;
  attendanceDate: string;
  status: string;
  checkIn?: string | null;
  checkOut?: string | null;
  remarks?: string | null;
};

type StaffReport = {
  staff: {
    id: number;
    staffCode: string;
    name: string;
    role: string;
    mobile?: string | null;
    isActive: boolean;
  };

  summary: {
    present: number;
    absent: number;
    halfDay: number;
    leave: number;
    totalMarked: number;
    percentage: number;
  };

  records: AttendanceRecord[];
};

type ReportResponse = {
  success: boolean;

  from: string;
  to: string;

  summary: {
    totalStaff: number;
    totalRecords: number;
    totalPresent: number;
    totalAbsent: number;
    totalHalfDay: number;
    totalLeave: number;
  };

  staffReport: StaffReport[];
};

function formatTime(
  value?: string | null
) {
  if (!value) {
    return "-";
  }

  return new Date(
    value
  ).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(
  value: string
) {
  const date = new Date(
    `${value}T00:00:00`
  );

  return date.toLocaleDateString(
    "en-IN"
  );
}

export default function AttendanceReportPage() {
  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const firstDay =
    new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
      .toISOString()
      .split("T")[0];

  const [from, setFrom] =
    useState(firstDay);

  const [to, setTo] =
    useState(today);

  const [loading, setLoading] =
    useState(true);

  const [report, setReport] =
    useState<ReportResponse | null>(
      null
    );

  const [selectedStaffId, setSelectedStaffId] =
    useState<number | null>(null);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    if (!from || !to) {
      alert(
        "Please select both dates."
      );
      return;
    }

    if (from > to) {
      alert(
        "From date cannot be after To date."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `/api/attendance/report?from=${from}&to=${to}`
        );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Unable to load attendance report."
        );
        return;
      }

      setReport(result);

      setSelectedStaffId(null);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to load attendance report."
      );
    } finally {
      setLoading(false);
    }
  }

  function printReport() {
    window.print();
  }

  const selectedStaff =
    report?.staffReport.find(
      (item) =>
        item.staff.id ===
        selectedStaffId
    );

  return (
    <main className="p-8">

      {/* HEADER */}

      <div className="flex justify-between items-start mb-8">

        <div>

          <h1 className="text-3xl font-bold text-blue-900">
            Staff Attendance Report
          </h1>

          <p className="text-gray-500 mt-2">
            Attendance summary and
            detailed staff records
          </p>

        </div>

        <button
          type="button"
          onClick={printReport}
          className="bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-lg font-semibold print:hidden"
        >
          Print Report
        </button>

      </div>

      {/* DATE FILTER */}

      <div className="bg-white rounded-xl shadow p-6 mb-8 print:hidden">

        <div className="grid md:grid-cols-4 gap-4">

          <div>

            <label className="block mb-2 font-medium">
              From Date
            </label>

            <input
              type="date"
              value={from}
              onChange={(e) =>
                setFrom(
                  e.target.value
                )
              }
              className="border rounded-lg w-full p-3"
            />

          </div>

          <div>

            <label className="block mb-2 font-medium">
              To Date
            </label>

            <input
              type="date"
              value={to}
              onChange={(e) =>
                setTo(
                  e.target.value
                )
              }
              className="border rounded-lg w-full p-3"
            />

          </div>

          <div className="flex items-end">

            <button
              type="button"
              onClick={loadReport}
              className="bg-blue-700 hover:bg-blue-800 text-white w-full rounded-lg py-3 font-semibold"
            >
              Load Report
            </button>

          </div>

        </div>

      </div>

      {/* LOADING */}

      {loading ? (

        <div className="bg-white rounded-xl shadow p-12 text-center text-lg">

          Loading Attendance Report...

        </div>

      ) : (

        <>

          {/* REPORT PERIOD */}

          <div className="bg-white rounded-xl shadow p-6 mb-6">

            <h2 className="text-xl font-bold text-blue-900">
              Attendance Period
            </h2>

            <p className="text-gray-600 mt-2">
              {formatDate(from)}{" "}
              to{" "}
              {formatDate(to)}
            </p>

          </div>

          {/* SUMMARY */}

          <div className="grid xl:grid-cols-6 md:grid-cols-3 grid-cols-2 gap-4 mb-8">

            <div className="bg-white rounded-xl shadow p-5">
              <p className="text-gray-500 text-sm">
                Total Staff
              </p>

              <p className="text-3xl font-bold text-blue-700 mt-1">
                {
                  report?.summary
                    .totalStaff ?? 0
                }
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-5">
              <p className="text-gray-500 text-sm">
                Present
              </p>

              <p className="text-3xl font-bold text-green-700 mt-1">
                {
                  report?.summary
                    .totalPresent ?? 0
                }
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-5">
              <p className="text-gray-500 text-sm">
                Absent
              </p>

              <p className="text-3xl font-bold text-red-600 mt-1">
                {
                  report?.summary
                    .totalAbsent ?? 0
                }
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-5">
              <p className="text-gray-500 text-sm">
                Half Day
              </p>

              <p className="text-3xl font-bold text-orange-600 mt-1">
                {
                  report?.summary
                    .totalHalfDay ?? 0
                }
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-5">
              <p className="text-gray-500 text-sm">
                Leave
              </p>

              <p className="text-3xl font-bold text-purple-700 mt-1">
                {
                  report?.summary
                    .totalLeave ?? 0
                }
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-5">
              <p className="text-gray-500 text-sm">
                Records
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-1">
                {
                  report?.summary
                    .totalRecords ?? 0
                }
              </p>
            </div>

          </div>

          {/* STAFF SUMMARY TABLE */}

          <div className="bg-white rounded-xl shadow overflow-x-auto">

            <table className="w-full">

              <thead className="bg-blue-900 text-white">

                <tr>

                  <th className="p-3 text-left">
                    Staff Code
                  </th>

                  <th className="p-3 text-left">
                    Staff Name
                  </th>

                  <th className="p-3 text-left">
                    Role
                  </th>

                  <th className="p-3 text-center">
                    Present
                  </th>

                  <th className="p-3 text-center">
                    Absent
                  </th>

                  <th className="p-3 text-center">
                    Half Day
                  </th>

                  <th className="p-3 text-center">
                    Leave
                  </th>

                  <th className="p-3 text-center">
                    Marked Days
                  </th>

                  <th className="p-3 text-center">
                    Attendance %
                  </th>

                  <th className="p-3 text-center print:hidden">
                    Details
                  </th>

                </tr>

              </thead>

              <tbody>

                {report?.staffReport.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan={10}
                      className="text-center py-10 text-gray-500"
                    >
                      No staff records found.
                    </td>

                  </tr>

                )}

                {report?.staffReport.map(
                  (item) => (

                    <tr
                      key={
                        item.staff.id
                      }
                      className="border-b hover:bg-gray-50"
                    >

                      <td className="p-3 font-semibold">
                        {
                          item.staff
                            .staffCode
                        }
                      </td>

                      <td className="p-3">
                        {
                          item.staff.name
                        }
                      </td>

                      <td className="p-3">
                        {
                          item.staff.role
                        }
                      </td>

                      <td className="p-3 text-center text-green-700 font-semibold">
                        {
                          item.summary
                            .present
                        }
                      </td>

                      <td className="p-3 text-center text-red-600 font-semibold">
                        {
                          item.summary
                            .absent
                        }
                      </td>

                      <td className="p-3 text-center text-orange-600 font-semibold">
                        {
                          item.summary
                            .halfDay
                        }
                      </td>

                      <td className="p-3 text-center text-purple-700 font-semibold">
                        {
                          item.summary
                            .leave
                        }
                      </td>

                      <td className="p-3 text-center">
                        {
                          item.summary
                            .totalMarked
                        }
                      </td>

                      <td className="p-3 text-center font-bold">
                        {
                          item.summary
                            .percentage
                        }%
                      </td>

                      <td className="p-3 text-center print:hidden">

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedStaffId(
                              item.staff
                                .id
                            )
                          }
                          className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded-lg"
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          {/* SELECTED STAFF DETAILS */}

          {selectedStaff && (

            <div className="bg-white rounded-xl shadow mt-8 p-6">

              <div className="flex justify-between items-start">

                <div>

                  <h2 className="text-2xl font-bold text-blue-900">
                    {
                      selectedStaff
                        .staff.name
                    }
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {
                      selectedStaff
                        .staff.staffCode
                    }{" "}
                    •{" "}
                    {
                      selectedStaff
                        .staff.role
                    }
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedStaffId(
                      null
                    )
                  }
                  className="text-gray-600 hover:text-gray-900 print:hidden"
                >
                  ✕ Close
                </button>

              </div>

              <div className="overflow-x-auto mt-6">

                <table className="w-full">

                  <thead className="bg-gray-100">

                    <tr>

                      <th className="p-3 text-left">
                        Date
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

                    </tr>

                  </thead>

                  <tbody>

                    {selectedStaff.records.length ===
                      0 && (

                      <tr>

                        <td
                          colSpan={5}
                          className="text-center p-8 text-gray-500"
                        >
                          No attendance marked
                          for this period.
                        </td>

                      </tr>

                    )}

                    {selectedStaff.records.map(
                      (record) => (

                        <tr
                          key={
                            record.id
                          }
                          className="border-b"
                        >

                          <td className="p-3">
                            {formatDate(
                              record.attendanceDate
                            )}
                          </td>

                          <td className="p-3">

                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                record.status ===
                                "Present"
                                  ? "bg-green-100 text-green-700"
                                  : record.status ===
                                    "Absent"
                                  ? "bg-red-100 text-red-700"
                                  : record.status ===
                                    "Half Day"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {
                                record.status
                              }
                            </span>

                          </td>

                          <td className="p-3">
                            {formatTime(
                              record.checkIn
                            )}
                          </td>

                          <td className="p-3">
                            {formatTime(
                              record.checkOut
                            )}
                          </td>

                          <td className="p-3">
                            {
                              record.remarks ||
                              "-"
                            }
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </>

      )}

    </main>
  );
}