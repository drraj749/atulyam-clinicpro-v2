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

    const medicationOrders =
      await prisma.ipdMedicationOrder.findMany({
        where: {
          admissionId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      medicationOrders,
    });
  } catch (error) {
    console.error(
      "IPD MEDICATION ORDERS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load medication orders.",
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

    const medicineName = String(
      body.medicineName ?? ""
    ).trim();

    const strength = String(
      body.strength ?? ""
    ).trim();

    const dosage = String(
      body.dosage ?? ""
    ).trim();

    const frequency = String(
      body.frequency ?? ""
    ).trim();

    const route = String(
      body.route ?? ""
    ).trim();

    const duration = String(
      body.duration ?? ""
    ).trim();

    const instruction = String(
      body.instruction ?? ""
    ).trim();

    const orderedBy = String(
      body.orderedBy ?? ""
    ).trim();

    if (!medicineName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Medicine name is required.",
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

    const medicationOrder =
      await prisma.ipdMedicationOrder.create({
        data: {
          admissionId,

          medicineName,

          strength:
            strength || null,

          dosage:
            dosage || null,

          frequency:
            frequency || null,

          route:
            route || null,

          duration:
            duration || null,

          instruction:
            instruction || null,

          orderedBy:
            orderedBy || null,

          status: "Active",
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Medication order added successfully.",
        medicationOrder,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "IPD MEDICATION ORDERS POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to add medication order.",
      },
      {
        status: 500,
      }
    );
  }
}