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
    console.error(
      "LAB COLLECTION GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load lab sample records.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const date =
      String(
        body.date ?? ""
      ).trim();

    const patientName =
      String(
        body.patientName ?? ""
      ).trim();

    const testName =
      String(
        body.testName ?? ""
      ).trim();

    const labName =
      String(
        body.labName ?? ""
      ).trim();

    const cost =
      Number(body.cost);

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Date is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!patientName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Patient name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!testName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Test name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      body.cost === undefined ||
      body.cost === null ||
      body.cost === "" ||
      !Number.isFinite(cost) ||
      cost < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid cost.",
        },
        {
          status: 400,
        }
      );
    }

    if (!labName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Lab name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const parsedDate =
      new Date(
        `${date}T00:00:00`
      );

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid date.",
        },
        {
          status: 400,
        }
      );
    }

    const collection =
      await prisma.labSampleCollection.create(
        {
          data: {
            date: parsedDate,
            patientName,
            testName,
            cost,
            labName,
          },
        }
      );

    return NextResponse.json(
      {
        success: true,
        collection,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "LAB COLLECTION POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to save lab sample record.",
      },
      {
        status: 500,
      }
    );
  }
}