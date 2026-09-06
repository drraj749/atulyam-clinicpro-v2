import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/app/lib/prisma";

const SESSION_DAYS = 7;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required." },
        { status: 400 },
      );
    }

    const staff = await prisma.staff.findFirst({
      where: {
        username,
        isActive: true,
        loginEnabled: true,
      },
    });

    if (!staff || !staff.passwordHash) {
      return NextResponse.json(
        { success: false, message: "Invalid username or password." },
        { status: 401 },
      );
    }

    const passwordValid = await bcrypt.compare(password, staff.passwordHash);

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid username or password." },
        { status: 401 },
      );
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    );

    // Remove expired sessions for this staff member.
    await prisma.staffSession.deleteMany({
      where: {
        staffId: staff.id,
        expiresAt: { lte: new Date() },
      },
    });

    await prisma.staffSession.create({
      data: {
        staffId: staff.id,
        tokenHash,
        expiresAt,
      },
    });

    await prisma.staff.update({
      where: { id: staff.id },
      data: { lastLoginAt: new Date() },
    });

    const response = NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        staffCode: staff.staffCode,
        name: staff.name,
        role: staff.role,
        mobile: staff.mobile,
        address: staff.address,
        joiningDate: staff.joiningDate?.toISOString() ?? null,
        isActive: staff.isActive,
        username: staff.username,
        loginEnabled: staff.loginEnabled,
        lastLoginAt: new Date().toISOString(),
      },
    });

    // IMPORTANT:
    // Secure cookies are enabled in production, but disabled on localhost.
    // This allows the browser to send the staff_session cookie over
    // http://localhost:3000 during local development.
    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set({
      name: "staff_session",
      value: rawToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error("POST /api/staff/login error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to sign in. Please try again." },
      { status: 500 },
    );
  }
}
