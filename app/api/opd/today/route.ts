import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    /*
     * India date
     */
    const indiaDate = new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).format(now);

    const startOfDay = new Date(
      `${indiaDate}T00:00:00+05:30`
    );

    const endOfDay = new Date(
      `${indiaDate}T23:59:59.999+05:30`
    );

    const visits = await prisma.opdVisit.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },

      include: {
        patient: true,

        prescription: {
          select: {
            id: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      visits,
      count: visits.length,
      date: indiaDate,
    });
  } catch (error) {
    console.error(
      "TODAY OPD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load today's OPD.",
      },
      {
        status: 500,
      }
    );
  }
}