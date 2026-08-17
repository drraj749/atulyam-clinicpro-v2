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
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * ============================================
 * CURRENT MONTH
 * ============================================
 */

function getCurrentMonth(): string {
  return getIndiaDate().slice(0, 7);
}

/**
 * ============================================
 * VALIDATE MONTH
 *
 * YYYY-MM
 * ============================================
 */

function isValidMonth(value: string): boolean {
  return /^\d{4}-\d{2}$/.test(value);
}

/**
 * ============================================
 * GET MONTHLY ATTENDANCE
 *
 * /api/staff/attendance/report
 *
 * /api/staff/attendance/report?month=2026-08
 *
 * /api/staff/attendance/report?month=2026-08&search=nurse
 * ============================================
 */

export async function GET(
  request: NextRequest
) {
  try {
    const requestedMonth =
      request.nextUrl.searchParams
        .get("month")
        ?.trim();

    const search =
      request.nextUrl.searchParams
        .get("search")
        ?.trim()
        .toLowerCase();

    const month =
      requestedMonth &&
      isValidMonth(requestedMonth)
        ? requestedMonth
        : getCurrentMonth();

    /**
     * ========================================
     * MONTH RANGE
     * ========================================
     */

    const monthStart =
      `${month}-01`;

    const [year, monthNumber] =
      month.split("-").map(Number);

    const daysInMonth =
      new Date(
        year,
        monthNumber,
        0
      ).getDate();

    const monthEnd =
      `${month}-${String(
        daysInMonth
      ).padStart(2, "0")}`;

    /**
     * ========================================
     * STAFF
     * ========================================
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

        select: {
          id: true,
          staffCode: true,
          name: true,
          role: true,
          mobile: true,

          attendance: {
            where: {
              attendanceDate: {
                gte: monthStart,
                lte: monthEnd,
              },
            },

            orderBy: {
              attendanceDate: "asc",
            },

            select: {
              id: true,
              attendanceDate: true,
              status: true,
              checkIn: true,
              checkOut: true,
              remarks: true,
            },
          },
        },
      });

    /**
     * ========================================
     * EXPLICIT TYPES
     * ========================================
     */

    type StaffMember = typeof staff[number];

    type AttendanceRecord =
      StaffMember["attendance"][number];

    /**
     * ========================================
     * BUILD STAFF REPORT
     * ========================================
     */

    const reports = staff.map(
      (member: StaffMember) => {
        const attendance =
          member.attendance;

        const present =
          attendance.filter(
            (item: AttendanceRecord) =>
              item.status === "Present"
          ).length;

        const halfDay =
          attendance.filter(
            (item: AttendanceRecord) =>
              item.status === "Half Day"
          ).length;

        const leave =
          attendance.filter(
            (item: AttendanceRecord) =>
              item.status === "Leave"
          ).length;

        const explicitlyAbsent =
          attendance.filter(
            (item: AttendanceRecord) =>
              item.status === "Absent"
          ).length;

        /**
         * Attendance percentage
         *
         * Half Day = 0.5 day
         */

        const attendancePoints =
          present +
          halfDay * 0.5;

        /**
         * Count recorded attendance
         */

        const recordedDays =
          attendance.length;

        /**
         * Unmarked days
         *
         * We keep them separate from
         * explicit "Absent" records.
         */

        const unmarkedDays =
          Math.max(
            0,
            daysInMonth -
              recordedDays
          );

        /**
         * For percentage:
         *
         * recorded attendance is the
         * denominator when attendance
         * records exist.
         *
         * If no attendance exists,
         * percentage is 0.
         */

        const attendanceDenominator =
          recordedDays;

        const attendancePercentage =
          attendanceDenominator > 0
            ? Math.round(
                (attendancePoints /
                  attendanceDenominator) *
                  100
              )
            : 0;

        /**
         * Total working hours
         */

        let totalWorkingMinutes = 0;

        attendance.forEach(
          (item: AttendanceRecord) => {
            if (
              item.checkIn &&
              item.checkOut
            ) {
              const start =
                new Date(
                  item.checkIn
                ).getTime();

              const end =
                new Date(
                  item.checkOut
                ).getTime();

              const difference =
                end - start;

              if (
                difference > 0
              ) {
                totalWorkingMinutes +=
                  Math.floor(
                    difference /
                      60000
                  );
              }
            }
          }
        );

        const totalHours =
          Math.floor(
            totalWorkingMinutes /
              60
          );

        const totalMinutes =
          totalWorkingMinutes %
          60;

        return {
          staffId: member.id,

          staffCode:
            member.staffCode,

          name: member.name,

          role: member.role,

          mobile: member.mobile,

          present,

          halfDay,

          leave,

          absent:
            explicitlyAbsent,

          unmarked:
            unmarkedDays,

          recordedDays,

          attendancePercentage,

          totalWorkingMinutes,

          totalWorkingHours:
            `${totalHours}h ${totalMinutes}m`,

          attendance,
        };
      }
    );

    /**
     * ========================================
     * MONTH SUMMARY
     * ========================================
     */

    type ReportRecord =
      typeof reports[number];

    const totalStaff =
      reports.length;

    const totalPresent =
      reports.reduce(
        (
          sum: number,
          item: ReportRecord
        ) =>
          sum + item.present,
        0
      );

    const totalHalfDay =
      reports.reduce(
        (
          sum: number,
          item: ReportRecord
        ) =>
          sum + item.halfDay,
        0
      );

    const totalLeave =
      reports.reduce(
        (
          sum: number,
          item: ReportRecord
        ) =>
          sum + item.leave,
        0
      );

    const totalAbsent =
      reports.reduce(
        (
          sum: number,
          item: ReportRecord
        ) =>
          sum + item.absent,
        0
      );

    const totalUnmarked =
      reports.reduce(
        (
          sum: number,
          item: ReportRecord
        ) =>
          sum + item.unmarked,
        0
      );

    const totalWorkingMinutes =
      reports.reduce(
        (
          sum: number,
          item: ReportRecord
        ) =>
          sum +
          item.totalWorkingMinutes,
        0
      );

    const overallAttendancePoints =
      totalPresent +
      totalHalfDay * 0.5;

    const totalRecordedDays =
      reports.reduce(
        (
          sum: number,
          item: ReportRecord
        ) =>
          sum +
          item.recordedDays,
        0
      );

    const overallAttendancePercentage =
      totalRecordedDays > 0
        ? Math.round(
            (overallAttendancePoints /
              totalRecordedDays) *
              100
          )
        : 0;

    const totalHours =
      Math.floor(
        totalWorkingMinutes /
          60
      );

    const totalMinutes =
      totalWorkingMinutes % 60;

    return NextResponse.json({
      success: true,

      month,

      monthStart,

      monthEnd,

      daysInMonth,

      summary: {
        totalStaff,

        present:
          totalPresent,

        halfDay:
          totalHalfDay,

        leave:
          totalLeave,

        absent:
          totalAbsent,

        unmarked:
          totalUnmarked,

        attendancePercentage:
          overallAttendancePercentage,

        totalWorkingMinutes,

        totalWorkingHours:
          `${totalHours}h ${totalMinutes}m`,
      },

      reports,
    });
  } catch (error) {
    console.error(
      "MONTHLY ATTENDANCE REPORT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load monthly attendance report.",
      },
      {
        status: 500,
      }
    );
  }
}