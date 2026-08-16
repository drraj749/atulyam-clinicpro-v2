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

type StaffReport = {
  staffId: number;
  staffCode: string;
  name: string;
  role: string;
  mobile: string | null;

  present: number;
  halfDay: number;
  leave: number;
  absent: number;
  unmarked: number;

  recordedDays: number;

  attendancePercentage: number;

  totalWorkingMinutes: number;
  totalWorkingHours: string;

  attendance: Attendance[];
};

type Summary = {
  totalStaff: number;
  present: number;
  halfDay: number;
  leave: number;
  absent: number;
  unmarked: number;
  attendancePercentage: number;
  totalWorkingMinutes: number;
  totalWorkingHours: string;
};

export default function MonthlyAttendanceReport() {
  const [month, setMonth] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [reports, setReports] =
    useState<StaffReport[]>(
      []
    );

  const [summary, setSummary] =
    useState<Summary>({
      totalStaff: 0,
      present: 0,
      halfDay: 0,
      leave: 0,
      absent: 0,
      unmarked: 0,
      attendancePercentage: 0,
      totalWorkingMinutes: 0,
      totalWorkingHours:
        "0h 0m",
    });

  const [daysInMonth, setDaysInMonth] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [selectedStaff, setSelectedStaff] =
    useState<StaffReport | null>(
      null
    );

  /**
   * ========================================
   * CURRENT INDIA MONTH
   * ========================================
   */

  function getCurrentMonth() {
    return new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
      }
    ).format(new Date());
  }

  /**
   * ========================================
   * INITIAL MONTH
   * ========================================
   */

  useEffect(() => {
    setMonth(
      getCurrentMonth()
    );
  }, []);

  /**
   * ========================================
   * LOAD REPORT
   * ========================================
   */

  useEffect(() => {
    if (month) {
      loadReport();
    }
  }, [month]);

  async function loadReport() {
    setLoading(true);

    try {
      const params =
        new URLSearchParams();

      params.set(
        "month",
        month
      );

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      const response =
        await fetch(
          `/api/staff/attendance/report?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Unable to load report."
        );

        return;
      }

      setReports(
        result.reports || []
      );

      setSummary(
        result.summary || {
          totalStaff: 0,
          present: 0,
          halfDay: 0,
          leave: 0,
          absent: 0,
          unmarked: 0,
          attendancePercentage: 0,
          totalWorkingMinutes: 0,
          totalWorkingHours:
            "0h 0m",
        }
      );

      setDaysInMonth(
        result.daysInMonth || 0
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
   * FORMAT DATE
   * ========================================
   */

  function formatDate(
    value: string
  ) {
    const [
      year,
      month,
      day,
    ] = value.split("-");

    return `${day}-${month}-${year}`;
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
    attendance: Attendance
  ) {
    if (
      !attendance.checkIn ||
      !attendance.checkOut
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

    if (difference <= 0) {
      return "—";
    }

    const minutes =
      Math.floor(
        difference / 60000
      );

    const hours =
      Math.floor(
        minutes / 60
      );

    const remaining =
      minutes % 60;

    return `${hours}h ${remaining}m`;
  }

  /**
   * ========================================
   * STATUS STYLE
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
   * MONTH LABEL
   * ========================================
   */

  function monthLabel() {
    if (!month) {
      return "";
    }

    const date =
      new Date(
        `${month}-01T00:00:00`
      );

    return date.toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );
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

        {/* HEADER */}

        <div className="bg-blue-900 text-white rounded-2xl shadow p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <p className="text-blue-200 text-sm font-semibold">
                ATULYAM HOSPITAL
              </p>

              <h1 className="text-2xl md:text-3xl font-bold mt-1">
                Monthly Attendance Report
              </h1>

              <p className="text-blue-100 mt-1">
                {monthLabel()}
              </p>

            </div>

            <button
              type="button"
              onClick={printReport}
              className="bg-white text-blue-900 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 print:hidden"
            >
              🖨 Print Report
            </button>

          </div>

        </div>

        {/* FILTERS */}

        <div className="bg-white rounded-2xl shadow mt-5 p-5 print:hidden">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>

              <label className="block font-semibold mb-2">
                Attendance Month
              </label>

              <input
                type="month"
                value={month}
                onChange={(e) =>
                  setMonth(
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
                    e.key === "Enter"
                  ) {
                    loadReport();
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
                  loadReport
                }
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold w-full"
              >
                🔎 Search / Refresh
              </button>

            </div>

          </div>

        </div>

        {/* SUMMARY */}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-5">

          <SummaryCard
            title="Staff"
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
            title="Unmarked"
            value={
              summary.unmarked
            }
          />

          <SummaryCard
            title="Attendance %"
            value={`${summary.attendancePercentage}%`}
          />

          <SummaryCard
            title="Total Hours"
            value={
              summary.totalWorkingHours
            }
          />

        </div>

        {/* REPORT */}

        <div className="bg-white rounded-2xl shadow mt-5 overflow-hidden">

          <div className="p-5 border-b">

            <h2 className="text-xl font-bold text-blue-900">
              Staff Monthly Summary
            </h2>

            <p className="text-gray-500 mt-1">
              {monthLabel()} •{" "}
              {daysInMonth} days
            </p>

          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading monthly attendance...
            </div>
          ) : reports.length ===
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

                    <th className="text-center p-4">
                      Present
                    </th>

                    <th className="text-center p-4">
                      Half Day
                    </th>

                    <th className="text-center p-4">
                      Leave
                    </th>

                    <th className="text-center p-4">
                      Absent
                    </th>

                    <th className="text-center p-4">
                      Unmarked
                    </th>

                    <th className="text-center p-4">
                      Attendance
                    </th>

                    <th className="text-center p-4">
                      Working Hours
                    </th>

                    <th className="text-center p-4 print:hidden">
                      Details
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {reports.map(
                    (
                      report,
                      index
                    ) => (

                      <tr
                        key={
                          report.staffId
                        }
                        className="border-b hover:bg-gray-50"
                      >

                        <td className="p-4">
                          {index + 1}
                        </td>

                        <td className="p-4">

                          <div className="font-bold">
                            {
                              report.name
                            }
                          </div>

                          <div className="text-xs text-gray-500">
                            {
                              report.staffCode
                            }
                          </div>

                        </td>

                        <td className="p-4">
                          {
                            report.role
                          }
                        </td>

                        <td className="p-4 text-center font-bold text-green-700">
                          {
                            report.present
                          }
                        </td>

                        <td className="p-4 text-center font-bold text-yellow-600">
                          {
                            report.halfDay
                          }
                        </td>

                        <td className="p-4 text-center font-bold text-red-600">
                          {
                            report.leave
                          }
                        </td>

                        <td className="p-4 text-center font-bold text-gray-700">
                          {
                            report.absent
                          }
                        </td>

                        <td className="p-4 text-center font-bold text-gray-500">
                          {
                            report.unmarked
                          }
                        </td>

                        <td className="p-4 text-center">

                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                            {
                              report.attendancePercentage
                            }%
                          </span>

                        </td>

                        <td className="p-4 text-center font-semibold">
                          {
                            report.totalWorkingHours
                          }
                        </td>

                        <td className="p-4 text-center print:hidden">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedStaff(
                                report
                              )
                            }
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-lg font-semibold"
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
          )}

        </div>

        {/* STAFF DETAIL MODAL */}

        {selectedStaff && (

          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">

              <div className="bg-blue-900 text-white p-5">

                <div className="flex justify-between items-start gap-4">

                  <div>

                    <h2 className="text-xl font-bold">
                      {
                        selectedStaff.name
                      }
                    </h2>

                    <p className="text-blue-200 mt-1">
                      {
                        selectedStaff.staffCode
                      }{" "}
                      •{" "}
                      {
                        selectedStaff.role
                      }
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedStaff(
                        null
                      )
                    }
                    className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg"
                  >
                    ✕
                  </button>

                </div>

              </div>

              <div className="p-5 overflow-y-auto max-h-[75vh]">

                {/* STAFF SUMMARY */}

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">

                  <DetailCard
                    title="Present"
                    value={
                      selectedStaff.present
                    }
                  />

                  <DetailCard
                    title="Half Day"
                    value={
                      selectedStaff.halfDay
                    }
                  />

                  <DetailCard
                    title="Leave"
                    value={
                      selectedStaff.leave
                    }
                  />

                  <DetailCard
                    title="Absent"
                    value={
                      selectedStaff.absent
                    }
                  />

                  <DetailCard
                    title="Attendance"
                    value={`${selectedStaff.attendancePercentage}%`}
                  />

                </div>

                {/* DAILY ATTENDANCE */}

                <div className="overflow-x-auto">

                  <table className="w-full text-sm">

                    <thead>

                      <tr className="bg-gray-50 border-b">

                        <th className="text-left p-3">
                          Date
                        </th>

                        <th className="text-left p-3">
                          Status
                        </th>

                        <th className="text-left p-3">
                          Check In
                        </th>

                        <th className="text-left p-3">
                          Check Out
                        </th>

                        <th className="text-left p-3">
                          Hours
                        </th>

                        <th className="text-left p-3">
                          Remarks
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {selectedStaff.attendance.map(
                        (item) => (

                          <tr
                            key={
                              item.id
                            }
                            className="border-b"
                          >

                            <td className="p-3">
                              {formatDate(
                                item.attendanceDate
                              )}
                            </td>

                            <td className="p-3">

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass(
                                  item.status
                                )}`}
                              >
                                {
                                  item.status
                                }
                              </span>

                            </td>

                            <td className="p-3">
                              {formatTime(
                                item.checkIn
                              )}
                            </td>

                            <td className="p-3">
                              {formatTime(
                                item.checkOut
                              )}
                            </td>

                            <td className="p-3 font-semibold">
                              {workingHours(
                                item
                              )}
                            </td>

                            <td className="p-3 text-gray-500">
                              {
                                item.remarks ||
                                "—"
                              }
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

                {selectedStaff.attendance
                  .length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No attendance records found for this month.
                  </div>
                )}

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
          select {
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
  value: number | string;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-4">

      <p className="text-gray-500 text-xs font-semibold">
        {title}
      </p>

      <p className="text-xl font-bold text-blue-900 mt-1">
        {value}
      </p>

    </div>
  );
}

/**
 * ============================================
 * DETAIL CARD
 * ============================================
 */

function DetailCard({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">

      <p className="text-gray-500 text-xs font-semibold">
        {title}
      </p>

      <p className="text-xl font-bold text-blue-900 mt-1">
        {value}
      </p>

    </div>
  );
}