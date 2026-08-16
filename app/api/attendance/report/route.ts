import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/app/lib/prisma";

type StaffMember = {
  id: number;
  staffCode: string;
  name: string;
  role: string;
  mobile: string | null;
  isActive: boolean;
};

type AttendanceRecord = {
  id: number;
  staffId: number;
  attendanceDate: string;
  status: string;
  checkIn: Date | null;
  checkOut: Date | null;
  remarks: string | null;
};

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const from =
      searchParams.get("from");

    const to =
      searchParams.get("to");

    // --------------------------------
    // VALIDATE DATES
    // --------------------------------

    if (!from || !to) {
      return NextResponse.json(
        {
          success: false,
          message:
            "From date and To date are required.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------
    // LOAD STAFF
    // --------------------------------

    const staff =
      (await prisma.staff.findMany({
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          staffCode: true,
          name: true,
          role: true,
          mobile: true,
          isActive: true,
        },
      })) as StaffMember[];

    // --------------------------------
    // LOAD ATTENDANCE
    // --------------------------------

    const attendance =
      (await prisma.attendance.findMany({
        where: {
          attendanceDate: {
            gte: from,
            lte: to,
          },
        },

        orderBy: [
          {
            attendanceDate: "asc",
          },
          {
            staffId: "asc",
          },
        ],
      })) as AttendanceRecord[];

    // --------------------------------
    // BUILD STAFF REPORT
    // --------------------------------

    const staffReport =
      staff.map(
        (member: StaffMember) => {
          const records =
            attendance.filter(
              (record: AttendanceRecord) =>
                record.staffId ===
                member.id
            );

          // ----------------------------
          // STATUS COUNTS
          // ----------------------------

          const present =
            records.filter(
              (record: AttendanceRecord) =>
                record.status ===
                "Present"
            ).length;

          const absent =
            records.filter(
              (record: AttendanceRecord) =>
                record.status ===
                "Absent"
            ).length;

          const halfDay =
            records.filter(
              (record: AttendanceRecord) =>
                record.status ===
                "Half Day"
            ).length;

          const leave =
            records.filter(
              (record: AttendanceRecord) =>
                record.status ===
                "Leave"
            ).length;

          const totalMarked =
            records.length;

          // ----------------------------
          // ATTENDANCE PERCENTAGE
          // ----------------------------

          const percentage =
            totalMarked > 0
              ? Number(
                  (
                    ((present +
                      halfDay * 0.5) /
                      totalMarked) *
                    100
                  ).toFixed(1)
                )
              : 0;

          // ----------------------------
          // RETURN STAFF REPORT
          // ----------------------------

          return {
            staff: {
              id: member.id,

              staffCode:
                member.staffCode,

              name:
                member.name,

              role:
                member.role,

              mobile:
                member.mobile,

              isActive:
                member.isActive,
            },

            summary: {
              present,

              absent,

              halfDay,

              leave,

              totalMarked,

              percentage,
            },

            records:
              records.map(
                (
                  record: AttendanceRecord
                ) => ({
                  id:
                    record.id,

                  attendanceDate:
                    record.attendanceDate,

                  status:
                    record.status,

                  checkIn:
                    record.checkIn,

                  checkOut:
                    record.checkOut,

                  remarks:
                    record.remarks,
                })
              ),
          };
        }
      );

    // --------------------------------
    // OVERALL SUMMARY
    // --------------------------------

    const totalPresent =
      attendance.filter(
        (record: AttendanceRecord) =>
          record.status ===
          "Present"
      ).length;

    const totalAbsent =
      attendance.filter(
        (record: AttendanceRecord) =>
          record.status ===
          "Absent"
      ).length;

    const totalHalfDay =
      attendance.filter(
        (record: AttendanceRecord) =>
          record.status ===
          "Half Day"
      ).length;

    const totalLeave =
      attendance.filter(
        (record: AttendanceRecord) =>
          record.status ===
          "Leave"
      ).length;

    // --------------------------------
    // RESPONSE
    // --------------------------------

    return NextResponse.json({
      success: true,

      from,

      to,

      summary: {
        totalStaff:
          staff.length,

        totalRecords:
          attendance.length,

        totalPresent,

        totalAbsent,

        totalHalfDay,

        totalLeave,
      },

      staffReport,
    });
  } catch (error) {
    console.error(
      "ATTENDANCE REPORT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to generate attendance report.",
      },
      {
        status: 500,
      }
    );
  }
}