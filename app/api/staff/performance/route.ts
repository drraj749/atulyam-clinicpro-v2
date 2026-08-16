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
 * VALID MONTH
 * ============================================
 */

function isValidMonth(
  value: string
): boolean {
  return /^\d{4}-\d{2}$/.test(value);
}

/**
 * ============================================
 * GET PERFORMANCE DASHBOARD
 * ============================================
 *
 * /api/staff/performance
 *
 * ?month=2026-08
 *
 * ?month=2026-08&search=nurse
 */

export async function GET(
  request: NextRequest
) {
  try {
    const search =
      request.nextUrl.searchParams
        .get("search")
        ?.trim()
        .toLowerCase();

    const requestedMonth =
      request.nextUrl.searchParams
        .get("month")
        ?.trim();

    const month =
      requestedMonth &&
      isValidMonth(requestedMonth)
        ? requestedMonth
        : getCurrentMonth();

    const today =
      getIndiaDate();

    /**
     * ========================================
     * MONTH RANGE
     * ========================================
     */

    const [year, monthNumber] =
      month
        .split("-")
        .map(Number);

    const daysInMonth =
      new Date(
        year,
        monthNumber,
        0
      ).getDate();

    const monthStart =
      `${month}-01`;

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
          joiningDate: true,

          attendance: {
            where: {
              attendanceDate: {
                gte: monthStart,
                lte: monthEnd,
              },
            },

            orderBy: {
              attendanceDate:
                "asc",
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
     * TODAY'S ATTENDANCE
     * ========================================
     */

    const todayAttendance =
      await prisma.attendance.findMany({
        where: {
          attendanceDate: today,

          staff: {
            isActive: true,
          },
        },

        select: {
          id: true,
          staffId: true,
          status: true,
          checkIn: true,
          checkOut: true,
        },
      });

    /**
     * ========================================
     * TODAY MAP
     * ========================================
     */

    const todayMap =
      new Map<
        number,
        (typeof todayAttendance)[number]
      >();

    todayAttendance.forEach(
      (item) => {
        todayMap.set(
          item.staffId,
          item
        );
      }
    );

    /**
     * ========================================
     * TODAY SUMMARY
     * ========================================
     */

    const totalStaff =
      staff.length;

    let presentToday = 0;
    let halfDayToday = 0;
    let leaveToday = 0;
    let absentToday = 0;
    let currentlyWorking = 0;
    let checkedOutToday = 0;

    let todayWorkingMinutes = 0;

    staff.forEach(
      (member) => {
        const attendance =
          todayMap.get(
            member.id
          );

        if (!attendance) {
          return;
        }

        if (
          attendance.status ===
          "Present"
        ) {
          presentToday++;
        }

        if (
          attendance.status ===
          "Half Day"
        ) {
          halfDayToday++;
        }

        if (
          attendance.status ===
          "Leave"
        ) {
          leaveToday++;
        }

        if (
          attendance.status ===
          "Absent"
        ) {
          absentToday++;
        }

        /**
         * Currently working
         */

        if (
          attendance.checkIn &&
          !attendance.checkOut &&
          attendance.status !==
            "Leave" &&
          attendance.status !==
            "Absent"
        ) {
          currentlyWorking++;
        }

        /**
         * Checked out
         */

        if (
          attendance.checkIn &&
          attendance.checkOut
        ) {
          checkedOutToday++;

          const difference =
            new Date(
              attendance.checkOut
            ).getTime() -
            new Date(
              attendance.checkIn
            ).getTime();

          if (
            difference > 0
          ) {
            todayWorkingMinutes +=
              Math.floor(
                difference /
                  60000
              );
          }
        }
      }
    );

    /**
     * ========================================
     * MONTHLY STAFF PERFORMANCE
     * ========================================
     */

    const performance =
      staff.map((member) => {
        const records =
          member.attendance;

        const present =
          records.filter(
            (item) =>
              item.status ===
              "Present"
          ).length;

        const halfDay =
          records.filter(
            (item) =>
              item.status ===
              "Half Day"
          ).length;

        const leave =
          records.filter(
            (item) =>
              item.status ===
              "Leave"
          ).length;

        const absent =
          records.filter(
            (item) =>
              item.status ===
              "Absent"
          ).length;

        const recordedDays =
          records.length;

        const unmarked =
          Math.max(
            0,
            daysInMonth -
              recordedDays
          );

        /**
         * Half day = 0.5
         */

        const attendancePoints =
          present +
          halfDay * 0.5;

        const attendancePercentage =
          recordedDays > 0
            ? Math.round(
                (attendancePoints /
                  recordedDays) *
                  100
              )
            : 0;

        /**
         * Working hours
         */

        let workingMinutes = 0;

        records.forEach(
          (record) => {
            if (
              record.checkIn &&
              record.checkOut
            ) {
              const difference =
                new Date(
                  record.checkOut
                ).getTime() -
                new Date(
                  record.checkIn
                ).getTime();

              if (
                difference > 0
              ) {
                workingMinutes +=
                  Math.floor(
                    difference /
                      60000
                  );
              }
            }
          }
        );

        const hours =
          Math.floor(
            workingMinutes /
              60
          );

        const minutes =
          workingMinutes % 60;

        /**
         * Today's status
         */

        const today =
          todayMap.get(
            member.id
          );

        let todayWorkingMinutes =
          0;

        if (
          today?.checkIn
        ) {
          const end =
            today.checkOut
              ? new Date(
                  today.checkOut
                ).getTime()
              : Date.now();

          const start =
            new Date(
              today.checkIn
            ).getTime();

          if (end > start) {
            todayWorkingMinutes =
              Math.floor(
                (end - start) /
                  60000
              );
          }
        }

        const todayHours =
          Math.floor(
            todayWorkingMinutes /
              60
          );

        const todayMinutes =
          todayWorkingMinutes %
          60;

        return {
          staffId:
            member.id,

          staffCode:
            member.staffCode,

          name:
            member.name,

          role:
            member.role,

          mobile:
            member.mobile,

          joiningDate:
            member.joiningDate,

          todayStatus:
            today?.status ||
            "Unmarked",

          todayCheckIn:
            today?.checkIn ||
            null,

          todayCheckOut:
            today?.checkOut ||
            null,

          todayWorkingHours:
            `${todayHours}h ${todayMinutes}m`,

          present,

          halfDay,

          leave,

          absent,

          unmarked,

          recordedDays,

          attendancePercentage,

          totalWorkingMinutes:
            workingMinutes,

          totalWorkingHours:
            `${hours}h ${minutes}m`,
        };
      });

    /**
     * ========================================
     * TOTAL MONTHLY HOURS
     * ========================================
     */

    const totalMonthlyWorkingMinutes =
      performance.reduce(
        (sum, member) =>
          sum +
          member.totalWorkingMinutes,
        0
      );

    const monthlyHours =
      Math.floor(
        totalMonthlyWorkingMinutes /
          60
      );

    const monthlyMinutes =
      totalMonthlyWorkingMinutes %
      60;

    /**
     * ========================================
     * OVERALL ATTENDANCE
     * ========================================
     */

    const totalPresent =
      performance.reduce(
        (sum, member) =>
          sum + member.present,
        0
      );

    const totalHalfDay =
      performance.reduce(
        (sum, member) =>
          sum + member.halfDay,
        0
      );

    const totalLeave =
      performance.reduce(
        (sum, member) =>
          sum + member.leave,
        0
      );

    const totalAbsent =
      performance.reduce(
        (sum, member) =>
          sum + member.absent,
        0
      );

    const totalUnmarked =
      performance.reduce(
        (sum, member) =>
          sum + member.unmarked,
        0
      );

    const totalRecorded =
      performance.reduce(
        (sum, member) =>
          sum +
          member.recordedDays,
        0
      );

    const overallPoints =
      totalPresent +
      totalHalfDay * 0.5;

    const overallAttendancePercentage =
      totalRecorded > 0
        ? Math.round(
            (overallPoints /
              totalRecorded) *
              100
          )
        : 0;

    /**
     * ========================================
     * TODAY WORKING HOURS
     * ========================================
     */

    const todayHours =
      Math.floor(
        todayWorkingMinutes /
          60
      );

    const todayMinutes =
      todayWorkingMinutes % 60;

    return NextResponse.json({
      success: true,

      today,

      month,

      monthStart,

      monthEnd,

      daysInMonth,

      summary: {
        totalStaff,

        presentToday,

        halfDayToday,

        leaveToday,

        absentToday,

        currentlyWorking,

        checkedOutToday,

        todayWorkingHours:
          `${todayHours}h ${todayMinutes}m`,

        totalPresent,

        totalHalfDay,

        totalLeave,

        totalAbsent,

        totalUnmarked,

        overallAttendancePercentage,

        totalMonthlyWorkingHours:
          `${monthlyHours}h ${monthlyMinutes}m`,
      },

      performance,
    });
  } catch (error) {
    console.error(
      "STAFF PERFORMANCE DASHBOARD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load staff performance dashboard.",
      },
      {
        status: 500,
      }
    );
  }
}