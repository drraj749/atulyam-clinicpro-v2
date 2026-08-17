import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let where = {};

    if (from && to) {
      const startDate = new Date(from);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);

      where = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const [
      patients,
      prescriptions,
      medicines,
      opdVisits,
    ] = await Promise.all([
      prisma.patient.count(),

      prisma.prescription.count(),

      prisma.medicine.count({
        where: {
          isActive: true,
        },
      }),

      prisma.opdVisit.findMany({
        where,
        include: {
          patient: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const totalCollection = opdVisits.reduce(
  (sum: number, visit: { fee: number | null }) =>
    sum + (visit.fee ?? 0),
  0
);

    const report = opdVisits.map((visit) => ({
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

      diagnosis: visit.diagnosis,

      fee: visit.fee ?? 0,

      paymentMode: visit.paymentMode ?? "",

      date: visit.createdAt,
    }));

    return NextResponse.json({
      success: true,

      summary: {
        totalPatients: patients,

        totalPrescriptions: prescriptions,

        totalMedicines: medicines,

        totalOpd: opdVisits.length,

        totalCollection,
      },

      opdReport: report,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate report.",
      },
      {
        status: 500,
      }
    );
  }
}