import {
  NextRequest,
  NextResponse,
} from "next/server";

import crypto from "crypto";

import { prisma } from "@/app/lib/prisma";

/*
 * ============================================================
 * ATULYAM HOSPITAL STAFF ATTENDANCE
 * GPS LOCATION VERIFICATION
 * ============================================================
 *
 * Hospital:
 * Latitude:  25.82948581821593
 * Longitude: 84.02879642940225
 *
 * Staff must be within LOCATION_RADIUS_METERS.
 */

const HOSPITAL_LATITUDE = 25.82948581821593;
const HOSPITAL_LONGITUDE = 84.02879642940225;

const LOCATION_RADIUS_METERS = 100;

// Reject extremely inaccurate GPS readings.
const MAX_ALLOWED_ACCURACY_METERS = 100;

/**
 * ============================================================
 * INDIA DATE
 * ============================================================
 */

function getIndiaDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * ============================================================
 * DISTANCE CALCULATION
 * ============================================================
 *
 * Haversine formula.
 *
 * Returns distance in metres.
 */

function calculateDistanceMeters(
  latitude: number,
  longitude: number
): number {
  const earthRadius = 6371000;

  const lat1 =
    (HOSPITAL_LATITUDE * Math.PI) / 180;

  const lat2 =
    (latitude * Math.PI) / 180;

  const deltaLat =
    ((latitude - HOSPITAL_LATITUDE) *
      Math.PI) /
    180;

  const deltaLon =
    ((longitude - HOSPITAL_LONGITUDE) *
      Math.PI) /
    180;

  const a =
    Math.sin(deltaLat / 2) *
      Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadius * c;
}

/**
 * ============================================================
 * LOCATION VALIDATION
 * ============================================================
 */

function validateLocation(body: any) {
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  const accuracy = Number(body.accuracy);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !Number.isFinite(accuracy)
  ) {
    return {
      valid: false,
      message:
        "Unable to verify your GPS location. Please allow location access and try again.",
    };
  }

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return {
      valid: false,
      message: "Invalid GPS coordinates.",
    };
  }

  if (accuracy <= 0) {
    return {
      valid: false,
      message:
        "GPS accuracy could not be determined. Please try again outdoors or near a window.",
    };
  }

  if (
    accuracy >
    MAX_ALLOWED_ACCURACY_METERS
  ) {
    return {
      valid: false,
      message:
        `GPS accuracy is too low (${Math.round(
          accuracy
        )} m). Please enable high-accuracy location and try again.`,
    };
  }

  const distance =
    calculateDistanceMeters(
      latitude,
      longitude
    );

  if (
    distance >
    LOCATION_RADIUS_METERS
  ) {
    return {
      valid: false,
      distance,
      latitude,
      longitude,
      accuracy,
      message:
        `Attendance can only be marked at Atulyam Hospital. You are approximately ${Math.round(
          distance
        )} metres away from the hospital.`,
    };
  }

  return {
    valid: true,
    distance,
    latitude,
    longitude,
    accuracy,
  };
}

/**
 * ============================================================
 * AUTHENTICATED STAFF
 * ============================================================
 *
 * IMPORTANT:
 * Never trust staffId sent from the browser.
 *
 * We identify the staff member using the secure
 * HTTP-only staff_session cookie.
 */

async function getAuthenticatedStaff(
  request: NextRequest
) {
  const token =
    request.cookies.get(
      "staff_session"
    )?.value;

  if (!token) {
    return null;
  }

  const tokenHash =
    crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

  const session =
    await prisma.staffSession.findUnique({
      where: {
        tokenHash,
      },
      include: {
        staff: true,
      },
    });

  if (!session) {
    return null;
  }

  if (
    session.expiresAt.getTime() <=
    Date.now()
  ) {
    return null;
  }

  if (!session.staff.isActive) {
    return null;
  }

  if (!session.staff.loginEnabled) {
    return null;
  }

  return session.staff;
}

/**
 * ============================================================
 * GET TODAY'S ATTENDANCE
 * ============================================================
 */

