import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const [
      recentOpdVisits,
      recentIpdAdmissions,
      recentLabOrders,
    ] = await Promise.all([
      prisma.opdVisit.findMany({
        take: 5,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          opdNo: true,
          createdAt: true,
          diagnosis: true,

          patient: {
            select: {
              firstName: true,
              lastName: true,
              patientId: true,
            },
          },
        },
      }),

      prisma.ipdAdmission.findMany({
        take: 5,

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
        },
      }),

      prisma.labOrder.findMany({
        take: 5,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          orderNo: true,
          status: true,
          createdAt: true,

          patient: {
            select: {
              firstName: true,
              lastName: true,
              patientId: true,
            },
          },

          items: {
            take: 3,

            select: {
              test: {
                select: {
                  testName: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const activities = [
      ...recentOpdVisits.map((visit) => ({
        id: `opd-${visit.id}`,
        type: "OPD",
        title: "OPD Consultation",
        reference: visit.opdNo,
        patientName: [
          visit.patient.firstName,
          visit.patient.lastName,
        ]
          .filter(Boolean)
          .join(" "),
        patientId: visit.patient.patientId,
        description:
          visit.diagnosis ||
          "OPD consultation recorded",
        date: visit.createdAt,
        href: "/opd/today",
      })),

      ...recentIpdAdmissions.map((admission) => ({
        id: `ipd-${admission.id}`,
        type: "IPD",
        title:
          admission.status === "Discharged"
            ? "IPD Discharge"
            : "IPD Admission",
        reference: admission.ipdNo,
        patientName: [
          admission.patient.firstName,
          admission.patient.lastName,
        ]
          .filter(Boolean)
          .join(" "),
        patientId: admission.patient.patientId,
        description:
          admission.provisionalDiagnosis ||
          "IPD patient record",
        date: admission.admissionDate,
        href: `/ipd/admissions/${admission.id}`,
      })),

      ...recentLabOrders.map((order) => ({
        id: `lab-${order.id}`,
        type: "LAB",
        title: "Laboratory Order",
        reference: order.orderNo,
        patientName: [
          order.patient.firstName,
          order.patient.lastName,
        ]
          .filter(Boolean)
          .join(" "),
        patientId: order.patient.patientId,
        description:
          order.items
            .map((item) => item.test.testName)
            .join(", ") ||
          "Laboratory investigation",
        date: order.createdAt,
        href: "/laboratory",
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 15);

    return NextResponse.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error(
      "RECENT CLINICAL ACTIVITY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load recent clinical activity.",
      },
      {
        status: 500,
      }
    );
  }
}