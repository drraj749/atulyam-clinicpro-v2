import { NextRequest, NextResponse } from "next/server";
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

function serializeStaff(staff: {
  id: number;
  staffCode: string;
  name: string;
  role: string;
  mobile: string | null;
  address: string | null;
  joiningDate: Date | null;
  isActive: boolean;
  username: string | null;
  loginEnabled: boolean;
  lastLoginAt: Date | null;
}) {
  return {
    ...staff,
    joiningDate: staff.joiningDate?.toISOString() ?? null,
    lastLoginAt: staff.lastLoginAt?.toISOString() ?? null,
  };
}

async function getId(context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const current = await getAuthenticatedStaff(request);
    if (!current) return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    if (!isAdmin(current.role)) return NextResponse.json({ success: false, message: "Administrator access required." }, { status: 403 });

    const id = await getId(context);
    if (!id) return NextResponse.json({ success: false, message: "Invalid staff ID." }, { status: 400 });

    const staff = await prisma.staff.findUnique({ where: { id } });
    if (!staff) return NextResponse.json({ success: false, message: "Staff member not found." }, { status: 404 });

    return NextResponse.json({ success: true, staff: serializeStaff(staff) });
  } catch (error) {
    console.error("GET /api/staff/[id] error:", error);
    return NextResponse.json({ success: false, message: "Unable to load staff member." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const current = await getAuthenticatedStaff(request);
    if (!current) return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    if (!isAdmin(current.role)) return NextResponse.json({ success: false, message: "Administrator access required." }, { status: 403 });

    const id = await getId(context);
    if (!id) return NextResponse.json({ success: false, message: "Invalid staff ID." }, { status: 400 });

    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, message: "Staff member not found." }, { status: 404 });

    const body = await request.json();
    const data: {
      name?: string;
      role?: string;
      mobile?: string | null;
      address?: string | null;
      joiningDate?: Date | null;
      username?: string | null;
      loginEnabled?: boolean;
      isActive?: boolean;
    } = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) return NextResponse.json({ success: false, message: "Name cannot be empty." }, { status: 400 });
      data.name = name;
    }

    if (body.role !== undefined) {
      const role = String(body.role).trim();
      if (!role) return NextResponse.json({ success: false, message: "Role cannot be empty." }, { status: 400 });
      data.role = role;
    }

    if (body.mobile !== undefined) data.mobile = body.mobile ? String(body.mobile).trim() : null;
    if (body.address !== undefined) data.address = body.address ? String(body.address).trim() : null;
    if (body.joiningDate !== undefined) data.joiningDate = body.joiningDate ? new Date(body.joiningDate) : null;
    if (body.loginEnabled !== undefined) data.loginEnabled = Boolean(body.loginEnabled);
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    if (body.username !== undefined) {
      const username = body.username ? String(body.username).trim() : null;

      if (username) {
        const duplicate = await prisma.staff.findFirst({
          where: {
            username,
            NOT: { id },
          },
        });
        if (duplicate) {
          return NextResponse.json({ success: false, message: "Username is already in use." }, { status: 409 });
        }
      }

      data.username = username;
    }

    if (data.loginEnabled === true && !(data.username ?? existing.username)) {
      return NextResponse.json({ success: false, message: "A username is required when login is enabled." }, { status: 400 });
    }

    const updated = await prisma.staff.update({
      where: { id },
      data,
    });

    if (data.isActive === false || data.loginEnabled === false) {
      await prisma.staffSession.deleteMany({ where: { staffId: id } });
    }

    return NextResponse.json({ success: true, staff: serializeStaff(updated) });
  } catch (error) {
    console.error("PATCH /api/staff/[id] error:", error);
    return NextResponse.json({ success: false, message: "Unable to update staff member." }, { status: 500 });
  }
}
