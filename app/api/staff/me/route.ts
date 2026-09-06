import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("staff_session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const session = await prisma.staffSession.findUnique({
      where: { tokenHash },
      include: { staff: true },
    });

    if (!session || session.expiresAt.getTime() <= Date.now()) {
      if (session) {
        await prisma.staffSession.deleteMany({
          where: { id: session.id },
        });
      }

      const response = NextResponse.json(
        { success: false, message: "Your staff session has expired. Please login again." },
        { status: 401 }
      );

      response.cookies.set("staff_session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
      });

      return response;
    }

    if (!session.staff.isActive || !session.staff.loginEnabled) {
      return NextResponse.json(
        { success: false, message: "This staff account is inactive or login is disabled." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      staff: {
        id: session.staff.id,
        staffCode: session.staff.staffCode,
        name: session.staff.name,
        role: session.staff.role,
        username: session.staff.username,
      },
    });
  } catch (error) {
    console.error("STAFF ME ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to verify staff session." },
      { status: 500 }
    );
  }
}
