import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type Params = Promise<{
  patientId: string;
}>;

// =========================
// GET PATIENT
// =========================

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { patientId } = await params;

    const patient = await prisma.patient.findUnique({
      where: {
        patientId,
      },
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load patient",
      },
      {
        status: 500,
      }
    );
  }
}

// =========================
// UPDATE PATIENT
// =========================

export async function PUT(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { patientId } = await params;

    const body = await request.json();

    const patient = await prisma.patient.update({
      where: {
        patientId,
      },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        age: Number(body.age),
        gender: body.gender,
        mobile: body.mobile,
        address: body.address,
        bloodGroup: body.bloodGroup,
        aadhaar: body.aadhaar,
        occupation: body.occupation,
      },
    });

    return NextResponse.json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update patient",
      },
      {
        status: 500,
      }
    );
  }
}

// =========================
// RESTORE PATIENT
// =========================

export async function PATCH(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { patientId } = await params;

    const patient = await prisma.patient.update({
      where: {
        patientId,
      },
      data: {
        isActive: true,
        archivedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      patient,
      message: "Patient restored successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to restore patient.",
      },
      {
        status: 500,
      }
    );
  }
}

// =========================
// ARCHIVE / DELETE PATIENT
// =========================

export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { patientId } = await params;

    const patient = await prisma.patient.findUnique({
      where: {
        patientId,
      },
      include: {
        visits: {
          select: {
            id: true,
          },
        },
        labOrders: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found.",
        },
        {
          status: 404,
        }
      );
    }

    // Archive patients having medical records
    if (patient.visits.length > 0 || patient.labOrders.length > 0) {
      await prisma.patient.update({
        where: {
          patientId,
        },
        data: {
          isActive: false,
          archivedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        archived: true,
        message:
          "Patient has medical records and has been archived successfully.",
      });
    }

    // Permanently delete patients without records
    await prisma.patient.delete({
      where: {
        patientId,
      },
    });

    return NextResponse.json({
      success: true,
      archived: false,
      message: "Patient deleted successfully.",
    });
  } catch (error) {
    console.error("PATIENT DELETE/ARCHIVE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to archive/delete patient.",
      },
      {
        status: 500,
      }
    );
  }
}