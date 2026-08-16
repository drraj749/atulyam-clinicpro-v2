import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/app/lib/prisma";

/**
 * ============================================
 * INDIA DATE
 * ============================================
 *
 * Returns:
 * YYYY-MM-DD
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
 * ============================================
 * GET TODAY'S ATTENDANCE
 * ============================================
 *
 * /api/staff/attendance?staffId=1
 */

export async function GET(
  request: NextRequest
) {
  try {
    const staffId = Number(
      request.nextUrl.searchParams.get(
        "staffId"
      )
    );

    if (
      !staffId ||
      Number.isNaN(staffId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff ID.",
        },
        {
          status: 400,
        }
      );
    }

    const attendanceDate =
      getIndiaDate();

    const attendance =
      await prisma.attendance.findUnique({
        where: {
          staffId_attendanceDate: {
            staffId,
            attendanceDate,
          },
        },
      });

    return NextResponse.json({
      success: true,
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
 * ============================================
 * POST
 * ============================================
 *
 * Marks today's attendance.
 *
 * Supported statuses:
 *
 * Present
 * Half Day
 * Leave
 * Absent
 */

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const staffId = Number(
      body.staffId
    );

    const status = String(
      body.status ?? ""
    ).trim();

    if (
      !staffId ||
      Number.isNaN(staffId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff ID.",
        },
        {
          status: 400,
        }
      );
    }

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

    /**
     * Verify staff.
     */

    const staff =
      await prisma.staff.findUnique({
        where: {
          id: staffId,
        },
      });

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Staff member not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!staff.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Staff member is inactive.",
        },
        {
          status: 403,
        }
      );
    }

    const attendanceDate =
      getIndiaDate();

    /**
     * Prevent duplicate attendance.
     */

    const existing =
      await prisma.attendance.findUnique({
        where: {
          staffId_attendanceDate: {
            staffId,
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

    /**
     * Only Present and Half Day
     * receive a check-in time.
     *
     * Leave / Absent do not.
     */

    const checkIn =
      status === "Present" ||
      status === "Half Day"
        ? new Date()
        : null;

    const attendance =
      await prisma.attendance.create({
        data: {
          staffId,
          attendanceDate,
          status,
          checkIn,
          checkOut: null,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Attendance marked successfully.",
        attendance,
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
 * ============================================
 * PATCH
 * ============================================
 *
 * STAFF CHECK-OUT
 *
 * Server automatically records
 * the current time.
 */

export async function PATCH(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const staffId = Number(
      body.staffId
    );

    if (
      !staffId ||
      Number.isNaN(staffId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff ID.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Verify staff.
     */

    const staff =
      await prisma.staff.findUnique({
        where: {
          id: staffId,
        },
      });

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Staff member not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!staff.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Staff member is inactive.",
        },
        {
          status: 403,
        }
      );
    }

    /**
     * Today's attendance.
     */

    const attendanceDate =
      getIndiaDate();

    const attendance =
      await prisma.attendance.findUnique({
        where: {
          staffId_attendanceDate: {
            staffId,
            attendanceDate,
          },
        },
      });

    /**
     * No attendance means
     * staff cannot check out.
     */

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

    /**
     * Leave / Absent cannot
     * check out.
     */

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

    /**
     * Must have check-in.
     */

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

    /**
     * Prevent duplicate check-out.
     */

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

    /**
     * SERVER TIME
     *
     * Staff cannot submit a custom
     * checkout time.
     */

    const checkOut =
      new Date();

    /**
     * Safety check.
     */

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

    /**
     * Calculate working time.
     */

    const workingMinutes =
      Math.floor(
        (
          checkOut.getTime() -
          attendance.checkIn.getTime()
        ) / 60000
      );

    /**
     * Save checkout.
     */

    const updatedAttendance =
      await prisma.attendance.update({
        where: {
          id: attendance.id,
        },

        data: {
          checkOut,
        },
      });

    /**
     * Return calculated hours.
     */

    const hours =
      Math.floor(
        workingMinutes / 60
      );

    const minutes =
      workingMinutes % 60;

    return NextResponse.json({
      success: true,

      message:
        "Check-out successful.",

      attendance:
        updatedAttendance,

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