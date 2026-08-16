"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

type StaffSession = {
  id: number;
  staffCode: string;
  name: string;
  role: string;
};

type Attendance = {
  id: number;
  attendanceDate: string;
  status: string;
  checkIn: string | null;
  checkOut: string | null;
  remarks: string | null;
};

export default function StaffDashboard() {
  const router = useRouter();

  const [staff, setStaff] =
    useState<StaffSession | null>(
      null
    );

  const [attendance, setAttendance] =
    useState<Attendance | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(new Date());

  /**
   * ========================================
   * LOAD SESSION
   * ========================================
   */

  useEffect(() => {
    const raw =
      localStorage.getItem(
        "staffSession"
      );

    if (!raw) {
      router.replace(
        "/staff/login"
      );
      return;
    }

    try {
      const session =
        JSON.parse(raw);

      setStaff(session);

      loadAttendance(
        session.id
      );
    } catch {
      localStorage.removeItem(
        "staffSession"
      );

      router.replace(
        "/staff/login"
      );
    }
  }, [router]);

  /**
   * ========================================
   * LIVE CLOCK
   * ========================================
   */

  useEffect(() => {
    const timer =
      setInterval(() => {
        setCurrentTime(
          new Date()
        );
      }, 1000);

    return () =>
      clearInterval(timer);
  }, []);

  /**
   * ========================================
   * LOAD ATTENDANCE
   * ========================================
   */

  async function loadAttendance(
    staffId: number
  ) {
    try {
      const response =
        await fetch(
          `/api/staff/attendance?staffId=${staffId}`,
          {
            cache: "no-store",
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        console.error(
          result.message
        );

        return;
      }

      setAttendance(
        result.attendance ||
          null
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * ========================================
   * MARK ATTENDANCE
   * ========================================
   */

  async function markAttendance(
    status: string
  ) {
    if (!staff) {
      return;
    }

    setSaving(true);

    try {
      const response =
        await fetch(
          "/api/staff/attendance",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              staffId:
                staff.id,
              status,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Unable to mark attendance."
        );

        return;
      }

      setAttendance(
        result.attendance
      );

      alert(
        "Attendance marked successfully."
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
   * CHECK OUT
   * ========================================
   */

  async function checkOut() {
    if (!staff) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to check out for today?"
      );

    if (!confirmed) {
      return;
    }

    setSaving(true);

    try {
      const response =
        await fetch(
          "/api/staff/attendance",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              staffId:
                staff.id,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Unable to check out."
        );

        return;
      }

      setAttendance(
        result.attendance
      );

      alert(
        `Check-out successful.\n\nWorking time: ${result.workingHours}`
      );
    } catch (error) {
      console.error(error);

      alert(
        "Unable to complete check-out."
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * ========================================
   * LOGOUT
   * ========================================
   */

  async function logout() {
    try {
      await fetch(
        "/api/staff/logout",
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error(error);
    }

    localStorage.removeItem(
      "staffSession"
    );

    router.replace(
      "/staff/login"
    );
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
        second: "2-digit",
      }
    );
  }

  /**
   * ========================================
   * WORKING TIME
   * ========================================
   */

  function getWorkingTime() {
    if (
      !attendance?.checkIn
    ) {
      return "0h 0m";
    }

    const start =
      new Date(
        attendance.checkIn
      ).getTime();

    const end =
      attendance.checkOut
        ? new Date(
            attendance.checkOut
          ).getTime()
        : currentTime.getTime();

    const difference =
      Math.max(
        0,
        end - start
      );

    const totalMinutes =
      Math.floor(
        difference / 60000
      );

    const hours =
      Math.floor(
        totalMinutes / 60
      );

    const minutes =
      totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  }

  /**
   * ========================================
   * STATUS
   * ========================================
   */

  function statusClass() {
    if (!attendance) {
      return "bg-gray-100 text-gray-700";
    }

    switch (
      attendance.status
    ) {
      case "Present":
        return "bg-green-100 text-green-700";

      case "Half Day":
        return "bg-yellow-100 text-yellow-700";

      case "Leave":
        return "bg-red-100 text-red-700";

      case "Absent":
        return "bg-gray-200 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  /**
   * ========================================
   * LOADING
   * ========================================
   */

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-xl shadow p-8">
          Loading Staff Dashboard...
        </div>
      </main>
    );
  }

  if (!staff) {
    return null;
  }

  /**
   * ========================================
   * RENDER
   * ========================================
   */

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="bg-blue-900 text-white rounded-2xl shadow-lg p-6">

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

            <div>

              <p className="text-blue-200 text-sm font-semibold">
                ATULYAM HOSPITAL
              </p>

              <h1 className="text-2xl md:text-3xl font-bold mt-1">
                Staff Dashboard
              </h1>

              <p className="text-blue-100 mt-1">
                Attendance & Working Hours
              </p>

            </div>

            <div className="text-left md:text-right">

              <p className="text-blue-200 text-sm">
                Current Time
              </p>

              <p className="text-2xl font-bold">
                {currentTime.toLocaleTimeString(
                  "en-IN"
                )}
              </p>

            </div>

            <button
              type="button"
              onClick={logout}
              className="bg-white text-blue-900 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50"
            >
              Logout
            </button>

          </div>

        </div>

        {/* STAFF INFORMATION */}

        <div className="bg-white rounded-2xl shadow mt-5 p-6">

          <h2 className="text-xl font-bold text-blue-900">
            Welcome, {staff.name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

            <InfoCard
              title="Staff Code"
              value={
                staff.staffCode
              }
            />

            <InfoCard
              title="Role"
              value={
                staff.role
              }
            />

            <InfoCard
              title="Date"
              value={currentTime.toLocaleDateString(
                "en-IN"
              )}
            />

          </div>

        </div>

        {/* ATTENDANCE */}

        <div className="bg-white rounded-2xl shadow mt-5 p-6">

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">

            <div>

              <h2 className="text-xl font-bold text-blue-900">
                Today's Attendance
              </h2>

              <p className="text-gray-500 mt-1">
                Record your check-in and check-out.
              </p>

            </div>

            {attendance && (
              <span
                className={`px-4 py-2 rounded-full font-bold ${statusClass()}`}
              >
                {attendance.status}
              </span>
            )}

          </div>

          {/* NOT MARKED */}

          {!attendance && (

            <div className="mt-7">

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-5">

                <p className="font-semibold text-blue-900">
                  Attendance not marked
                </p>

                <p className="text-blue-700 text-sm mt-1">
                  Please select your attendance status.
                </p>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    markAttendance(
                      "Present"
                    )
                  }
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg"
                >
                  ✓ Present
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    markAttendance(
                      "Half Day"
                    )
                  }
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg"
                >
                  Half Day
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    markAttendance(
                      "Leave"
                    )
                  }
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg"
                >
                  Leave
                </button>

              </div>

            </div>
          )}

          {/* ATTENDANCE MARKED */}

          {attendance && (

            <div className="mt-7">

              {/* TIME CARDS */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <TimeCard
                  title="Check In"
                  value={formatTime(
                    attendance.checkIn
                  )}
                />

                <TimeCard
                  title="Check Out"
                  value={formatTime(
                    attendance.checkOut
                  )}
                />

                <TimeCard
                  title="Working Time"
                  value={getWorkingTime()}
                />

              </div>

              {/* WORKING */}

              {attendance.checkIn &&
                !attendance.checkOut &&
                attendance.status !==
                  "Leave" &&
                attendance.status !==
                  "Absent" && (

                <div className="mt-6">

                  <div className="bg-green-50 border border-green-200 rounded-xl p-5">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                      <div>

                        <p className="text-green-800 font-bold text-lg">
                          🟢 You are currently working
                        </p>

                        <p className="text-green-700 text-sm mt-1">
                          Check-in:{" "}
                          {formatTime(
                            attendance.checkIn
                          )}
                        </p>

                      </div>

                      <button
                        type="button"
                        disabled={
                          saving
                        }
                        onClick={
                          checkOut
                        }
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-xl font-bold text-lg"
                      >
                        {saving
                          ? "Checking Out..."
                          : "⏹ Check Out"}
                      </button>

                    </div>

                  </div>

                </div>
              )}

              {/* CHECKED OUT */}

              {attendance.checkOut && (

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">

                  <p className="text-blue-900 font-bold text-lg">
                    ✓ Today's attendance completed
                  </p>

                  <p className="text-blue-700 mt-1">
                    Check-in:{" "}
                    {formatTime(
                      attendance.checkIn
                    )}
                  </p>

                  <p className="text-blue-700">
                    Check-out:{" "}
                    {formatTime(
                      attendance.checkOut
                    )}
                  </p>

                  <p className="text-blue-900 font-bold mt-2">
                    Total working time:{" "}
                    {getWorkingTime()}
                  </p>

                </div>

              )}

              {/* LEAVE */}

              {attendance.status ===
                "Leave" && (

                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-5">

                  <p className="text-red-800 font-bold">
                    Leave recorded for today.
                  </p>

                  <p className="text-red-700 text-sm mt-1">
                    Check-in and check-out are not required.
                  </p>

                </div>
              )}

            </div>
          )}

        </div>

        {/* IMPORTANT RULES */}

        <div className="bg-white rounded-2xl shadow mt-5 p-6">

          <h2 className="text-lg font-bold text-blue-900">
            Attendance Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm text-gray-600">

            <p>
              ✓ Check-in is recorded by the hospital server.
            </p>

            <p>
              ✓ Check-out is recorded by the hospital server.
            </p>

            <p>
              ✓ Only one attendance record is allowed per day.
            </p>

            <p>
              ✓ Check-out cannot be performed before check-in.
            </p>

            <p>
              ✓ Once checked out, attendance cannot be checked out again.
            </p>

            <p>
              ✓ Working hours are calculated automatically.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}

/**
 * ============================================
 * INFO CARD
 * ============================================
 */

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <p className="font-bold text-gray-900 mt-1">
        {value}
      </p>

    </div>
  );
}

/**
 * ============================================
 * TIME CARD
 * ============================================
 */

function TimeCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="border rounded-xl p-5">

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <p className="text-2xl font-bold text-blue-900 mt-2">
        {value}
      </p>

    </div>
  );
}