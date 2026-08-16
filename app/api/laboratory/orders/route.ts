import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function generateOrderNo() {
  return "LAB" + Date.now();
}

export async function GET() {
  try {
    const orders = await prisma.labOrder.findMany({
      include: {
        patient: true,
        items: {
          include: {
            test: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load Lab Orders",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const patient = await prisma.patient.findUnique({
      where: {
        patientId: body.patientId,
      },
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found",
        },
        {
          status: 404,
        }
      );
    }

    const order = await prisma.labOrder.create({
      data: {
        orderNo: generateOrderNo(),

        patientId: patient.id,

        referredBy: body.referredBy,

        items: {
          create: body.tests.map((testId: number) => ({
            testId,
          })),
        },
      },

      include: {
        patient: true,
        items: {
          include: {
            test: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save Lab Order",
      },
      {
        status: 500,
      }
    );
  }
}