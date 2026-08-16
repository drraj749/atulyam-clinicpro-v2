import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams
      .get("search")
      ?.trim();

    const staff = await prisma.staff.findMany({
      where: {
        isActive: true,

        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                  },
                },
                {
                  staffCode: {
                    contains: search,
                  },
                },
                {
                  role: {
                    contains: search,
                  },
                },
                {
                  mobile: {
                    contains: search,
                  },
                },
              ],
            }
          : {}),
      },

      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      staff,
    });
  } catch (error) {
    console.error(
      "STAFF GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch staff.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const name = String(
      body.name ?? ""
    ).trim();

    const role = String(
      body.role ?? ""
    ).trim();

    const username = String(
      body.username ?? ""
    ).trim().toLowerCase();

    const password = String(
      body.password ?? ""
    );

    const loginEnabled =
      body.loginEnabled === undefined
        ? true
        : Boolean(body.loginEnabled);

    // -----------------------------
    // BASIC VALIDATION
    // -----------------------------

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Staff name is required.",
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
          message:
            "Staff role is required.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // LOGIN VALIDATION
    // -----------------------------

    if (loginEnabled) {
      if (!username) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Username is required when login is enabled.",
          },
          {
            status: 400,
          }
        );
      }

      if (password.length < 4) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Password must be at least 4 characters.",
          },
          {
            status: 400,
          }
        );
      }

      const existingUsername =
        await prisma.staff.findUnique({
          where: {
            username,
          },
        });

      if (existingUsername) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Username already exists.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // -----------------------------
    // STAFF CODE
    // -----------------------------

    const staffCode =
      String(
        body.staffCode ?? ""
      ).trim() ||
      `STF${Date.now()}`;

    const existingStaff =
      await prisma.staff.findUnique({
        where: {
          staffCode,
        },
      });

    if (existingStaff) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Staff code already exists.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // JOINING DATE
    // -----------------------------

    let joiningDate:
      | Date
      | null = null;

    if (body.joiningDate) {
      const parsedDate = new Date(
        body.joiningDate
      );

      if (
        !isNaN(
          parsedDate.getTime()
        )
      ) {
        joiningDate = parsedDate;
      }
    }

    // -----------------------------
    // PASSWORD HASH
    // -----------------------------

    let passwordHash:
      | string
      | null = null;

    if (loginEnabled) {
      passwordHash =
        await bcrypt.hash(
          password,
          12
        );
    }

    // -----------------------------
    // CREATE STAFF
    // -----------------------------

    const staff =
      await prisma.staff.create({
        data: {
          staffCode,

          name,

          role,

          mobile:
            String(
              body.mobile ?? ""
            ).trim() || null,

          address:
            String(
              body.address ?? ""
            ).trim() || null,

          joiningDate,

          isActive:
            body.isActive === undefined
              ? true
              : Boolean(
                  body.isActive
                ),

          username:
            loginEnabled
              ? username
              : null,

          passwordHash,

          loginEnabled,
        },
      });

    return NextResponse.json(
      {
        success: true,

        message:
          "Staff created successfully.",

        staff,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error(
      "STAFF CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to save staff.",
      },
      {
        status: 500,
      }
    );
  }
}