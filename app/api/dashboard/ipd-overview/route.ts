import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const startOfTomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    const [
      activeIPD,
      availableBeds,
      todayAdmissions,
      todayDischarges,
      recentAdmissions,
    ] = await Promise.all([
      prisma.ipdAdmission.count({
        where: {
          status: {
            not: "Discharged",
          },
        },
      }),

      prisma.bed.count({
        where: {
          isActive: true,
          status: "Available",
        },
      }),

      prisma.ipdAdmission.count({
        where: {
          admissionDate: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
      }),

      prisma.ipdAdmission.count({
        where: {
          status: "Discharged",
          dischargeDate: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
      }),

      prisma.ipdAdmission.findMany({
        take: 10,

        orderBy: {
          admissionDate: "desc",
        },

        select: {
          id: true,
          ipdNo: true,
          admissionDate: true,
          status: true,
          provisionalDiagnosis: true,

          patient: {
            select: {
              firstName: true,
              lastName: true,
              patientId: true,
            },
          },

          bed: {
            select: {
              bedNumber: true,

              ward: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,

      overview: {
        activeIPD,
        availableBeds,
        todayAdmissions,
        todayDischarges,
        recentAdmissions,
      },
    });
  } catch (error) {
    console.error("IPD DASHBOARD OVERVIEW ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load IPD dashboard overview.",
      },
      {
        status: 500,
      }
    );
  }
}