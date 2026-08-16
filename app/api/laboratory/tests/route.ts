import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const tests = await prisma.labTest.findMany({
      orderBy: {
        testName: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      tests,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load Lab Tests.",
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

    const test = await prisma.labTest.create({
      data: {
        testCode: body.testCode,
        category: body.category,
        testName: body.testName,
        shortName: body.shortName,
        specimen: body.specimen,
        method: body.method,
        unit: body.unit,
        normalRange: body.normalRange,
        price: Number(body.price),
      },
    });

    return NextResponse.json({
      success: true,
      test,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save Lab Test.",
      },
      {
        status: 500,
      }
    );
  }
}