import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

type AuthenticatedStaff = {
  id: number;
  staffCode: string;
  name: string;
  role: string;
  isActive: boolean;
  loginEnabled: boolean;
};

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function getAuthenticatedStaff(
  request: NextRequest
): Promise<AuthenticatedStaff | null> {
  try {
    const token = request.cookies.get("staff_session")?.value;

    if (!token) {
      return null;
    }

    const tokenHash = hashToken(token);

    const session = await prisma.staffSession.findUnique({
      where: {
        tokenHash,
      },
      include: {
        staff: true,
      },
    });

    if (!session) {
      return null;
    }

    if (session.expiresAt <= new Date()) {
      try {
        await prisma.staffSession.delete({
          where: {
            id: session.id,
          },
        });
      } catch {
        // Session may already have been removed.
      }

      return null;
    }

    if (!session.staff.isActive || !session.staff.loginEnabled) {
      return null;
    }

    return {
      id: session.staff.id,
      staffCode: session.staff.staffCode,
      name: session.staff.name,
      role: session.staff.role,
      isActive: session.staff.isActive,
      loginEnabled: session.staff.loginEnabled,
    };
  } catch (error) {
    console.error("STAFF AUTH ERROR:", error);
    return null;
  }
}

function isAdministrator(staff: AuthenticatedStaff | null) {
  if (!staff) {
    return false;
  }

  return (
    staff.role.trim().toLowerCase() === "administrator" ||
    staff.role.trim().toLowerCase() === "admin"
  );
}

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

function normalizeDate(value: unknown) {
  if (!value) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const date = new Date(`${trimmed}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/**
 * GET /api/staff
 *
 * Administrator only.
 *
 * Returns all staff records, including inactive staff.
 */
export async function GET(request: NextRequest) {
  try {
    const currentStaff = await getAuthenticatedStaff(request);

    if (!currentStaff) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    if (!isAdministrator(currentStaff)) {
      return NextResponse.json(
        {
          success: false,
          message: "Administrator access required.",
        },
        {
          status: 403,
        }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim().toLowerCase() || "all";

    const where: any = {};

    if (status === "active") {
      where.isActive = true;
    }

    if (status === "inactive") {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          staffCode: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          role: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          mobile: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          username: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const staff = await prisma.staff.findMany({
      where,
      orderBy: [
        {
          isActive: "desc",
        },
        {
          name: "asc",
        },
      ],
      select: {
        id: true,
        staffCode: true,
        name: true,
        role: true,
        mobile: true,
        address: true,
        joiningDate: true,
        isActive: true,
        username: true,
        loginEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      staff,
      total: staff.length,
    });
  } catch (error) {
    console.error("GET /api/staff ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load staff records.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST /api/staff
 *
 * Administrator only.
 *
 * Creates a new staff member.
 */
export async function POST(request: NextRequest) {
  try {
    const currentStaff = await getAuthenticatedStaff(request);

    if (!currentStaff) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    if (!isAdministrator(currentStaff)) {
      return NextResponse.json(
        {
          success: false,
          message: "Administrator access required.",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const role =
      typeof body.role === "string" ? body.role.trim() : "";

    const mobile = normalizeOptionalString(body.mobile);

    const address = normalizeOptionalString(body.address);

    const username = normalizeOptionalString(
      typeof body.username === "string"
        ? body.username.toLowerCase()
        : null
    );

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const joiningDate = normalizeDate(body.joiningDate);

    const isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : true;

    const loginEnabled =
      typeof body.loginEnabled === "boolean"
        ? body.loginEnabled
        : Boolean(username && password);

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff role is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (username) {
      const existingUsername = await prisma.staff.findUnique({
        where: {
          username,
        },
        select: {
          id: true,
        },
      });

      if (existingUsername) {
        return NextResponse.json(
          {
            success: false,
            message: "This username is already in use.",
          },
          {
            status: 409,
          }
        );
      }
    }

    if (loginEnabled && !username) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username is required when staff login is enabled.",
        },
        {
          status: 400,
        }
      );
    }

    if (loginEnabled && !password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password is required when staff login is enabled.",
        },
        {
          status: 400,
        }
      );
    }

    let passwordHash: string | null = null;

    if (password) {
      passwordHash = await bcrypt.hash(password, 12);
    }

    /**
     * Generate a unique staff code.
     *
     * Example:
     * STF1234567890
     */
    let staffCode = "";

    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate =
        `STF${Date.now()}${Math.floor(
          Math.random() * 1000
        )}`;

      const existingCode = await prisma.staff.findUnique({
        where: {
          staffCode: candidate,
        },
        select: {
          id: true,
        },
      });

      if (!existingCode) {
        staffCode = candidate;
        break;
      }
    }

    if (!staffCode) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to generate a unique staff code. Please try again.",
        },
        {
          status: 500,
        }
      );
    }

    const createdStaff = await prisma.staff.create({
      data: {
        staffCode,
        name,
        role,
        mobile,
        address,
        joiningDate,
        isActive,
        username,
        passwordHash,
        loginEnabled,
      },
      select: {
        id: true,
        staffCode: true,
        name: true,
        role: true,
        mobile: true,
        address: true,
        joiningDate: true,
        isActive: true,
        username: true,
        loginEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Staff member created successfully.",
        staff: createdStaff,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error("POST /api/staff ERROR:", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message:
            "A staff member with the same unique information already exists.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create staff member.",
      },
      {
        status: 500,
      }
    );
  }
}