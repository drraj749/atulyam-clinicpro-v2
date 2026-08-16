"use client";

import {
  useEffect,
  useState,
} from "react";

type StaffPerformance = {
  staffId: number;
  staffCode: string;
  name: string;
  role: string;
  mobile: string | null;

  joiningDate: string | null;

  todayStatus: string;
  todayCheckIn: string | null;
  todayCheckOut: string | null;
  todayWorkingHours: string;

  present: number;
  halfDay: number;
  leave: number;
  absent: number;
  unmarked: number;

  recordedDays: number;

  attendancePercentage: number;

  totalWorkingMinutes: number;
  totalWorkingHours: string;
};

type Summary = {
  totalStaff: number;

  presentToday: number;
  halfDayToday: number;
  leaveToday: number;
  absentToday: number;

  currentlyWorking: number;
  checkedOutToday: number;

  todayWorkingHours: string;

  totalPresent: number;
  totalHalfDay: number;
  totalLeave: number;
  totalAbsent: number;
  totalUnmarked: number;

  overallAttendancePercentage: number;

  totalMonthlyWorkingHours: string;
};

export default function StaffPerformancePage() {
  const [month, setMonth] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [performance, setPerformance] =
    useState<
      StaffPerformance[]
    >([]);

  const [summary, setSummary] =
    useState<Summary>({
      totalStaff: 0,

      presentToday: 0,
      halfDayToday: 0,
      leaveToday: 0,
      absentToday: 0,

      currentlyWorking: 0,
      checkedOutToday: 0,

      todayWorkingHours:
        "0h 0m",

      totalPresent: 0,
      totalHalfDay: 0,
      totalLeave: 0,
      totalAbsent: 0,
      totalUnmarked: 0,

      overallAttendancePercentage: 0,

      totalMonthlyWorkingHours:
        "0h 0m",
    });

  /**
   * ========================================
   * CURRENT MONTH
   * ========================================
   */

  function getCurrentMonth() {
    const formatter =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone:
            "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
        }
      );

    return formatter.format(
      new Date()
    );
  }

  /**
   * ========================================
   * INITIAL LOAD
   * ========================================
   */

  useEffect(() => {
    setMonth(
      getCurrentMonth()
    );
  }, []);

  /**
   * ========================================
   * LOAD DASHBOARD
   * ========================================
   */

  useEffect(() => {
    if (month) {
      loadDashboard();
    }
  }, [month]);

  async function loadDashboard() {
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
          `/api/staff/performance?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Unable to load dashboard."
        );

        return;
      }

      setPerformance(
        result.performance ||
          []
      );

      setSummary(
        result.summary
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
   * REFRESH
   * ========================================
   */

  function refresh() {
    loadDashboard();
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
   * MONTH LABEL
   * ========================================
   */

  function monthLabel() {
    if (!month) {
      return "";
    }

    return new Date(
      `${month}-01T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );
  }

  /**
   * ========================================
   * STATUS BADGE
   * ========================================
   */

  function statusBadge(
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

        <div className="bg-blue-900 text-white rounded-2xl shadow-lg p-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>

              <p className="text-blue-200 text-sm font-semibold">
                ATULYAM HOSPITAL
              </p>

              <h1 className="text-2xl md:text-3xl font-bold mt-1">
                Staff Performance Dashboard
              </h1>

              <p className="text-blue-100 mt-1">
                Daily workforce status & monthly performance
              </p>

            </div>

            <div className="flex gap-3 print:hidden">

              <button
                type="button"
                onClick={refresh}
                className="bg-white text-blue-900 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50"
              >
                ↻ Refresh
              </button>

              <button
                type="button"
                onClick={printReport}
                className="bg-white text-blue-900 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50"
              >
                🖨 Print
              </button>

            </div>

          </div>

        </div>

        {/* ================================= */}
        {/* FILTERS */}
        {/* ================================= */}

        <div className="bg-white rounded-2xl shadow mt-5 p-5 print:hidden">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>

              <label className="block font-semibold mb-2">
                Month
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
                    loadDashboard();
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
                  loadDashboard
                }
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold w-full"
              >
                🔎 Apply Filter
              </button>

            </div>

          </div>

        </div>

        {/* ================================= */}
        {/* TODAY HEADER */}
        {/* ================================= */}

        <div className="mt-6 mb-3">

          <h2 className="text-xl font-bold text-blue-900">
            Today's Workforce
          </h2>

          <p className="text-gray-500">
            Live attendance status for today
          </p>

        </div>

        {/* ================================= */}
        {/* TODAY CARDS */}
        {/* ================================= */}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">

          <DashboardCard
            title="Total Staff"
            value={
              summary.totalStaff
            }
            icon="👥"
          />

          <DashboardCard
            title="Present"
            value={
              summary.presentToday
            }
            icon="🟢"
          />

          <DashboardCard
            title="Half Day"
            value={
              summary.halfDayToday
            }
            icon="🟡"
          />

          <DashboardCard
            title="Leave"
            value={
              summary.leaveToday
            }
            icon="🔴"
          />

          <DashboardCard
            title="Absent"
            value={
              summary.absentToday
            }
            icon="⚫"
          />

          <DashboardCard
            title="Working Now"
            value={
              summary.currentlyWorking
            }
            icon="⏱"
          />

          <DashboardCard
            title="Checked Out"
            value={
              summary.checkedOutToday
            }
            icon="✓"
          />

        </div>

        {/* ================================= */}
        {/* TODAY HOURS */}
        {/* ================================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

          <div className="bg-white rounded-2xl shadow p-5">

            <p className="text-gray-500">
              Today's Total Working Hours
            </p>

            <p className="text-3xl font-bold text-blue-900 mt-2">
              {
                summary.todayWorkingHours
              }
            </p>

          </div>

          <div className="bg-white rounded-2xl shadow p-5">

            <p className="text-gray-500">
              Monthly Attendance
            </p>

            <p className="text-3xl font-bold text-blue-900 mt-2">
              {
                summary.overallAttendancePercentage
              }%
            </p>

            <p className="text-sm text-gray-500 mt-1">
              {monthLabel()}
            </p>

          </div>

        </div>

        {/* ================================= */}
        {/* CURRENT STAFF */}
        {/* ================================= */}

        <div className="mt-6 mb-3">

          <h2 className="text-xl font-bold text-blue-900">
            Staff Performance
          </h2>

          <p className="text-gray-500">
            Individual attendance and working-hour performance
          </p>

        </div>

        {/* ================================= */}
        {/* TABLE */}
        {/* ================================= */}

        <div className="bg-white rounded-2xl shadow overflow-hidden">

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading staff performance...
            </div>
          ) : performance.length ===
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
                      Staff
                    </th>

                    <th className="text-left p-4">
                      Role
                    </th>

                    <th className="text-center p-4">
                      Today's Status
                    </th>

                    <th className="text-center p-4">
                      Check In
                    </th>

                    <th className="text-center p-4">
                      Check Out
                    </th>

                    <th className="text-center p-4">
                      Today
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
                      Attendance
                    </th>

                    <th className="text-center p-4">
                      Monthly Hours
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {performance.map(
                    (member) => (

                      <tr
                        key={
                          member.staffId
                        }
                        className="border-b hover:bg-gray-50"
                      >

                        <td className="p-4">

                          <div className="font-bold text-gray-900">
                            {
                              member.name
                            }
                          </div>

                          <div className="text-xs text-gray-500">
                            {
                              member.staffCode
                            }
                          </div>

                        </td>

                        <td className="p-4">
                          {
                            member.role
                          }
                        </td>

                        <td className="p-4 text-center">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(
                              member.todayStatus
                            )}`}
                          >
                            {
                              member.todayStatus
                            }
                          </span>

                        </td>

                        <td className="p-4 text-center font-semibold">
                          {formatTime(
                            member.todayCheckIn
                          )}
                        </td>

                        <td className="p-4 text-center font-semibold">
                          {formatTime(
                            member.todayCheckOut
                          )}
                        </td>

                        <td className="p-4 text-center font-semibold">
                          {
                            member.todayWorkingHours
                          }
                        </td>

                        <td className="p-4 text-center text-green-700 font-bold">
                          {
                            member.present
                          }
                        </td>

                        <td className="p-4 text-center text-yellow-600 font-bold">
                          {
                            member.halfDay
                          }
                        </td>

                        <td className="p-4 text-center text-red-600 font-bold">
                          {
                            member.leave
                          }
                        </td>

                        <td className="p-4 text-center text-gray-700 font-bold">
                          {
                            member.absent
                          }
                        </td>

                        <td className="p-4 text-center">

                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                            {
                              member.attendancePercentage
                            }%
                          </span>

                        </td>

                        <td className="p-4 text-center font-bold">
                          {
                            member.totalWorkingHours
                          }
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
        {/* MONTHLY SUMMARY */}
        {/* ================================= */}

        <div className="mt-6 mb-3">

          <h2 className="text-xl font-bold text-blue-900">
            Monthly Overview
          </h2>

          <p className="text-gray-500">
            {monthLabel()}
          </p>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">

          <DashboardCard
            title="Present Days"
            value={
              summary.totalPresent
            }
            icon="🟢"
          />

          <DashboardCard
            title="Half Days"
            value={
              summary.totalHalfDay
            }
            icon="🟡"
          />

          <DashboardCard
            title="Leave"
            value={
              summary.totalLeave
            }
            icon="🔴"
          />

          <DashboardCard
            title="Absent"
            value={
              summary.totalAbsent
            }
            icon="⚫"
          />

          <DashboardCard
            title="Unmarked"
            value={
              summary.totalUnmarked
            }
            icon="—"
          />

          <DashboardCard
            title="Attendance"
            value={`${summary.overallAttendancePercentage}%`}
            icon="📊"
          />

          <DashboardCard
            title="Monthly Hours"
            value={
              summary.totalMonthlyWorkingHours
            }
            icon="⏱"
          />

        </div>

        {/* ================================= */}
        {/* FOOTER */}
        {/* ================================= */}

        <div className="bg-white rounded-2xl shadow mt-6 p-5 text-sm text-gray-500">

          <p>
            <strong>
              Attendance calculation:
            </strong>{" "}
            Present = 1 day, Half Day = 0.5 day.
          </p>

          <p className="mt-1">
            Unmarked days are kept separate from explicitly recorded Absent days.
          </p>

        </div>

      </div>

      {/* ================================= */}
      {/* PRINT CSS */}
      {/* ================================= */}

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

          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          table {
            font-size: 9px !important;
          }

          .shadow {
            box-shadow: none !important;
          }

        }

      `}</style>

    </main>
  );
}

/**
 * ============================================
 * DASHBOARD CARD
 * ============================================
 */

function DashboardCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-4">

      <div className="flex items-center justify-between">

        <p className="text-gray-500 text-xs font-semibold">
          {title}
        </p>

        <span className="text-lg">
          {icon}
        </span>

      </div>

      <p className="text-xl font-bold text-blue-900 mt-2">
        {value}
      </p>

    </div>
  );
}