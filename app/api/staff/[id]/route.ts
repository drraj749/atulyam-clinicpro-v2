import { NextRequest, NextResponse } from "next/server";
import {
  randomBytes,
  scryptSync,
} from "crypto";

import { prisma } from "@/app/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

function hashPassword(
  password: string
) {
  const salt =
    randomBytes(16).toString("hex");

  const hash =
    scryptSync(
      password,
      salt,
      64
    ).toString("hex");

  return `${salt}:${hash}`;
}

function sanitizeStaff(staff: any) {
  return {
    id: staff.id,
    staffCode: staff.staffCode,
    name: staff.name,
    role: staff.role,
    mobile: staff.mobile,
    address: staff.address,
    joiningDate: staff.joiningDate,
    isActive: staff.isActive,

    username: staff.username,

    loginEnabled:
      staff.loginEnabled,

    lastLoginAt:
      staff.lastLoginAt,
  };
}

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } =
      await params;

    const staff =
      await prisma.staff.findUnique({
        where: {
          id: Number(id),
        },
      });

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Staff member not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      staff:
        sanitizeStaff(staff),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } =
      await params;

    const staffId =
      Number(id);

    if (
      !Number.isInteger(
        staffId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid staff ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const name =
      String(
        body.name ?? ""
      ).trim();

    const role =
      String(
        body.role ?? ""
      ).trim();

    const staffCode =
      String(
        body.staffCode ?? ""
      ).trim();

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

    if (!staffCode) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Staff code is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existingStaff =
      await prisma.staff.findFirst({
        where: {
          staffCode,

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
            "Staff code already exists.",
        },
        {
          status: 400,
        }
      );
    }

    let joiningDate:
      Date | null = null;

    if (body.joiningDate) {
      const parsedDate =
        new Date(
          body.joiningDate
        );

      if (
        !isNaN(
          parsedDate.getTime()
        )
      ) {
        joiningDate =
          parsedDate;
      }
    }

    /*
     * LOGIN SETTINGS
     */

    let username:
      string | null =
      null;

    if (
      body.username !==
      undefined
    ) {
      const value =
        String(
          body.username ?? ""
        )
          .trim()
          .toLowerCase();

      username =
        value || null;
    }

    const loginEnabled =
      body.loginEnabled ===
      true;

    /*
     * Check username uniqueness
     */

    if (username) {
      const existingUsername =
        await prisma.staff.findFirst(
          {
            where: {
              username,

              NOT: {
                id: staffId,
              },
            },
          }
        );

      if (existingUsername) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Username already exists. Please choose another username.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
     * PASSWORD
     *
     * Only change password when
     * a new password is supplied.
     */

    const newPassword =
      String(
        body.password ?? ""
      );

    const confirmPassword =
      String(
        body.confirmPassword ?? ""
      );

    let passwordHash:
      string | undefined;

    if (newPassword) {
      if (
        newPassword.length <
        6
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Password must be at least 6 characters.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Password and Confirm Password do not match.",
          },
          {
            status: 400,
          }
        );
      }

      passwordHash =
        hashPassword(
          newPassword
        );
    }

    /*
     * Login cannot be enabled
     * without username + password.
     */

    if (loginEnabled) {
      const currentStaff =
        await prisma.staff.findUnique(
          {
            where: {
              id: staffId,
            },
          }
        );

      if (!currentStaff) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Staff member not found.",
          },
          {
            status: 404,
          }
        );
      }

      const finalUsername =
        username ??
        currentStaff.username;

      const finalPasswordHash =
        passwordHash ??
        currentStaff.passwordHash;

      if (!finalUsername) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Username is required to enable login.",
          },
          {
            status: 400,
          }
        );
      }

      if (!finalPasswordHash) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Please set a password before enabling login.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
     * Update staff
     */

    const staff =
      await prisma.staff.update({
        where: {
          id: staffId,
        },

        data: {
          staffCode,

          name,

          role,

          mobile:
            String(
              body.mobile ?? ""
            ).trim() ||
            null,

          address:
            String(
              body.address ?? ""
            ).trim() ||
            null,

          joiningDate,

          isActive:
            body.isActive ===
            undefined
              ? true
              : Boolean(
                  body.isActive
                ),

          username,

          loginEnabled,

          ...(passwordHash
            ? {
                passwordHash,
              }
            : {}),
        },
      });

    return NextResponse.json({
      success: true,
      staff:
        sanitizeStaff(staff),
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to update staff.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } =
      await params;

    const staffId =
      Number(id);

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
          message:
            "Staff member not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.staff.update({
      where: {
        id: staffId,
      },

      data: {
        isActive: false,

        loginEnabled: false,
      },
    });

    return NextResponse.json({
      success: true,

      message:
        "Staff member deactivated successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to deactivate staff.",
      },
      {
        status: 500,
      }
    );
  }
}