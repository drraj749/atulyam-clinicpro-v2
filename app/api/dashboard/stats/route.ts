import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const totalPatients = await prisma.patient.count();

    const totalMedicines = await prisma.medicine.count();

    const totalTemplates =
      await prisma.diseaseTemplate.count();

    // Current date in India
    const now = new Date();

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

    const todayOPD =
      await prisma.opdVisit.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

    return NextResponse.json({
      success: true,

      stats: {
        totalPatients,
        todayOPD,
        totalMedicines,
        totalTemplates,
      },
    });
  } catch (error) {
    console.error(
      "DASHBOARD STATS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load dashboard statistics.",
      },
      {
        status: 500,
      }
    );
  }
}