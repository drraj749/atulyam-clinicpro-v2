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

    const administrations =
      await prisma.ipdMedicationAdministration.findMany({
        where: {
          admissionId,
        },
        include: {
          medicationOrder: true,
        },
        orderBy: {
          scheduledAt: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      administrations,
    });
  } catch (error) {
    console.error(
      "IPD MEDICATION ADMINISTRATION GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load medication administration records.",
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

    const body = await request.json();

    const medicationOrderId = Number(
      body.medicationOrderId
    );

    const status = String(
      body.status ?? "Given"
    ).trim();

    const doseGiven = String(
      body.doseGiven ?? ""
    ).trim();

    const remarks = String(
      body.remarks ?? ""
    ).trim();

    const administeredBy = String(
      body.administeredBy ?? ""
    ).trim();

    if (
      !Number.isInteger(medicationOrderId) ||
      medicationOrderId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid medication order ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    let scheduledAt = new Date();

    if (body.scheduledAt) {
      const parsedScheduledAt = new Date(
        body.scheduledAt
      );

      if (
        Number.isNaN(
          parsedScheduledAt.getTime()
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid scheduled date and time.",
          },
          {
            status: 400,
          }
        );
      }

      scheduledAt = parsedScheduledAt;
    }

    let administeredAt: Date | null =
      new Date();

    if (
      status.toLowerCase() === "pending" ||
      status.toLowerCase() === "scheduled"
    ) {
      administeredAt = null;
    }

    if (body.administeredAt) {
      const parsedAdministeredAt = new Date(
        body.administeredAt
      );

      if (
        Number.isNaN(
          parsedAdministeredAt.getTime()
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid administration date and time.",
          },
          {
            status: 400,
          }
        );
      }

      administeredAt = parsedAdministeredAt;
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

    const medicationOrder =
      await prisma.ipdMedicationOrder.findFirst({
        where: {
          id: medicationOrderId,
          admissionId,
        },
        select: {
          id: true,
        },
      });

    if (!medicationOrder) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Medication order not found for this admission.",
        },
        {
          status: 404,
        }
      );
    }

    const administration =
      await prisma.ipdMedicationAdministration.create({
        data: {
          admissionId,
          medicationOrderId,
          scheduledAt,
          administeredAt,
          status: status || "Given",
          doseGiven: doseGiven || null,
          remarks: remarks || null,
          administeredBy: administeredBy || null,
        },
        include: {
          medicationOrder: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Medication administration record added successfully.",
        administration,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "IPD MEDICATION ADMINISTRATION POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to add medication administration record.",
      },
      {
        status: 500,
      }
    );
  }
}