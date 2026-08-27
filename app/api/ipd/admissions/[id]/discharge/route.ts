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

    if (
      !Number.isInteger(admissionId) ||
      admissionId <= 0
    ) {
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

    const admission =
      await prisma.ipdAdmission.findUnique({
        where: {
          id: admissionId,
        },
        include: {
          patient: true,
          bed: {
            include: {
              ward: true,
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

    return NextResponse.json({
      success: true,
      admission,
    });
  } catch (error) {
    console.error(
      "IPD DISCHARGE GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load discharge information.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const admissionId = Number(id);

    if (
      !Number.isInteger(admissionId) ||
      admissionId <= 0
    ) {
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

    const body = await request.json();

    const dischargedBy = String(
      body.dischargedBy ?? ""
    ).trim();

    const finalDiagnosis = String(
      body.finalDiagnosis ?? ""
    ).trim();

    const history = String(
      body.history ?? ""
    ).trim();

    const examination = String(
      body.examination ?? ""
    ).trim();

    const hospitalCourse = String(
      body.hospitalCourse ?? ""
    ).trim();

    const investigations = String(
      body.investigations ?? ""
    ).trim();

    const treatmentGiven = String(
      body.treatmentGiven ?? ""
    ).trim();

    const procedures = String(
      body.procedures ?? ""
    ).trim();

    const conditionAtDischarge = String(
      body.conditionAtDischarge ?? ""
    ).trim();

    const dischargeAdvice = String(
      body.dischargeAdvice ?? ""
    ).trim();

    const followUpAdvice = String(
      body.followUpAdvice ?? ""
    ).trim();

    const admission =
      await prisma.ipdAdmission.findUnique({
        where: {
          id: admissionId,
        },
        select: {
          id: true,
          bedId: true,
          status: true,
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

    if (admission.status === "Discharged") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This patient has already been discharged.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await prisma.$transaction(async (tx) => {
        const dischargeSummary =
          await tx.ipdDischargeSummary.upsert({
            where: {
              admissionId,
            },
            update: {
              finalDiagnosis:
                finalDiagnosis || null,
              history:
                history || null,
              examination:
                examination || null,
              hospitalCourse:
                hospitalCourse || null,
              investigations:
                investigations || null,
              treatmentGiven:
                treatmentGiven || null,
              procedures:
                procedures || null,
              conditionAtDischarge:
                conditionAtDischarge || null,
              dischargeAdvice:
                dischargeAdvice || null,
              followUpAdvice:
                followUpAdvice || null,
              dischargedBy:
                dischargedBy || null,
              dischargeDate:
                new Date(),
            },
            create: {
              admissionId,
              finalDiagnosis:
                finalDiagnosis || null,
              history:
                history || null,
              examination:
                examination || null,
              hospitalCourse:
                hospitalCourse || null,
              investigations:
                investigations || null,
              treatmentGiven:
                treatmentGiven || null,
              procedures:
                procedures || null,
              conditionAtDischarge:
                conditionAtDischarge || null,
              dischargeAdvice:
                dischargeAdvice || null,
              followUpAdvice:
                followUpAdvice || null,
              dischargedBy:
                dischargedBy || null,
              dischargeDate:
                new Date(),
            },
          });

        const updatedAdmission =
          await tx.ipdAdmission.update({
            where: {
              id: admissionId,
            },
            data: {
              status: "Discharged",
              dischargeDate:
                new Date(),
            },
          });

        const updatedBed =
          await tx.bed.update({
            where: {
              id: admission.bedId,
            },
            data: {
              status: "Available",
            },
          });

        return {
          dischargeSummary,
          updatedAdmission,
          updatedBed,
        };
      });

    return NextResponse.json({
      success: true,
      message:
        "Patient discharged successfully.",
      dischargeSummary:
        result.dischargeSummary,
      admission:
        result.updatedAdmission,
      bed:
        result.updatedBed,
    });
  } catch (error) {
    console.error(
      "IPD DISCHARGE POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to discharge patient.",
      },
      {
        status: 500,
      }
    );
  }
}