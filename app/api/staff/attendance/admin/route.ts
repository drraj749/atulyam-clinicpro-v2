import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/app/lib/prisma";

/**
 * ============================================
 * INDIA DATE
 * ============================================
 */

function getIndiaDate(): string {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(new Date());
}

/**
 * ============================================
 * VALIDATE DATE
 * ============================================
 */

function isValidDate(
  value: string
): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(
    value
  );
}

/**
 * ============================================
 * GET
 *
 * Admin attendance for selected date
 *
 * /api/staff/attendance/admin
 * /api/staff/attendance/admin?date=2026-08-16
 * /api/staff/attendance/admin?date=2026-08-16&search=nurse
 * ============================================
 */

export async function GET(
  request: NextRequest
) {
  try {
    const requestedDate =
      request.nextUrl.searchParams.get(
        "date"
      )?.trim();

    const search =
      request.nextUrl.searchParams
        .get("search")
        ?.trim()
        .toLowerCase();

    const attendanceDate =
      requestedDate &&
      isValidDate(requestedDate)
        ? requestedDate
        : getIndiaDate();

    /**
     * Active staff
     */

    const staff =
      await prisma.staff.findMany({
        where: {
          isActive: true,

          ...(search
            ? {
                OR: [
                  {
                    name: {
                      contains: search,
                    },
                  },
                  {
                    staffCode: {
                      contains: search,
                    },
                  },
                  {
                    role: {
                      contains: search,
                    },
                  },
                  {
                    mobile: {
                      contains: search,
                    },
                  },
                ],
              }
            : {}),
        },

        orderBy: {
          name: "asc",
        },

        include: {
          attendance: {
            where: {
              attendanceDate,
            },

            take: 1,
          },
        },
      });

    /**
     * Convert into admin-friendly data
     */

    const records = staff.map(
  (item: typeof staff[number]) => {
        const attendance =
          item.attendance[0] ||
          null;

        return {
          staffId: item.id,

          staffCode:
            item.staffCode,

          name: item.name,

          role: item.role,

          mobile: item.mobile,

          attendance,
        };
      }
    );

    /**
     * Summary
     */

const present =
  records.filter(
    (item: typeof records[number]) =>
      item.attendance
        ?.status ===
      "Present"
  ).length;

const halfDay =
  records.filter(
    (item: typeof records[number]) =>
      item.attendance
        ?.status ===
      "Half Day"
  ).length;

const leave =
  records.filter(
    (item: typeof records[number]) =>
      item.attendance
        ?.status ===
      "Leave"
  ).length;

const absent =
  records.filter(
    (item: typeof records[number]) =>
      !item.attendance ||
      item.attendance
        ?.status ===
      "Absent"
  ).length;

const checkedIn =
  records.filter(
    (item: typeof records[number]) =>
      Boolean(
        item.attendance
          ?.checkIn
      ) &&
      !item.attendance
        ?.checkOut
  ).length;

const checkedOut =
  records.filter(
    (item: typeof records[number]) =>
      Boolean(
        item.attendance
          ?.checkOut
      )
  ).length;

    return NextResponse.json({
      success: true,

      date: attendanceDate,

      summary: {
        totalStaff:
          records.length,

        present,

        halfDay,

        leave,

        absent,

        checkedIn,

        checkedOut,
      },

      records,
    });
  } catch (error) {
    console.error(
      "ADMIN ATTENDANCE GET ERROR:",
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
 *
 * Admin can:
 *
 * - Mark Present
 * - Mark Half Day
 * - Mark Leave
 * - Mark Absent
 * - Correct check-in
 * - Correct check-out
 * - Add remarks
 * ============================================
 */

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const staffId =
      Number(body.staffId);

    const attendanceDate =
      String(
        body.attendanceDate ??
          ""
      ).trim();

    const status =
      String(
        body.status ??
          "Present"
      ).trim();

    const remarks =
      String(
        body.remarks ??
          ""
      ).trim() || null;

    if (
      !staffId ||
      Number.isNaN(staffId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid staff ID.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isValidDate(
        attendanceDate
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid attendance date.",
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
     * Verify staff
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

    /**
     * Parse optional times.
     *
     * Frontend sends:
     *
     * checkIn:
     * "2026-08-16T10:00:00"
     *
     * checkOut:
     * "2026-08-16T18:00:00"
     */

    let checkIn:
      | Date
      | null
      | undefined;

    let checkOut:
      | Date
      | null
      | undefined;

    if (
      body.checkIn !==
      undefined
    ) {
      if (
        body.checkIn ===
          "" ||
        body.checkIn === null
      ) {
        checkIn = null;
      } else {
        const parsed =
          new Date(
            body.checkIn
          );

        if (
          Number.isNaN(
            parsed.getTime()
          )
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid check-in time.",
            },
            {
              status: 400,
            }
          );
        }

        checkIn = parsed;
      }
    }

    if (
      body.checkOut !==
      undefined
    ) {
      if (
        body.checkOut ===
          "" ||
        body.checkOut === null
      ) {
        checkOut = null;
      } else {
        const parsed =
          new Date(
            body.checkOut
          );

        if (
          Number.isNaN(
            parsed.getTime()
          )
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

        checkOut = parsed;
      }
    }

    /**
     * Existing attendance
     */

    const existing =
      await prisma.attendance.findUnique(
        {
          where: {
            staffId_attendanceDate: {
              staffId,
              attendanceDate,
            },
          },
        }
      );

    /**
     * Update
     */

    if (existing) {
      const attendance =
        await prisma.attendance.update(
          {
            where: {
              id: existing.id,
            },

            data: {
              status,

              ...(checkIn !==
              undefined
                ? {
                    checkIn,
                  }
                : {}),

              ...(checkOut !==
              undefined
                ? {
                    checkOut,
                  }
                : {}),

              remarks,
            },
          }
        );

      return NextResponse.json({
        success: true,

        message:
          "Attendance updated successfully.",

        attendance,
      });
    }

    /**
     * Create
     */

    const attendance =
      await prisma.attendance.create(
        {
          data: {
            staffId,

            attendanceDate,

            status,

            checkIn:
              checkIn ??
              null,

            checkOut:
              checkOut ??
              null,

            remarks,
          },
        }
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Attendance created successfully.",

        attendance,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "ADMIN ATTENDANCE POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to save attendance.",
      },
      {
        status: 500,
      }
    );
  }
}