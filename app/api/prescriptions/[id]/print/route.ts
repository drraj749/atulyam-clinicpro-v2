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

        items: true,
      },
    });

    if (!prescription) {
      return NextResponse.json(
        {
          success: false,
          message: "Prescription not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      prescription,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      {
        status: 500,
      }
    );

  }
}