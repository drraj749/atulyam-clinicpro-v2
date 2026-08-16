import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalPatients,
      todayOpd,
      totalPrescriptions,
      totalMedicines,
      recentVisits,
    ] = await Promise.all([
      prisma.patient.count(),

      prisma.opdVisit.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),

      prisma.prescription.count(),

      prisma.medicine.count({
        where: {
          isActive: true,
        },
      }),

      prisma.opdVisit.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        include: {
          patient: true,
        },
      }),
    ]);

    const recent = recentVisits.map((visit) => ({
      id: visit.id,
      opdNo: visit.opdNo,
      patientName:
        visit.patient.firstName +
        " " +
        (visit.patient.lastName ?? ""),
      age: visit.patient.age,
      gender: visit.patient.gender,
      mobile: visit.patient.mobile,
      doctor: visit.doctor,
      department: visit.department,
      fee: visit.fee,
      createdAt: visit.createdAt,
    }));

    return NextResponse.json({
      success: true,

      stats: {
        totalPatients,
        todayOpd,
        totalPrescriptions,
        totalMedicines,
      },

      recentVisits: recent,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load dashboard.",
      },
      {
        status: 500,
      }
    );
  }
}