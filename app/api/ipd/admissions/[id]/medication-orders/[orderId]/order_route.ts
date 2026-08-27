import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
    orderId: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id, orderId } = await context.params;

    const admissionId = Number(id);
    const medicationOrderId = Number(orderId);

    if (
      !Number.isInteger(admissionId) ||
      admissionId <= 0 ||
      !Number.isInteger(medicationOrderId) ||
      medicationOrderId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid admission or order ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const order =
      await prisma.ipdMedicationOrder.findFirst({
        where: {
          id: medicationOrderId,
          admissionId,
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Medication order not found.",
        },
        {
          status: 404,
        }
      );
    }

    const allowedStatuses = [
      "Active",
      "Stopped",
      "Completed",
      "Held",
    ];

    const status = String(
      body.status ?? order.status
    ).trim();

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid medication order status.",
        },
        {
          status: 400,
        }
      );
    }

    const updated =
      await prisma.ipdMedicationOrder.update({
        where: {
          id: medicationOrderId,
        },
        data: {
          status,
          ...(status === "Stopped" ||
          status === "Completed"
            ? {
                endDate:
                  body.endDate
                    ? new Date(
                        String(body.endDate)
                      )
                    : new Date(),
              }
            : {}),
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Medication order updated successfully.",
      order: updated,
    });
  } catch (error) {
    console.error(
      "IPD MEDICATION ORDER PATCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update medication order.",
      },
      {
        status: 500,
      }
    );
  }
}
