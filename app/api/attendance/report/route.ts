import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } =
      new URL(request.url);

    const from =
      searchParams.get("from");

    const to =
      searchParams.get("to");

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

    const staff =
      await prisma.staff.findMany({
        orderBy: {
          name: "asc",
        },
      });

    const attendance =
      await prisma.attendance.findMany({
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
      });

    const staffReport = staff.map(
      (member) => {
        const records =
          attendance.filter(
            (record) =>
              record.staffId ===
              member.id
          );

        const present =
          records.filter(
            (record) =>
              record.status ===
              "Present"
          ).length;

        const absent =
          records.filter(
            (record) =>
              record.status ===
              "Absent"
          ).length;

        const halfDay =
          records.filter(
            (record) =>
              record.status ===
              "Half Day"
          ).length;

        const leave =
          records.filter(
            (record) =>
              record.status ===
              "Leave"
          ).length;

        const totalMarked =
          records.length;

        const percentage =
          totalMarked > 0
            ? (
                ((present +
                  halfDay * 0.5) /
                  totalMarked) *
                100
              ).toFixed(1)
            : "0.0";

        return {
          staff: {
            id: member.id,

            staffCode:
              member.staffCode,

            name: member.name,

            role: member.role,

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

            percentage:
              Number(
                percentage
              ),
          },

          records: records.map(
            (record) => ({
              id: record.id,

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

    const totalPresent =
      attendance.filter(
        (record) =>
          record.status ===
          "Present"
      ).length;

    const totalAbsent =
      attendance.filter(
        (record) =>
          record.status ===
          "Absent"
      ).length;

    const totalHalfDay =
      attendance.filter(
        (record) =>
          record.status ===
          "Half Day"
      ).length;

    const totalLeave =
      attendance.filter(
        (record) =>
          record.status ===
          "Leave"
      ).length;

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
    console.error(error);

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