import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const medicine = await prisma.medicine.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!medicine) {
      return NextResponse.json(
        {
          success: false,
          message: "Medicine not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      medicine,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const medicine = await prisma.medicine.update({
      where: {
        id: Number(id),
      },
      data: {
        medicineCode: body.medicineCode,
        genericName: body.genericName,
        brandName: body.brandName || null,
        strength: body.strength || null,
        dosageForm: body.dosageForm || null,
        route: body.route || null,
        manufacturer: body.manufacturer || null,
        isActive: body.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      medicine,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update medicine.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    await prisma.medicine.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete medicine.",
      },
      { status: 500 }
    );
  }
}