import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
type StaffWithAttendance =
  Prisma.StaffGetPayload<{
    include: {
      attendance: true;
    };
  }>;
export async function GET(request: NextRequest) {
  try {
    const { searchParams } =
      new URL(request.url);

    const date =
      searchParams.get("date") ||
      new Date()
        .toISOString()
        .split("T")[0];

    const staff =
      await prisma.staff.findMany({
        where: {
          isActive: true,
        },

        orderBy: {
          name: "asc",
        },

        include: {
          attendance: {
            where: {
              attendanceDate: date,
            },
          },
        },
      });

   const attendance = staff.map(
  (member: StaffWithAttendance) => {
        const record =
          member.attendance[0];

        return {
          staff: {
            id: member.id,
            staffCode:
              member.staffCode,
            name: member.name,
            role: member.role,
            mobile: member.mobile,
          },

          attendance: record
            ? {
                id: record.id,
                status:
                  record.status,
                checkIn:
                  record.checkIn,
                checkOut:
                  record.checkOut,
                remarks:
                  record.remarks,
                attendanceDate:
                  record.attendanceDate,
              }
            : null,
        };
      }
    );

    return NextResponse.json({
      success: true,
      date,
      attendance,
    });
  } catch (error) {
    console.error(error);

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

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const staffId = Number(
      body.staffId
    );

    const attendanceDate =
      String(
        body.attendanceDate ?? ""
      ).trim();

    const status =
      String(
        body.status ?? "Present"
      ).trim();

    if (!staffId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Staff member is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!attendanceDate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Attendance date is required.",
        },
        {
          status: 400,
        }
      );
    }

    const allowedStatuses = [
      "Present",
      "Absent",
      "Half Day",
      "Leave",
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

    let checkIn: Date | null =
      null;

    let checkOut: Date | null =
      null;

    if (body.checkIn) {
      const parsed =
        new Date(body.checkIn);

      if (
        !isNaN(
          parsed.getTime()
        )
      ) {
        checkIn = parsed;
      }
    }

    if (body.checkOut) {
      const parsed =
        new Date(body.checkOut);

      if (
        !isNaN(
          parsed.getTime()
        )
      ) {
        checkOut = parsed;
      }
    }

    const remarks =
      String(
        body.remarks ?? ""
      ).trim() || null;

    const attendance =
      await prisma.attendance.upsert(
        {
          where: {
            staffId_attendanceDate: {
              staffId,
              attendanceDate,
            },
          },

          update: {
            status,
            checkIn,
            checkOut,
            remarks,
          },

          create: {
            staffId,
            attendanceDate,
            status,
            checkIn,
            checkOut,
            remarks,
          },
        }
      );

    return NextResponse.json({
      success: true,
      attendance,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to save attendance.",
      },
      {
        status: 500,
      }
    );
  }
}