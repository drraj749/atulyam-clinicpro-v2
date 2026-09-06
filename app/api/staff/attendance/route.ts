import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/app/lib/prisma";

const HOSPITAL_LATITUDE = 25.82948581821593;
const HOSPITAL_LONGITUDE = 84.02879642940225;
const LOCATION_RADIUS_METERS = 100;
const MAX_ALLOWED_ACCURACY_METERS = 100;

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

type LocationValidation = {
  valid: boolean;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  distance?: number;
  message?: string;
};

function isAdminRole(role: string | null | undefined): boolean {
  return ADMIN_ROLES.has(String(role ?? "").trim().toLowerCase());
}

function getIndiaDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}


function parseIndiaDateTime(value: unknown): Date | null {
  if (typeof value !== "string") return null;

  const match = value.trim().match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? "0");

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    return null;
  }

  // datetime-local values in the administrator UI represent hospital time
  // (Asia/Kolkata, UTC+05:30), not the server's timezone.
  const utcMillis = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute - 330,
    second,
    0
  );

  const date = new Date(utcMillis);

  // Reject impossible calendar dates such as 2026-02-31.
  const indiaParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const parts = Object.fromEntries(
    indiaParts.map((part) => [part.type, part.value])
  );

  if (
    Number(parts.year) !== year ||
    Number(parts.month) !== month ||
    Number(parts.day) !== day ||
    Number(parts.hour) !== hour ||
    Number(parts.minute) !== minute ||
    Number(parts.second) !== second
  ) {
    return null;
  }

  return date;
}

