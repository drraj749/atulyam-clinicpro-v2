import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function validateCollection(body: {
  date?: unknown;
  patientName?: unknown;
  testName?: unknown;
  cost?: unknown;
  labName?: unknown;
}) {
  const date = String(body.date ?? "").trim();

  const patientName = String(
    body.patientName ?? ""
  ).trim();

  const testName = String(
    body.testName ?? ""
  ).trim();

  const labName = String(
    body.labName ?? ""
  ).trim();

  const cost = Number(body.cost);

  if (!date) {
    return {
      error: "Date is required.",
    };
  }

  if (!patientName) {
    return {
      error: "Patient name is required.",
    };
  }

  if (!testName) {
    return {
      error: "Test name is required.",
    };
  }

  if (
    body.cost === undefined ||
    body.cost === null ||
    body.cost === "" ||
    !Number.isFinite(cost) ||
    cost < 0
  ) {
    return {
      error: "Please enter a valid cost.",
    };
  }

  if (!labName) {
    return {
      error: "Lab name is required.",
    };
  }

  const parsedDate = new Date(
    `${date}T00:00:00`
  );

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return {
      error: "Invalid date.",
    };
  }

  return {
    data: {
      date: parsedDate,
      patientName,
      testName,
      cost,
      labName,
    },
  };
}

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
    const body = await request.json();

    const validation =
      validateCollection(body);

    if ("error" in validation) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error,
        },
        {
          status: 400,
        }
      );
    }

    const collection =
      await prisma.labSampleCollection.create({
        data: validation.data,
      });

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

export async function PUT(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const id = Number(body.id);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid record ID.",
        },
        {
          status: 400,
        }
      );
    }

    const validation =
      validateCollection(body);

    if ("error" in validation) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error,
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.labSampleCollection.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Record not found.",
        },
        {
          status: 404,
        }
      );
    }

    const collection =
      await prisma.labSampleCollection.update({
        where: {
          id,
        },
        data: validation.data,
      });

    return NextResponse.json({
      success: true,
      collection,
    });
  } catch (error) {
    console.error(
      "LAB COLLECTION PUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update lab sample record.",
      },
      {
        status: 500,
      }
    );
  }
}