import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const username = String(
      body.username ?? ""
    ).trim();

    const password = String(
      body.password ?? ""
    );

    // --------------------------------
    // VALIDATION
    // --------------------------------

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is required.",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // FIND STAFF
    // --------------------------------

    const staff = await prisma.staff.findUnique({
      where: {
        username,
      },
    });

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username or password.",
        },
        { status: 401 }
      );
    }

    // --------------------------------
    // CHECK STAFF STATUS
    // --------------------------------

    if (!staff.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your staff account is inactive. Please contact the administrator.",
        },
        { status: 403 }
      );
    }

    if (!staff.loginEnabled) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Login is not enabled for this staff account.",
        },
        { status: 403 }
      );
    }

    if (!staff.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password has not been configured. Please contact the administrator.",
        },
        { status: 403 }
      );
    }

    // --------------------------------
    // VERIFY PASSWORD
    // --------------------------------

    const passwordValid =
      await bcrypt.compare(
        password,
        staff.passwordHash
      );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username or password.",
        },
        { status: 401 }
      );
    }

    // --------------------------------
    // CREATE SESSION TOKEN
    // --------------------------------

    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() +
        7 * 24 * 60 * 60 * 1000
    );

    // --------------------------------
    // SAVE SESSION
    // --------------------------------

    await prisma.staffSession.create({
      data: {
        staffId: staff.id,
        tokenHash,
        expiresAt,
      },
    });

    // --------------------------------
    // UPDATE LAST LOGIN
    // --------------------------------

    await prisma.staff.update({
      where: {
        id: staff.id,
      },

      data: {
        lastLoginAt: new Date(),
      },
    });

    // --------------------------------
    // RESPONSE
    // --------------------------------

    const response =
      NextResponse.json({
        success: true,

        message:
          "Login successful.",

        staff: {
          id: staff.id,
          staffCode: staff.staffCode,
          name: staff.name,
          role: staff.role,
          username: staff.username,
        },
      });

    // --------------------------------
    // HTTP ONLY COOKIE
    // --------------------------------

    response.cookies.set(
      "staff_session",
      token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
      }
    );

    return response;
  } catch (error) {
    console.error(
      "STAFF LOGIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to login. Please try again.",
      },
      { status: 500 }
    );
  }
}