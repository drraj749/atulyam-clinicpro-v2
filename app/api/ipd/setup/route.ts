import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const wards = await prisma.ward.findMany({
      include: {
        beds: {
          orderBy: {
            bedNumber: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      wards,
    });
  } catch (error) {
    console.error("IPD SETUP GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load wards and beds.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST() {
  try {
    const existingWardCount = await prisma.ward.count();

    if (existingWardCount > 0) {
      return NextResponse.json({
        success: true,
        message: "IPD wards and beds are already configured.",
      });
    }

    const icuWard = await prisma.ward.create({
      data: {
        name: "ICU",
        code: "ICU",
        beds: {
          create: [
            {
              bedNumber: "ICU-1",
            },
            {
              bedNumber: "ICU-2",
            },
          ],
        },
      },
      include: {
        beds: true,
      },
    });

    const generalWard = await prisma.ward.create({
      data: {
        name: "General Ward",
        code: "GEN",
        beds: {
          create: [
            {
              bedNumber: "GEN-1",
            },
            {
              bedNumber: "GEN-2",
            },
            {
              bedNumber: "GEN-3",
            },
            {
              bedNumber: "GEN-4",
            },
            {
              bedNumber: "GEN-5",
            },
            {
              bedNumber: "GEN-6",
            },
            {
              bedNumber: "GEN-7",
            },
          ],
        },
      },
      include: {
        beds: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "ICU and General Ward beds have been configured successfully.",
        wards: [icuWard, generalWard],
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("IPD SETUP POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to configure IPD wards and beds.",
      },
      {
        status: 500,
      }
    );
  }
}