export async function GET(
  request: NextRequest
) {
  try {
    const staff =
      await getAuthenticatedStaff(
        request
      );

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your staff session has expired. Please login again.",
        },
        {
          status: 401,
        }
      );
    }

    const attendanceDate =
      getIndiaDate();

    const attendance =
      await prisma.attendance.findUnique({
        where: {
          staffId_attendanceDate: {
            staffId: staff.id,
            attendanceDate,
          },
        },
      });

    return NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        staffCode: staff.staffCode,
        name: staff.name,
        role: staff.role,
      },
      attendance,
    });
  } catch (error) {
    console.error(
      "STAFF ATTENDANCE GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load attendance.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * ============================================================
 * POST
 * ============================================================
 *
 * STAFF CHECK-IN
 */

export async function POST(
  request: NextRequest
) {
  try {
    const staff =
      await getAuthenticatedStaff(
        request
      );

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your staff session has expired. Please login again.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const status = String(
      body.status ?? ""
    ).trim();

    const allowedStatuses = [
      "Present",
      "Half Day",
      "Leave",
      "Absent",
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid attendance status.",
        },
        {
          status: 400,
        }
      );
    }

    const attendanceDate =
      getIndiaDate();

    const existing =
      await prisma.attendance.findUnique({
        where: {
          staffId_attendanceDate: {
            staffId: staff.id,
            attendanceDate,
          },
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Attendance has already been marked for today.",
          attendance: existing,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Leave / Absent do not require
     * physical location.
     */

    if (
      status === "Leave" ||
      status === "Absent"
    ) {
      const attendance =
        await prisma.attendance.create({
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
        {
          success: true,
          message:
            "Attendance recorded.",
          attendance,
        },
        {
          status: 201,
        }
      );
    }

    /*
     * Present / Half Day require GPS.
     */

    const location =
      validateLocation(body);

    if (!location.valid) {
      return NextResponse.json(
        {
          success: false,
          message:
            location.message ||
            "Location verification failed.",
          distance:
            location.distance ?? null,
        },
        {
          status: 403,
        }
      );
    }

    const checkIn =
      new Date();

    const attendance =
      await prisma.attendance.create({
        data: {
          staffId: staff.id,
          attendanceDate,
          status,
          checkIn,
          checkOut: null,

          checkInLatitude:
            location.latitude,

          checkInLongitude:
            location.longitude,

          checkInAccuracy:
            location.accuracy,

          checkInDistanceMeters:
            location.distance,

          locationVerified: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Attendance marked successfully. Location verified.",
        attendance,
        location: {
          verified: true,
          distanceMeters:
            Math.round(
              location.distance!
            ),
          accuracyMeters:
            Math.round(
              location.accuracy!
            ),
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "STAFF ATTENDANCE POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to mark attendance.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * ============================================================
 * PATCH
 * ============================================================
 *
 * STAFF CHECK-OUT
 *
 * GPS verification is required again.
 */

export async function PATCH(
  request: NextRequest
) {
  try {
    const staff =
      await getAuthenticatedStaff(
        request
      );

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your staff session has expired. Please login again.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const attendanceDate =
      getIndiaDate();

    const attendance =
      await prisma.attendance.findUnique({
        where: {
          staffId_attendanceDate: {
            staffId: staff.id,
            attendanceDate,
          },
        },
      });

    if (!attendance) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must check in before checking out.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      attendance.status ===
        "Leave" ||
      attendance.status ===
        "Absent"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Check-out is not available for Leave or Absent attendance.",
        },
        {
          status: 400,
        }
      );
    }

    if (!attendance.checkIn) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Check-in time was not found.",
        },
        {
          status: 400,
        }
      );
    }

    if (attendance.checkOut) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You have already checked out today.",
          attendance,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Verify checkout location.
     */

    const location =
      validateLocation(body);

    if (!location.valid) {
      return NextResponse.json(
        {
          success: false,
          message:
            location.message ||
            "Location verification failed.",
          distance:
            location.distance ?? null,
        },
        {
          status: 403,
        }
      );
    }

    /*
     * Server controls checkout time.
     */

    const checkOut =
      new Date();

    if (
      checkOut.getTime() <=
      attendance.checkIn.getTime()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid check-out time.",
        },
        {
          status: 400,
        }
      );
    }

    const workingMinutes =
      Math.floor(
        (
          checkOut.getTime() -
          attendance.checkIn.getTime()
        ) / 60000
      );

    const updatedAttendance =
      await prisma.attendance.update({
        where: {
          id: attendance.id,
        },

        data: {
          checkOut,

          checkOutLatitude:
            location.latitude,

          checkOutLongitude:
            location.longitude,

          checkOutAccuracy:
            location.accuracy,

          checkOutDistanceMeters:
            location.distance,

          locationVerified: true,
        },
      });

    const hours =
      Math.floor(
        workingMinutes / 60
      );

    const minutes =
      workingMinutes % 60;

    return NextResponse.json({
      success: true,

      message:
        "Check-out successful. Location verified.",

      attendance:
        updatedAttendance,

      location: {
        verified: true,
        distanceMeters:
          Math.round(
            location.distance!
          ),
        accuracyMeters:
          Math.round(
            location.accuracy!
          ),
      },

      workingMinutes,

      workingHours:
        `${hours}h ${minutes}m`,
    });
  } catch (error) {
    console.error(
      "STAFF CHECKOUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to complete check-out.",
      },
      {
        status: 500,
      }
    );
  }
}