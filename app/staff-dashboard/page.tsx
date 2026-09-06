"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Staff = {
  id: number;
  staffCode: string;
  name: string;
  role: string;
  mobile?: string | null;
};

type Attendance = {
  id: number;
  staffId?: number;
  attendanceDate: string;
  status: string;
  checkIn: string | null;
  checkOut: string | null;
  remarks: string | null;
  checkInLatitude?: number | null;
  checkInLongitude?: number | null;
  checkInAccuracy?: number | null;
  checkInDistanceMeters?: number | null;
  checkOutLatitude?: number | null;
  checkOutLongitude?: number | null;
  checkOutAccuracy?: number | null;
  checkOutDistanceMeters?: number | null;
  locationVerified?: boolean;
};

type AttendanceEditForm = {
  status: "Present" | "Half Day" | "Leave" | "Absent";
  checkIn: string;
  checkOut: string;
  remarks: string;
};

type GeoLocationData = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

const ADMIN_ROLES = new Set([
  "admin",
  "administrator",
  "hospital admin",
  "hospital administrator",
  "owner",
  "manager",
  "hr",
  "hr manager",
]);

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STATUS_META: Record<string, { label: string; className: string; dot: string }> = {
  Present: { label: "Present", className: "bg-green-100 text-green-800 border-green-200", dot: "bg-green-500" },
  Absent: { label: "Absent", className: "bg-gray-100 text-gray-700 border-gray-200", dot: "bg-gray-500" },
  "Half Day": { label: "Half Day", className: "bg-yellow-100 text-yellow-800 border-yellow-200", dot: "bg-yellow-500" },
  Leave: { label: "Leave", className: "bg-red-100 text-red-800 border-red-200", dot: "bg-red-500" },
  "Not Marked": { label: "Not Marked", className: "bg-white text-gray-500 border-gray-200", dot: "bg-gray-300" },
};

function getIndiaDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getIndiaMonth(): string {
  return getIndiaDate().slice(0, 7);
}

function isAdminRole(role: string | undefined): boolean {
  return ADMIN_ROLES.has(String(role ?? "").trim().toLowerCase());
}

function formatTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function workingMinutes(record: Attendance, now = new Date()): number {
  if (!record.checkIn) return 0;
  const start = new Date(record.checkIn).getTime();
  const end = record.checkOut ? new Date(record.checkOut).getTime() : now.getTime();
  return Math.max(0, Math.floor((end - start) / 60000));
}

function formatMinutes(total: number): string {
  const safe = Math.max(0, Math.floor(total));
  return `${Math.floor(safe / 60)}h ${safe % 60}m`;
}

function monthLabel(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function shiftMonth(month: string, amount: number): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1 + amount, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function calendarDates(month: string): string[] {
  const [year, monthNumber] = month.split("-").map(Number);
  const first = new Date(year, monthNumber - 1, 1);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const mondayFirstOffset = (first.getDay() + 6) % 7;
  const totalCells = Math.ceil((mondayFirstOffset + daysInMonth) / 7) * 7;
  const cells: string[] = [];

  for (let index = 0; index < totalCells; index += 1) {
    const dayOffset = index - mondayFirstOffset;
    const date = new Date(year, monthNumber - 1, dayOffset + 1);
    cells.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    );
  }
  return cells;
}

function getCurrentLocation(): Promise<GeoLocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("GPS/location is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location permission was denied. Please allow location access and try again."));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Your current location could not be determined. Please try again."));
            break;
          case error.TIMEOUT:
            reject(new Error("GPS location request timed out. Please try again."));
            break;
          default:
            reject(new Error("Unable to determine your current location."));
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

