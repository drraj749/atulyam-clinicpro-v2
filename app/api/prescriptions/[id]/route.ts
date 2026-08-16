import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type Params = Promise<{
  id: string;
}>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    const prescription = await prisma.prescription.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        opdVisit: {
          include: {
            patient: true,
          },
        },
        items: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    if (!prescription) {
      return NextResponse.json(
        {
          success: false,
          message: "Prescription not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error("LOAD PRESCRIPTION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const prescription = await prisma.prescription.update({
      where: {
        id: Number(id),
      },
      data: {
        notes: body.notes,
        investigations: body.investigations,
      },
    });

    return NextResponse.json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error("UPDATE PRESCRIPTION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}