import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const staff = await prisma.staff.findFirst({
      where: {
        name: {
          equals: "Rahul Kumar Kuwar",
          mode: "insensitive",
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Rahul Kumar Kuwar was not found.",
        },
        { status: 404 }
      );
    }

    const passwordHash = await bcrypt.hash(
      "Atulyam@123",
      12
    );

    const updatedStaff = await prisma.staff.update({
      where: {
        id: staff.id,
      },
      data: {
        role: "Administrator",
        isActive: true,
        loginEnabled: true,
        passwordHash,
      },
      select: {
        id: true,
        staffCode: true,
        name: true,
        role: true,
        username: true,
        isActive: true,
        loginEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Administrator account fixed successfully.",
      staff: updatedStaff,
      temporaryPassword: "Atulyam@123",
    });
  } catch (error) {
    console.error("FIX ADMIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fix administrator account.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}