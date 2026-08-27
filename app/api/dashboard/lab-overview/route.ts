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
      pendingOrders,
      collectedToday,
      reportedToday,
      recentOrders,
    ] = await Promise.all([
      prisma.labOrder.count({
        where: {
          status: "Pending",
        },
      }),

      prisma.labOrder.count({
        where: {
          collectedAt: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
      }),

      prisma.labOrder.count({
        where: {
          reportedAt: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
      }),

      prisma.labOrder.findMany({
        where: todayWhere,
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          orderNo: true,
          status: true,
          createdAt: true,
          collectedAt: true,
          reportedAt: true,

          patient: {
            select: {
              firstName: true,
              lastName: true,
              patientId: true,
            },
          },

          items: {
            select: {
              test: {
                select: {
                  testName: true,
                  testCode: true,
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
        pendingOrders,
        collectedToday,
        reportedToday,
        recentOrders,
      },
    });
  } catch (error) {
    console.error(
      "LAB DASHBOARD OVERVIEW ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load laboratory dashboard overview.",
      },
      {
        status: 500,
      }
    );
  }
}