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
        message: "Unable to load sample collection records.",
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

    const {
      date,
      patientName,
      testName,
      cost,
      labName,
    } = body;

    if (
      !date ||
      !patientName?.trim() ||
      !testName?.trim() ||
      cost === undefined ||
      cost === null ||
      !labName?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Date, patient name, test name, cost and lab name are required.",
        },
        {
          status: 400,
        }
      );
    }

    const collection =
      await prisma.labSampleCollection.create({
        data: {
          date: new Date(date),
          patientName: patientName.trim(),
          testName: testName.trim(),
          cost: Number(cost),
          labName: labName.trim(),
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
        message: "Unable to save sample collection record.",
      },
      {
        status: 500,
      }
    );
  }
}