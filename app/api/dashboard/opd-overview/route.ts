import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );

    const startOfTomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0
    );

    const todayWhere = {
      createdAt: {
        gte: startOfToday,
        lt: startOfTomorrow,
      },
    };

    const [
      totalToday,
      newPatients,
      followUpPatients,
      recentVisits,
    ] = await Promise.all([
      prisma.opdVisit.count({
        where: todayWhere,
      }),

      prisma.opdVisit.count({
        where: {
          ...todayWhere,
          followUpFromId: null,
        },
      }),

      prisma.opdVisit.count({
        where: {
          ...todayWhere,
          followUpFromId: {
            not: null,
          },
        },
      }),

      prisma.opdVisit.findMany({
        where: todayWhere,
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          opdNo: true,
          doctor: true,
          department: true,
          complaint: true,
          diagnosis: true,
          followUpFromId: true,
          createdAt: true,

          patient: {
            select: {
              firstName: true,
              lastName: true,
              patientId: true,
              age: true,
              gender: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,

      overview: {
        totalToday,
        newPatients,
        followUpPatients,
        recentVisits,
      },
    });
  } catch (error) {
    console.error(
      "OPD DASHBOARD OVERVIEW ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load OPD dashboard overview.",
      },
      {
        status: 500,
      }
    );
  }
}