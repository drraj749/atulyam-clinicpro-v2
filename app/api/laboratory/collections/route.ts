import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const collections =
      await prisma.labSampleCollection.findMany({
        orderBy: {
          date: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      collections,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load lab sample records.",
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

    if (!body.collectionDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Date is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!body.patientName?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!body.testName?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Test name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      body.cost === undefined ||
      body.cost === null ||
      body.cost === ""
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Cost is required.",
        },
        {
          status: 400,
        }
      );
    }

    const cost = Number(body.cost);

    if (Number.isNaN(cost) || cost < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid cost.",
        },
        {
          status: 400,
        }
      );
    }

    if (!body.labName?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Lab name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const collection =
      await prisma.labSampleCollection.create({
        data: {
          date: new Date(body.collectionDate),

          patientName: body.patientName.trim(),

          testName: body.testName.trim(),

          cost,

          labName: body.labName.trim(),
        },
      });

    return NextResponse.json({
      success: true,
      collection,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save lab sample record.",
      },
      {
        status: 500,
      }
    );
  }
}