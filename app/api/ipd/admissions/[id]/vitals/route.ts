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

    const vitals =
      await prisma.ipdVital.findMany({
        where: {
          admissionId,
        },
        orderBy: {
          recordedAt: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      vitals,
    });
  } catch (error) {
    console.error(
      "IPD VITALS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load IPD vital records.",
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

    const bp = String(
      body.bp ?? ""
    ).trim();

    const pulse =
      body.pulse !== undefined &&
      body.pulse !== null &&
      body.pulse !== ""
        ? Number(body.pulse)
        : null;

    const respiratoryRate =
      body.respiratoryRate !== undefined &&
      body.respiratoryRate !== null &&
      body.respiratoryRate !== ""
        ? Number(body.respiratoryRate)
        : null;

    const temperature =
      body.temperature !== undefined &&
      body.temperature !== null &&
      body.temperature !== ""
        ? Number(body.temperature)
        : null;

    const spo2 =
      body.spo2 !== undefined &&
      body.spo2 !== null &&
      body.spo2 !== ""
        ? Number(body.spo2)
        : null;

    const randomBloodSugar =
      body.randomBloodSugar !== undefined &&
      body.randomBloodSugar !== null &&
      body.randomBloodSugar !== ""
        ? Number(body.randomBloodSugar)
        : null;

    const painScore =
      body.painScore !== undefined &&
      body.painScore !== null &&
      body.painScore !== ""
        ? Number(body.painScore)
        : null;

    const recordedBy = String(
      body.recordedBy ?? ""
    ).trim();

    if (
      pulse !== null &&
      (
        !Number.isInteger(pulse) ||
        pulse < 0 ||
        pulse > 300
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid pulse.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      respiratoryRate !== null &&
      (
        !Number.isInteger(
          respiratoryRate
        ) ||
        respiratoryRate < 0 ||
        respiratoryRate > 100
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid respiratory rate.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      temperature !== null &&
      (
        Number.isNaN(temperature) ||
        temperature < 25 ||
        temperature > 50
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid temperature.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      spo2 !== null &&
      (
        !Number.isInteger(spo2) ||
        spo2 < 0 ||
        spo2 > 100
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid SpO₂ value.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      painScore !== null &&
      (
        !Number.isInteger(painScore) ||
        painScore < 0 ||
        painScore > 10
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pain score must be between 0 and 10.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      randomBloodSugar !== null &&
      (
        Number.isNaN(
          randomBloodSugar
        ) ||
        randomBloodSugar < 0 ||
        randomBloodSugar > 1500
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid blood sugar value.",
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

    const vital =
      await prisma.ipdVital.create({
        data: {
          admissionId,

          bp: bp || null,

          pulse,

          respiratoryRate,

          temperature,

          spo2,

          randomBloodSugar,

          painScore,

          recordedBy:
            recordedBy || null,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Vital signs recorded successfully.",
        vital,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "IPD VITALS POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to save vital signs.",
      },
      {
        status: 500,
      }
    );
  }
}