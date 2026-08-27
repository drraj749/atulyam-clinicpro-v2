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

    const notes =
      await prisma.ipdClinicalNote.findMany({
        where: {
          admissionId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error(
      "IPD CLINICAL NOTES GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load clinical notes.",
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

    const noteType = String(
      body.noteType ?? "Progress"
    ).trim();

    const note = String(
      body.note ?? ""
    ).trim();

    const createdBy = String(
      body.createdBy ?? ""
    ).trim();

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Clinical note is required.",
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

    const clinicalNote =
      await prisma.ipdClinicalNote.create({
        data: {
          admissionId,
          noteType:
            noteType || "Progress",
          note,
          createdBy:
            createdBy || null,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Clinical note added successfully.",
        note: clinicalNote,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "IPD CLINICAL NOTES POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to add clinical note.",
      },
      {
        status: 500,
      }
    );
  }
}