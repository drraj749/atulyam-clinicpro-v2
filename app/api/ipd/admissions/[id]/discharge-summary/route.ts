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
        select: {
          id: true,
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

    const dischargeSummary =
      await prisma.ipdDischargeSummary.findUnique({
        where: {
          admissionId,
        },
      });

    return NextResponse.json({
      success: true,
      dischargeSummary,
    });
  } catch (error) {
    console.error(
      "IPD DISCHARGE SUMMARY GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load discharge summary.",
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

    const dischargedBy = String(
      body.dischargedBy ?? ""
    ).trim();

    const dischargeDate = body.dischargeDate
      ? new Date(body.dischargeDate)
      : new Date();

    if (
      Number.isNaN(dischargeDate.getTime())
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid discharge date.",
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
        select: {
          id: true,
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

    const dischargeSummary =
      await prisma.ipdDischargeSummary.upsert({
        where: {
          admissionId,
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

          dischargeDate,
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

          dischargeDate,
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Discharge summary saved successfully.",
      dischargeSummary,
    });
  } catch (error) {
    console.error(
      "IPD DISCHARGE SUMMARY POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to save discharge summary.",
      },
      {
        status: 500,
      }
    );
  }
}