import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/app/lib/prisma";

const PROTECTED_PATHS = [
  "/staff",
  "/staff-dashboard",
  "/attendance",
  "/api/staff",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function isApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

async function hasValidStaffSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("staff_session")?.value;
  if (!token) return false;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const session = await prisma.staffSession.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      expiresAt: true,
      staff: {
        select: {
          isActive: true,
          loginEnabled: true,
        },
      },
    },
  });

  if (!session) return false;
  if (session.expiresAt.getTime() <= Date.now()) return false;
  if (!session.staff.isActive || !session.staff.loginEnabled) return false;

  return true;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // Login must remain publicly accessible so a user can establish a session.
  if (pathname === "/staff/login" || pathname === "/api/staff/login") {
    return NextResponse.next();
  }

  try {
    const authenticated = await hasValidStaffSession(request);

    if (authenticated) {
      return NextResponse.next();
    }

    if (isApiPath(pathname)) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/staff/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error("STAFF PROXY AUTH ERROR:", error);

    if (isApiPath(pathname)) {
      return NextResponse.json(
        { success: false, message: "Unable to verify staff session." },
        { status: 500 }
      );
    }

    return NextResponse.redirect(new URL("/staff/login", request.url));
  }
}

export const config = {
  matcher: [
    "/staff/:path*",
    "/staff-dashboard/:path*",
    "/attendance/:path*",
    "/api/staff/:path*",
  ],
};