function isValidMonth(month: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

function calculateDistanceMeters(latitude: number, longitude: number): number {
  const earthRadius = 6371000;
  const lat1 = (HOSPITAL_LATITUDE * Math.PI) / 180;
  const lat2 = (latitude * Math.PI) / 180;
  const deltaLat = ((latitude - HOSPITAL_LATITUDE) * Math.PI) / 180;
  const deltaLon = ((longitude - HOSPITAL_LONGITUDE) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function validateLocation(body: Record<string, unknown>): LocationValidation {
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  const accuracy = Number(body.accuracy);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(accuracy)) {
    return {
      valid: false,
      message: "Unable to verify your GPS location. Please allow location access and try again.",
    };
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return { valid: false, message: "Invalid GPS coordinates." };
  }

  if (accuracy <= 0) {
    return {
      valid: false,
      message: "GPS accuracy could not be determined. Please try again outdoors or near a window.",
    };
  }

  if (accuracy > MAX_ALLOWED_ACCURACY_METERS) {
    return {
      valid: false,
      message: `GPS accuracy is too low (${Math.round(accuracy)} m). Please enable high-accuracy location and try again.`,
    };
  }

  const distance = calculateDistanceMeters(latitude, longitude);

  if (distance > LOCATION_RADIUS_METERS) {
    return {
      valid: false,
      distance,
      latitude,
      longitude,
      accuracy,
      message: `Attendance can only be marked at Atulyam Hospital. You are approximately ${Math.round(distance)} metres away from the hospital.`,
    };
  }

  return { valid: true, distance, latitude, longitude, accuracy };
}

async function getAuthenticatedStaff(request: NextRequest) {
  const token = request.cookies.get("staff_session")?.value;
  if (!token) return null;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const session = await prisma.staffSession.findUnique({
    where: { tokenHash },
    include: { staff: true },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) return null;
  if (!session.staff.isActive || !session.staff.loginEnabled) return null;

  return session.staff;
}

function publicStaff(staff: { id: number; staffCode: string; name: string; role: string }) {
  return {
    id: staff.id,
    staffCode: staff.staffCode,
    name: staff.name,
    role: staff.role,
  };
}

export async function GET(request: NextRequest) {
  try {
    const staff = await getAuthenticatedStaff(request);

    if (!staff) {
      return NextResponse.json(
        { success: false, message: "Your staff session has expired. Please login again." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month")?.trim() || "";
    const staffIdParam = searchParams.get("staffId")?.trim() || "";

    if (!month) {
      const attendanceDate = getIndiaDate();
      const attendance = await prisma.attendance.findUnique({
        where: {
          staffId_attendanceDate: {
            staffId: staff.id,
            attendanceDate,
          },
        },
      });

      return NextResponse.json({
        success: true,
        staff: publicStaff(staff),
        attendance,
      });
    }

    if (!isValidMonth(month)) {
      return NextResponse.json(
        { success: false, message: "Invalid month. Use YYYY-MM format." },
        { status: 400 }
      );
    }

    let targetStaffId = staff.id;

    if (staffIdParam) {
      const requestedStaffId = Number(staffIdParam);
      if (!Number.isInteger(requestedStaffId) || requestedStaffId <= 0) {
        return NextResponse.json(
          { success: false, message: "Invalid staff ID." },
          { status: 400 }
        );
      }

      if (!isAdminRole(staff.role) && requestedStaffId !== staff.id) {
        return NextResponse.json(
          { success: false, message: "You are not authorized to view another staff member's attendance." },
          { status: 403 }
        );
      }

      targetStaffId = requestedStaffId;
    }

    const targetStaff = await prisma.staff.findUnique({
      where: { id: targetStaffId },
      select: { id: true, staffCode: true, name: true, role: true, isActive: true },
    });

    if (!targetStaff) {
      return NextResponse.json(
        { success: false, message: "Staff member not found." },
        { status: 404 }
      );
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        staffId: targetStaffId,
        attendanceDate: { startsWith: `${month}-` },
      },
      orderBy: { attendanceDate: "asc" },
    });

    return NextResponse.json({
      success: true,
      month,
      staff: publicStaff(targetStaff),
      attendance,
    });
  } catch (error) {
    console.error("STAFF ATTENDANCE GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load attendance." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const staff = await getAuthenticatedStaff(request);

    if (!staff) {
      return NextResponse.json(
        { success: false, message: "Your staff session has expired. Please login again." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const status = String(body.status ?? "").trim();
    const allowedStatuses = ["Present", "Half Day", "Leave", "Absent"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid attendance status." },
        { status: 400 }
      );
    }

    const attendanceDate = getIndiaDate();
    const existing = await prisma.attendance.findUnique({
      where: { staffId_attendanceDate: { staffId: staff.id, attendanceDate } },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Attendance has already been marked for today.", attendance: existing },
        { status: 400 }
      );
    }

    if (status === "Leave" || status === "Absent") {
      const attendance = await prisma.attendance.create({
        data: {
          staffId: staff.id,
          attendanceDate,
          status,
          checkIn: null,
          checkOut: null,
          locationVerified: false,
        },
      });

      return NextResponse.json(
        { success: true, message: "Attendance recorded.", attendance },
        { status: 201 }
      );
    }

    const location = validateLocation(body);
    if (!location.valid) {
      return NextResponse.json(
        {
          success: false,
          message: location.message || "Location verification failed.",
          distance: location.distance ?? null,
        },
        { status: 403 }
      );
    }

    const attendance = await prisma.attendance.create({
      data: {
        staffId: staff.id,
        attendanceDate,
        status,
        checkIn: new Date(),
        checkOut: null,
        checkInLatitude: location.latitude,
        checkInLongitude: location.longitude,
        checkInAccuracy: location.accuracy,
        checkInDistanceMeters: location.distance,
        locationVerified: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Attendance marked successfully. Location verified.",
        attendance,
        location: {
          verified: true,
          distanceMeters: Math.round(location.distance ?? 0),
          accuracyMeters: Math.round(location.accuracy ?? 0),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("STAFF ATTENDANCE POST ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to mark attendance." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const staff = await getAuthenticatedStaff(request);

    if (!staff) {
      return NextResponse.json(
        { success: false, message: "Your staff session has expired. Please login again." },
        { status: 401 }
      );
    }

    if (!isAdminRole(staff.role)) {
      return NextResponse.json(
        { success: false, message: "Administrator access is required to edit attendance records." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const attendanceId = Number(body.attendanceId);
    const targetStaffId = Number(body.staffId);
    const attendanceDate = String(body.attendanceDate ?? "").trim();
    const status = String(body.status ?? "").trim();
    const checkInRaw = body.checkIn;
    const checkOutRaw = body.checkOut;
    const remarksRaw = body.remarks;

    const allowedStatuses = ["Present", "Half Day", "Leave", "Absent"];

    if (!Number.isInteger(attendanceId) || attendanceId <= 0) {
      return NextResponse.json({ success: false, message: "Invalid attendance ID." }, { status: 400 });
    }

    if (!Number.isInteger(targetStaffId) || targetStaffId <= 0) {
      return NextResponse.json({ success: false, message: "Invalid staff ID." }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate)) {
      return NextResponse.json({ success: false, message: "Invalid attendance date." }, { status: 400 });
    }

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid attendance status." }, { status: 400 });
    }

    const existing = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Attendance record not found." }, { status: 404 });
    }

    if (existing.staffId !== targetStaffId || existing.attendanceDate !== attendanceDate) {
      return NextResponse.json(
        { success: false, message: "Attendance record does not match the selected staff member/date." },
        { status: 400 }
      );
    }

    const targetStaff = await prisma.staff.findUnique({
      where: { id: targetStaffId },
      select: { id: true, name: true, staffCode: true },
    });

    if (!targetStaff) {
      return NextResponse.json({ success: false, message: "Staff member not found." }, { status: 404 });
    }

    let checkIn: Date | null = null;
    let checkOut: Date | null = null;

    if (status === "Present" || status === "Half Day") {
      if (typeof checkInRaw !== "string" || !checkInRaw.trim()) {
        return NextResponse.json(
          { success: false, message: "Check-in time is required for Present or Half Day." },
          { status: 400 }
        );
      }

      checkIn = parseIndiaDateTime(checkInRaw);
      if (!checkIn) {
        return NextResponse.json(
          { success: false, message: "Invalid check-in time. Use hospital time in YYYY-MM-DD HH:MM format." },
          { status: 400 }
        );
      }

      if (typeof checkOutRaw === "string" && checkOutRaw.trim()) {
        checkOut = parseIndiaDateTime(checkOutRaw);
        if (!checkOut) {
          return NextResponse.json(
            { success: false, message: "Invalid check-out time. Use hospital time in YYYY-MM-DD HH:MM format." },
            { status: 400 }
          );
        }

        if (checkOut.getTime() <= checkIn.getTime()) {
          return NextResponse.json(
            { success: false, message: "Check-out time must be later than check-in time." },
            { status: 400 }
          );
        }
      }
    }

    const remarks =
      remarksRaw == null ? null : String(remarksRaw).trim() || null;

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        status,
        checkIn,
        checkOut,
        remarks,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Attendance correction saved for ${targetStaff.name}.`,
      attendance: updatedAttendance,
    });
  } catch (error) {
    console.error("ADMIN ATTENDANCE EDIT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to save attendance correction." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const staff = await getAuthenticatedStaff(request);

    if (!staff) {
      return NextResponse.json(
        { success: false, message: "Your staff session has expired. Please login again." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const attendanceDate = getIndiaDate();
    const attendance = await prisma.attendance.findUnique({
      where: { staffId_attendanceDate: { staffId: staff.id, attendanceDate } },
    });

    if (!attendance) {
      return NextResponse.json(
        { success: false, message: "You must check in before checking out." },
        { status: 400 }
      );
    }

    if (attendance.status === "Leave" || attendance.status === "Absent") {
      return NextResponse.json(
        { success: false, message: "Check-out is not available for Leave or Absent attendance." },
        { status: 400 }
      );
    }

    if (!attendance.checkIn) {
      return NextResponse.json(
        { success: false, message: "Check-in time was not found." },
        { status: 400 }
      );
    }

    if (attendance.checkOut) {
      return NextResponse.json(
        { success: false, message: "You have already checked out today.", attendance },
        { status: 400 }
      );
    }

    const location = validateLocation(body);
    if (!location.valid) {
      return NextResponse.json(
        {
          success: false,
          message: location.message || "Location verification failed.",
          distance: location.distance ?? null,
        },
        { status: 403 }
      );
    }

    const checkOut = new Date();
    if (checkOut.getTime() <= attendance.checkIn.getTime()) {
      return NextResponse.json(
        { success: false, message: "Invalid check-out time." },
        { status: 400 }
      );
    }

    const workingMinutes = Math.floor(
      (checkOut.getTime() - attendance.checkIn.getTime()) / 60000
    );

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut,
        checkOutLatitude: location.latitude,
        checkOutLongitude: location.longitude,
        checkOutAccuracy: location.accuracy,
        checkOutDistanceMeters: location.distance,
        locationVerified: true,
      },
    });

    const hours = Math.floor(workingMinutes / 60);
    const minutes = workingMinutes % 60;

    return NextResponse.json({
      success: true,
      message: "Check-out successful. Location verified.",
      attendance: updatedAttendance,
      location: {
        verified: true,
        distanceMeters: Math.round(location.distance ?? 0),
        accuracyMeters: Math.round(location.accuracy ?? 0),
      },
      workingMinutes,
      workingHours: `${hours}h ${minutes}m`,
    });
  } catch (error) {
    console.error("STAFF CHECKOUT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to complete check-out." },
      { status: 500 }
    );
  }
}
