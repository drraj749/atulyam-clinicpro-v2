import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("q") || "";

    const medicines = await prisma.medicine.findMany({
      where: {
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
        ],
      },

      orderBy: {
        genericName: "asc",
      },

      take: 10,
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
        message:
          error instanceof Error
            ? error.message
            : "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}