export default function StaffDashboard() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [month, setMonth] = useState(getIndiaMonth());
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState<Attendance | null>(null);
  const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);
  const [editForm, setEditForm] = useState<AttendanceEditForm>({
    status: "Present",
    checkIn: "",
    checkOut: "",
    remarks: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const admin = isAdminRole(staff?.role);
  const viewingOwnAttendance = staff !== null && selectedStaffId === staff.id;
  const today = getIndiaDate();

  const attendanceMap = useMemo(() => {
    const map = new Map<string, Attendance>();
    attendance.forEach((record) => map.set(record.attendanceDate, record));
    return map;
  }, [attendance]);

  const selectedStaff = useMemo(() => {
    if (selectedStaffId === null) return staff;
    return staffList.find((member) => member.id === selectedStaffId) ?? staff;
  }, [selectedStaffId, staffList, staff]);

  const todayAttendance = viewingOwnAttendance ? attendanceMap.get(today) ?? null : null;

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let leave = 0;
    let minutes = 0;

    attendance.forEach((record) => {
      if (record.status === "Present") present += 1;
      if (record.status === "Absent") absent += 1;
      if (record.status === "Half Day") halfDay += 1;
      if (record.status === "Leave") leave += 1;
      minutes += workingMinutes(record, currentTime);
    });

    return {
      present,
      absent,
      halfDay,
      leave,
      marked: attendance.length,
      minutes,
    };
  }, [attendance, currentTime]);

  const loadMonthlyAttendance = useCallback(
    async (targetMonth: string, targetStaffId: number) => {
      setCalendarLoading(true);
      setErrorMessage("");

      try {
        const query = new URLSearchParams({
          month: targetMonth,
          staffId: String(targetStaffId),
        });

        const response = await fetch(`/api/staff/attendance?${query.toString()}`, {
          cache: "no-store",
          credentials: "include",
        });
        const result = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("staffSession");
          router.replace("/staff/login");
          return;
        }

        if (!response.ok) {
          setErrorMessage(result.message || "Unable to load monthly attendance.");
          return;
        }

        setAttendance(Array.isArray(result.attendance) ? result.attendance : []);
      } catch (error) {
        console.error("MONTHLY ATTENDANCE ERROR:", error);
        setErrorMessage("Unable to load monthly attendance.");
      } finally {
        setCalendarLoading(false);
      }
    },
    [router]
  );

  const loadStaffList = useCallback(async () => {
    try {
      const response = await fetch("/api/staff", {
        cache: "no-store",
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok && Array.isArray(result.staff)) {
        setStaffList(result.staff);
      }
    } catch (error) {
      console.error("STAFF LIST ERROR:", error);
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("staffSession");

    if (!raw) {
      router.replace("/staff/login");
      return;
    }

    try {
      const session = JSON.parse(raw) as Staff;
      if (!session.id || !session.name) throw new Error("Invalid staff session");
      setStaff(session);
      setSelectedStaffId(session.id);
      if (isAdminRole(session.role)) void loadStaffList();
    } catch (error) {
      console.error("STAFF SESSION ERROR:", error);
      localStorage.removeItem("staffSession");
      router.replace("/staff/login");
    }
  }, [router, loadStaffList]);

  useEffect(() => {
    if (!staff || selectedStaffId === null) return;
    void loadMonthlyAttendance(month, selectedStaffId).finally(() => setLoading(false));
  }, [staff, selectedStaffId, month, loadMonthlyAttendance]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function refreshAttendance() {
    if (!selectedStaffId) return;
    await loadMonthlyAttendance(month, selectedStaffId);
  }

  async function markAttendance(status: "Present" | "Half Day" | "Leave") {
    if (!staff || !viewingOwnAttendance) return;
    setSaving(true);
    setErrorMessage("");

    try {
      let location: GeoLocationData | null = null;

      if (status === "Present" || status === "Half Day") {
        try {
          location = await getCurrentLocation();
        } catch (error) {
          alert(error instanceof Error ? error.message : "Unable to get your location.");
          return;
        }
      }

      const response = await fetch("/api/staff/attendance", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          latitude: location?.latitude,
          longitude: location?.longitude,
          accuracy: location?.accuracy,
        }),
      });

      const result = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("staffSession");
        router.replace("/staff/login");
        return;
      }
      if (!response.ok) {
        alert(result.message || "Unable to mark attendance.");
        return;
      }

      await refreshAttendance();
      alert(result.message || "Attendance marked successfully.");
    } catch (error) {
      console.error("MARK ATTENDANCE ERROR:", error);
      alert("Unable to save attendance.");
    } finally {
      setSaving(false);
    }
  }

  async function checkOut() {
    if (!staff || !viewingOwnAttendance) return;

    if (!window.confirm("Are you sure you want to check out for today?")) return;

    setSaving(true);
    try {
      let location: GeoLocationData;
      try {
        location = await getCurrentLocation();
      } catch (error) {
        alert(error instanceof Error ? error.message : "Unable to get your location.");
        return;
      }

      const response = await fetch("/api/staff/attendance", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        }),
      });

      const result = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("staffSession");
        router.replace("/staff/login");
        return;
      }
      if (!response.ok) {
        alert(result.message || "Unable to check out.");
        return;
      }

      await refreshAttendance();
      alert(`Check-out successful.\n\nWorking time: ${result.workingHours || "—"}`);
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);
      alert("Unable to complete check-out.");
    } finally {
      setSaving(false);
    }
  }

  function toDateTimeLocal(value: string | null): string {
    if (!value) return "";
    const date = new Date(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  function openEditAttendance(record: Attendance) {
    if (!admin) return;

    setEditingRecord(record);
    setEditForm({
      status: (["Present", "Half Day", "Leave", "Absent"].includes(record.status)
        ? record.status
        : "Present") as AttendanceEditForm["status"],
      checkIn: toDateTimeLocal(record.checkIn),
      checkOut: toDateTimeLocal(record.checkOut),
      remarks: record.remarks ?? "",
    });
  }

  async function saveAttendanceCorrection() {
    if (!admin || !editingRecord || !selectedStaffId) return;

    if ((editForm.status === "Present" || editForm.status === "Half Day") && !editForm.checkIn) {
      alert("Check-in time is required for Present or Half Day.");
      return;
    }

    if (editForm.checkIn && editForm.checkOut) {
      const start = new Date(editForm.checkIn).getTime();
      const end = new Date(editForm.checkOut).getTime();
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
        alert("Check-out must be later than check-in.");
        return;
      }
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/staff/attendance", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendanceId: editingRecord.id,
          staffId: selectedStaffId,
          attendanceDate: editingRecord.attendanceDate,
          status: editForm.status,
          checkIn: editForm.checkIn || null,
          checkOut: editForm.checkOut || null,
          remarks: editForm.remarks.trim() || null,
        }),
      });

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("staffSession");
        router.replace("/staff/login");
        return;
      }

      if (!response.ok) {
        alert(result.message || "Unable to save attendance correction.");
        return;
      }

      setEditingRecord(null);
      setSelectedRecord(null);
      await refreshAttendance();
      alert(result.message || "Attendance correction saved successfully.");
    } catch (error) {
      console.error("ATTENDANCE CORRECTION ERROR:", error);
      alert("Unable to save attendance correction.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/staff/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }
    localStorage.removeItem("staffSession");
    router.replace("/staff/login");
  }

  function statusMeta(status: string) {
    return STATUS_META[status] ?? STATUS_META["Not Marked"];
  }

  function dayNumber(date: string): number {
    return Number(date.slice(-2));
  }

  function isCurrentMonthDate(date: string): boolean {
    return date.startsWith(`${month}-`);
  }

  const dates = calendarDates(month);

  if (loading && !staff) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow p-8 text-gray-600">Loading Staff Dashboard...</div>
      </main>
    );
  }

  if (!staff) return null;

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        <header className="bg-blue-900 text-white rounded-2xl shadow-lg p-5 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-blue-200 text-sm font-semibold tracking-wide">ATULYAM HOSPITAL</p>
              <h1 className="text-2xl md:text-3xl font-bold mt-1">Staff Dashboard</h1>
              <p className="text-blue-100 mt-1">Attendance Calendar & Working Hours</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-blue-800 rounded-xl px-4 py-2.5 text-center min-w-[130px]">
                <p className="text-blue-200 text-xs">Current Time</p>
                <p className="font-bold text-lg">{currentTime.toLocaleTimeString("en-IN")}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="bg-white text-blue-900 px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-50"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="bg-white rounded-2xl shadow p-5 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Logged in as</p>
              <h2 className="text-xl font-bold text-blue-900">{staff.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{staff.staffCode} • {staff.role}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {admin && (
                <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
                  Staff Member
                  <select
                    value={selectedStaffId ?? staff.id}
                    onChange={(e) => setSelectedStaffId(Number(e.target.value))}
                    className="min-w-[260px] border border-gray-300 rounded-lg px-3 py-2.5 bg-white font-normal outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {staffList.length === 0 && <option value={staff.id}>{staff.name}</option>}
                    {staffList.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.staffCode})
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
                Month
                <input
                  type="month"
                  value={month}
                  onChange={(e) => e.target.value && setMonth(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2.5 bg-white font-normal outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard title="Present" value={summary.present} className="border-green-200" />
          <SummaryCard title="Absent" value={summary.absent} className="border-gray-200" />
          <SummaryCard title="Half Day" value={summary.halfDay} className="border-yellow-200" />
          <SummaryCard title="Leave" value={summary.leave} className="border-red-200" />
          <SummaryCard title="Marked Days" value={summary.marked} className="border-blue-200" />
          <SummaryCard title="Working Hours" value={formatMinutes(summary.minutes)} className="border-purple-200" />
        </section>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-center justify-between gap-4">
            <span>{errorMessage}</span>
            <button type="button" onClick={() => void refreshAttendance()} className="font-semibold underline">Retry</button>
          </div>
        )}

        <section className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-blue-900">{selectedStaff?.name ?? "Staff"} — {monthLabel(month)}</h2>
              <p className="text-sm text-gray-500 mt-1">Click any marked day to view complete attendance details.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setMonth(shiftMonth(month, -1))} className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-semibold">← Previous</button>
              <button type="button" onClick={() => setMonth(getIndiaMonth())} className="px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 font-semibold">This Month</button>
              <button type="button" onClick={() => setMonth(shiftMonth(month, 1))} className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-semibold">Next →</button>
            </div>
          </div>

          <div className="p-3 md:p-5 relative">
            {calendarLoading && (
              <div className="absolute inset-0 z-10 bg-white/70 flex items-start justify-center pt-12">
                <div className="bg-white shadow rounded-xl px-5 py-3 font-semibold text-blue-900">Loading attendance...</div>
              </div>
            )}

            <div className="grid grid-cols-7 gap-1.5 md:gap-2 mb-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-xs md:text-sm font-bold text-gray-500 py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 md:gap-2">
              {dates.map((date) => {
                const record = attendanceMap.get(date);
                const meta = statusMeta(record?.status ?? "Not Marked");
                const currentDay = date === today;
                const inMonth = isCurrentMonthDate(date);

                return (
                  <button
                    key={date}
                    type="button"
                    disabled={!record}
                    onClick={() => record && setSelectedRecord(record)}
                    className={`min-h-[92px] md:min-h-[118px] text-left rounded-xl border p-2 md:p-3 transition ${
                      inMonth ? "bg-white" : "bg-gray-50 opacity-60"
                    } ${record ? "hover:shadow-md hover:border-blue-300 cursor-pointer" : "cursor-default"} ${
                      currentDay ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className={`text-sm md:text-base font-bold ${currentDay ? "text-blue-700" : "text-gray-700"}`}>
                        {dayNumber(date)}
                      </span>
                      {currentDay && <span className="text-[9px] md:text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">TODAY</span>}
                    </div>

                    <div className={`mt-3 inline-flex items-center gap-1.5 border rounded-full px-2 py-1 text-[10px] md:text-xs font-bold ${meta.className}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      <span className="hidden sm:inline">{meta.label}</span>
                      <span className="sm:hidden">{record ? meta.label.replace("Not Marked", "—") : "—"}</span>
                    </div>

                    {record?.checkIn && (
                      <p className="mt-2 text-[10px] md:text-xs text-gray-500">In {formatTime(record.checkIn)}</p>
                    )}
                    {record?.checkOut && (
                      <p className="text-[10px] md:text-xs text-gray-500">Out {formatTime(record.checkOut)}</p>
                    )}
                    {record && record.checkIn && (
                      <p className="text-[10px] md:text-xs font-semibold text-gray-700 mt-1">{formatMinutes(workingMinutes(record, currentTime))}</p>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-200 text-xs">
              {Object.entries(STATUS_META).map(([status, meta]) => (
                <span key={status} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border font-semibold ${meta.className}`}>
                  <span className={`w-2 h-2 rounded-full ${meta.dot}`} /> {status}
                </span>
              ))}
            </div>
          </div>
        </section>

        {viewingOwnAttendance && (
          <section className="bg-white rounded-2xl shadow p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-700">YOUR ATTENDANCE</p>
                <h2 className="text-xl font-bold text-blue-900 mt-1">Today — {formatDate(today)}</h2>
                <p className="text-sm text-gray-500 mt-1">Check-in and check-out are recorded by the hospital server.</p>
              </div>
              {todayAttendance && (
                <span className={`px-4 py-2 rounded-full border font-bold ${statusMeta(todayAttendance.status).className}`}>
                  {todayAttendance.status}
                </span>
              )}
            </div>

            {!todayAttendance ? (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                <button type="button" disabled={saving} onClick={() => void markAttendance("Present")} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl py-4 font-bold">✓ Present</button>
                <button type="button" disabled={saving} onClick={() => void markAttendance("Half Day")} className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white rounded-xl py-4 font-bold">Half Day</button>
                <button type="button" disabled={saving} onClick={() => void markAttendance("Leave")} className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl py-4 font-bold">Leave</button>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                <TimeCard title="Check In" value={formatTime(todayAttendance.checkIn)} />
                <TimeCard title="Check Out" value={formatTime(todayAttendance.checkOut)} />
                <TimeCard title="Working Time" value={formatMinutes(workingMinutes(todayAttendance, currentTime))} />
              </div>
            )}

            {todayAttendance?.checkIn && !todayAttendance.checkOut && todayAttendance.status !== "Leave" && todayAttendance.status !== "Absent" && (
              <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="font-bold text-green-800">You are currently working</p>
                  <p className="text-sm text-green-700 mt-1">Check-in: {formatTime(todayAttendance.checkIn)} • {formatMinutes(workingMinutes(todayAttendance, currentTime))}</p>
                </div>
                <button type="button" disabled={saving} onClick={() => void checkOut()} className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-7 py-3 rounded-xl font-bold">
                  {saving ? "Checking Out..." : "Check Out"}
                </button>
              </div>
            )}

            {todayAttendance?.checkOut && (
              <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900">
                <p className="font-bold">Today's attendance completed.</p>
                <p className="text-sm mt-1">Total working time: {formatMinutes(workingMinutes(todayAttendance, currentTime))}</p>
              </div>
            )}
          </section>
        )}

        {!viewingOwnAttendance && admin && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900 text-sm">
            You are viewing <strong>{selectedStaff?.name}</strong>. As an Administrator, you can review and correct this staff member&apos;s attendance records.
          </div>
        )}

        <section className="bg-white rounded-2xl shadow p-5 md:p-6">
          <h2 className="text-lg font-bold text-blue-900">Attendance Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm text-gray-600">
            <p>✓ Present and Half Day require GPS verification.</p>
            <p>✓ Attendance can be marked only within 100 metres of Atulyam Hospital.</p>
            <p>✓ Leave does not require GPS check-in.</p>
            <p>✓ Only one attendance record is allowed per day.</p>
            <p>✓ Check-out requires GPS verification again.</p>
            <p>✓ Working hours are calculated automatically from server check-in/check-out times.</p>
          </div>
        </section>
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedRecord(null); }}>
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Attendance Details</p>
                <h2 className="text-xl font-bold text-blue-900">{formatDate(selectedRecord.attendanceDate)}</h2>
              </div>
              <div className="flex items-center gap-2">
                {admin && (
                  <button
                    type="button"
                    onClick={() => openEditAttendance(selectedRecord)}
                    className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm"
                  >
                    Edit Attendance
                  </button>
                )}
                <button type="button" onClick={() => setSelectedRecord(null)} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 font-bold">×</button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <span className={`px-4 py-2 rounded-full border font-bold ${statusMeta(selectedRecord.status).className}`}>{selectedRecord.status}</span>
                {selectedRecord.locationVerified && <span className="text-sm font-semibold text-green-700">✓ Location Verified</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <TimeCard title="Check In" value={formatTime(selectedRecord.checkIn)} />
                <TimeCard title="Check Out" value={formatTime(selectedRecord.checkOut)} />
                <TimeCard title="Working Time" value={formatMinutes(workingMinutes(selectedRecord, currentTime))} />
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 font-bold text-gray-800">Location Verification</div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <LocationDetail title="Check-in GPS" latitude={selectedRecord.checkInLatitude} longitude={selectedRecord.checkInLongitude} accuracy={selectedRecord.checkInAccuracy} distance={selectedRecord.checkInDistanceMeters} />
                  <LocationDetail title="Check-out GPS" latitude={selectedRecord.checkOutLatitude} longitude={selectedRecord.checkOutLongitude} accuracy={selectedRecord.checkOutAccuracy} distance={selectedRecord.checkOutDistanceMeters} />
                </div>
              </div>

              {selectedRecord.remarks && (
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-gray-700">Remarks</p>
                  <p className="mt-1 text-gray-600">{selectedRecord.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editingRecord && admin && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) setEditingRecord(null);
          }}
        >
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-blue-900 text-white p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-blue-200 text-sm">Administrator Attendance Correction</p>
                <h2 className="text-xl font-bold mt-1">{formatDate(editingRecord.attendanceDate)}</h2>
                <p className="text-blue-100 text-sm mt-1">{selectedStaff?.name ?? "Staff member"}</p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditingRecord(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Attendance Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((current) => ({
                      ...current,
                      status: e.target.value as AttendanceEditForm["status"],
                    }))
                  }
                  disabled={saving}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Present">Present</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Leave">Leave</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in</label>
                  <input
                    type="datetime-local"
                    value={editForm.checkIn}
                    onChange={(e) => setEditForm((current) => ({ ...current, checkIn: e.target.value }))}
                    disabled={saving || editForm.status === "Leave" || editForm.status === "Absent"}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Check-out</label>
                  <input
                    type="datetime-local"
                    value={editForm.checkOut}
                    onChange={(e) => setEditForm((current) => ({ ...current, checkOut: e.target.value }))}
                    disabled={saving || editForm.status === "Leave" || editForm.status === "Absent"}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                <textarea
                  value={editForm.remarks}
                  onChange={(e) => setEditForm((current) => ({ ...current, remarks: e.target.value }))}
                  disabled={saving}
                  rows={3}
                  placeholder="Reason for correction or additional remarks"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-900">
                <p className="font-bold">Administrator correction</p>
                <p className="mt-1">
                  This changes the attendance record for <strong>{selectedStaff?.name}</strong>.
                  Existing GPS information is preserved; corrected times are used for working-hours calculation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setEditingRecord(null)}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveAttendanceCorrection()}
                  className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold disabled:bg-gray-400"
                >
                  {saving ? "Saving..." : "Save Correction"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({ title, value, className }: { title: string; value: string | number; className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 ${className ?? "border-gray-200"}`}>
      <p className="text-xs md:text-sm text-gray-500 font-semibold">{title}</p>
      <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function TimeCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
      <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function LocationDetail({
  title,
  latitude,
  longitude,
  accuracy,
  distance,
}: {
  title: string;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  distance?: number | null;
}) {
  if (latitude == null || longitude == null) {
    return (
      <div>
        <p className="font-semibold text-gray-700">{title}</p>
        <p className="text-gray-400 mt-1">No GPS data recorded.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="font-semibold text-gray-700">{title}</p>
      <div className="mt-2 space-y-1 text-gray-600">
        <p>Latitude: {latitude.toFixed(6)}</p>
        <p>Longitude: {longitude.toFixed(6)}</p>
        <p>Accuracy: {accuracy != null ? `${Math.round(accuracy)} m` : "—"}</p>
        <p>Distance from hospital: {distance != null ? `${Math.round(distance)} m` : "—"}</p>
      </div>
    </div>
  );
}
