import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// ========================================
// CREATE / UPDATE STAFF LOGIN CREDENTIALS
// ========================================

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const staffId = Number(id);

    if (!staffId || Number.isNaN(staffId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff ID.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const username = String(
      body.username ?? ""
    ).trim().toLowerCase();

    const password = String(
      body.password ?? ""
    );

    const loginEnabled =
      body.loginEnabled === true;

    // ========================================
    // FIND STAFF
    // ========================================

    const staff =
      await prisma.staff.findUnique({
        where: {
          id: staffId,
        },
      });

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff member not found.",
        },
        { status: 404 }
      );
    }

    // ========================================
    // DISABLE LOGIN
    // ========================================

    if (!loginEnabled) {
      await prisma.staff.update({
        where: {
          id: staffId,
        },
        data: {
          loginEnabled: false,
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "Staff login disabled successfully.",
      });
    }

    // ========================================
    // VALIDATE USERNAME
    // ========================================

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username is required when login is enabled.",
        },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username must contain at least 3 characters.",
        },
        { status: 400 }
      );
    }

    // ========================================
    // VALIDATE PASSWORD
    // ========================================

    // If a new password is provided,
    // create a new password hash.

    let passwordHash =
      staff.passwordHash;

    if (password.length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Password must contain at least 6 characters.",
          },
          { status: 400 }
        );
      }

      passwordHash =
        await bcrypt.hash(
          password,
          12
        );
    }

    if (!passwordHash) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a password.",
        },
        { status: 400 }
      );
    }

    // ========================================
    // CHECK USERNAME
    // ========================================

    const existingStaff =
      await prisma.staff.findFirst({
        where: {
          username,
          NOT: {
            id: staffId,
          },
        },
      });

    if (existingStaff) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This username is already being used by another staff member.",
        },
        { status: 400 }
      );
    }

    // ========================================
    // SAVE LOGIN
    // ========================================

    const updatedStaff =
      await prisma.staff.update({
        where: {
          id: staffId,
        },

        data: {
          username,
          passwordHash,
          loginEnabled: true,
        },
      });

    return NextResponse.json({
      success: true,

      message:
        "Staff login credentials saved successfully.",

      staff: {
        id: updatedStaff.id,
        staffCode:
          updatedStaff.staffCode,
        name: updatedStaff.name,
        role: updatedStaff.role,
        username:
          updatedStaff.username,
        loginEnabled:
          updatedStaff.loginEnabled,
      },
    });
  } catch (error: any) {
    console.error(
      "STAFF LOGIN CREDENTIAL ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to save login credentials.",
      },
      { status: 500 }
    );
  }
}