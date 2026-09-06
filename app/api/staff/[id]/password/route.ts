import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/app/lib/prisma";

const ADMIN_ROLES = new Set([
  "admin",
  "administrator",
  "hospital admin",
  "hospital administrator",
  "owner",
  "manager",
  "hr",
  "hr manager",
]);

function isAdmin(role: string | null | undefined) {
  return ADMIN_ROLES.has((role || "").trim().toLowerCase());
}

async function getAuthenticatedStaff(request: NextRequest) {
  const token = request.cookies.get("staff_session")?.value;
  if (!token) return null;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const session = await prisma.staffSession.findUnique({
    where: { tokenHash },
    include: { staff: true },
  });

  if (!session || session.expiresAt <= new Date() || !session.staff.isActive || !session.staff.loginEnabled) {
    return null;
  }

  return session.staff;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const current = await getAuthenticatedStaff(request);
    if (!current) return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    if (!isAdmin(current.role)) return NextResponse.json({ success: false, message: "Administrator access required." }, { status: 403 });

    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ success: false, message: "Invalid staff ID." }, { status: 400 });
    }

    const staff = await prisma.staff.findUnique({ where: { id } });
    if (!staff) return NextResponse.json({ success: false, message: "Staff member not found." }, { status: 404 });

    const body = await request.json();
    const password = String(body.password || "");

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: "Password must contain at least 6 characters." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.staff.update({
      where: { id },
      data: {
        passwordHash,
        loginEnabled: true,
      },
    });

    // Force all existing sessions for this staff member to expire after a password reset.
    await prisma.staffSession.deleteMany({ where: { staffId: id } });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("POST /api/staff/[id]/password error:", error);
    return NextResponse.json({ success: false, message: "Unable to reset password." }, { status: 500 });
  }
}
