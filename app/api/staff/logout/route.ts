import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import crypto from "crypto";

export async function POST(
  request: NextRequest
) {
  try {
    const token =
      request.cookies.get(
        "staff_session"
      )?.value;

    if (token) {
      const tokenHash =
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");

      await prisma.staffSession.deleteMany({
        where: {
          tokenHash,
        },
      });
    }

    const response =
      NextResponse.json({
        success: true,
        message: "Logged out successfully.",
      });

    response.cookies.set(
      "staff_session",
      "",
      {
        httpOnly: true,
        expires: new Date(0),
        path: "/",
      }
    );

    return response;
  } catch (error) {
    console.error(
      "STAFF LOGOUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to logout.",
      },
      { status: 500 }
    );
  }
}