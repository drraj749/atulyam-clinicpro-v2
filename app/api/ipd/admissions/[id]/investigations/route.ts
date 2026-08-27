import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const admissionId = Number(id);

    if (
      !Number.isInteger(admissionId) ||
      admissionId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid admission ID.",
        },
        {
          status: 400,
        }
      );
    }

    const admission =
      await prisma.ipdAdmission.findUnique({
        where: {
          id: admissionId,
        },
        select: {
          id: true,
        },
      });

    if (!admission) {
      return NextResponse.json(
        {
          success: false,
          message: "IPD admission not found.",
        },
        {
          status: 404,
        }
      );
    }

    const investigations =
      await prisma.ipdInvestigation.findMany({
        where: {
          admissionId,
        },
        orderBy: {
          orderedAt: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      investigations,
    });
  } catch (error) {
    console.error(
      "IPD INVESTIGATIONS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load investigations.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const admissionId = Number(id);

    if (
      !Number.isInteger(admissionId) ||
      admissionId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid admission ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const testName = String(
      body.testName ?? ""
    ).trim();

    const testCode = String(
      body.testCode ?? ""
    ).trim();

    const category = String(
      body.category ?? ""
    ).trim();

    const status = String(
      body.status ?? "Ordered"
    ).trim();

    const result = String(
      body.result ?? ""
    ).trim();

    const remarks = String(
      body.remarks ?? ""
    ).trim();

    const orderedBy = String(
      body.orderedBy ?? ""
    ).trim();

    if (!testName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Investigation test name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const admission =
      await prisma.ipdAdmission.findUnique({
        where: {
          id: admissionId,
        },
        select: {
          id: true,
        },
      });

    if (!admission) {
      return NextResponse.json(
        {
          success: false,
          message: "IPD admission not found.",
        },
        {
          status: 404,
        }
      );
    }

    const investigation =
      await prisma.ipdInvestigation.create({
        data: {
          admissionId,

          testName,

          testCode:
            testCode || null,

          category:
            category || null,

          status:
            status || "Ordered",

          result:
            result || null,

          remarks:
            remarks || null,

          orderedBy:
            orderedBy || null,

          reportedAt:
            result ? new Date() : null,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Investigation added successfully.",
        investigation,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "IPD INVESTIGATIONS POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to add investigation.",
      },
      {
        status: 500,
      }
    );
  }
}