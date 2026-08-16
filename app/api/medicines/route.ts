import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams
      .get("search")
      ?.trim();

    const medicines = await prisma.medicine.findMany({
      where: {
        isActive: true,
        ...(search
          ? {
              OR: [
                {
                  genericName: {
                    contains: search,
                  },
                },
                {
                  brandName: {
                    contains: search,
                  },
                },
                {
                  medicineCode: {
                    contains: search,
                  },
                },
                {
                  strength: {
                    contains: search,
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: {
        genericName: "asc",
      },
      take: 2000,
    });

    return NextResponse.json({
      success: true,
      medicines,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch medicines.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.genericName?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Generic Name is required.",
        },
        { status: 400 }
      );
    }

    const medicine = await prisma.medicine.create({
      data: {
        medicineCode:
          body.medicineCode ||
          `MED${Date.now()}`,

        genericName: body.genericName,

        brandName: body.brandName || null,
        strength: body.strength || null,
        dosageForm: body.dosageForm || null,
        route: body.route || null,
        manufacturer: body.manufacturer || null,

        isActive:
          body.isActive === undefined
            ? true
            : body.isActive,
      },
    });

    return NextResponse.json(
      {
        success: true,
        medicine,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to save medicine.",
      },
      {
        status: 500,
      }
    );
  }
}