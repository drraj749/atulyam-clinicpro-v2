import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const admissionId = Number(id);

    if (!Number.isInteger(admissionId) || admissionId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid admission ID.",
        },
        {
          status: 400,
        }
      );
    }

    const admission = await prisma.ipdAdmission.findUnique({
      where: {
        id: admissionId,
      },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            age: true,
            gender: true,
            mobile: true,
            bloodGroup: true,
          },
        },
        bed: {
          include: {
            ward: true,
          },
        },
        clinicalNotes: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        vitals: {
          orderBy: {
            recordedAt: "desc",
          },
          take: 10,
        },
        medicationOrders: {
          orderBy: {
            createdAt: "desc",
          },
        },
        investigations: {
          orderBy: {
            createdAt: "desc",
          },
        },
        dischargeSummary: true,
      },
    });

    if (!admission) {
      return NextResponse.json(
        {
          success: false,
          message: "IPD admission not found.",
        },
        {
          status: 404,
        }
      );
    }

    const charges = await prisma.ipdCharge.findMany({
      where: {
        admissionId,
      },
      orderBy: {
        chargeDate: "desc",
      },
    });

    const payments = await prisma.ipdPayment.findMany({
      where: {
        admissionId,
      },
      orderBy: {
        paidAt: "desc",
      },
    });

    const totalCharges = charges.reduce(
      (sum, charge) => sum + Number(charge.total || 0),
      0
    );

    const totalPayments = payments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const activeMedicationOrders =
      admission.medicationOrders.filter(
        (item) => item.status === "Active"
      );

    const pendingInvestigations =
      admission.investigations.filter(
        (item) => item.status === "Ordered"
      );

    const completedInvestigations =
      admission.investigations.filter(
        (item) => item.status === "Completed"
      );

    const latestVitals =
      admission.vitals.length > 0
        ? admission.vitals[0]
        : null;

    const latestClinicalNote =
      admission.clinicalNotes.length > 0
        ? admission.clinicalNotes[0]
        : null;

    return NextResponse.json({
      success: true,

      admission: {
        id: admission.id,
        ipdNo: admission.ipdNo,
        admissionDate: admission.admissionDate,
        dischargeDate: admission.dischargeDate,
        status: admission.status,
        admittingDoctor: admission.admittingDoctor,
        department: admission.department,
        chiefComplaint: admission.chiefComplaint,
        provisionalDiagnosis: admission.provisionalDiagnosis,
        patient: admission.patient,
        bed: admission.bed,
      },

      latestVitals,

      latestClinicalNote,

      recentVitals: admission.vitals,

      clinicalNotes: admission.clinicalNotes,

      medications: {
        total: admission.medicationOrders.length,
        active: activeMedicationOrders.length,
        orders: admission.medicationOrders,
      },

      investigations: {
        total: admission.investigations.length,
        pending: pendingInvestigations.length,
        completed: completedInvestigations.length,
        items: admission.investigations,
      },

      billing: {
        totalCharges,
        totalPayments,
        balance: totalCharges - totalPayments,
        charges,
        payments,
      },

      dischargeSummary: admission.dischargeSummary,

      dashboard: {
        isDischarged:
          admission.status === "Discharged",

        hasDischargeSummary:
          admission.dischargeSummary !== null,

        latestVitalRecorded:
          latestVitals !== null,

        activeMedications:
          activeMedicationOrders.length,

        pendingInvestigations:
          pendingInvestigations.length,

        outstandingBalance:
          totalCharges - totalPayments,
      },
    });
  } catch (error) {
    console.error(
      "IPD DASHBOARD GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load IPD dashboard.",
      },
      {
        status: 500,
      }
    );
  }
}