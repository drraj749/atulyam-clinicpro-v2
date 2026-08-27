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

    if (!Number.isInteger(admissionId) || admissionId <= 0) {
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

    const admission = await prisma.ipdAdmission.findUnique({
      where: {
        id: admissionId,
      },
      select: {
        id: true,
        ipdNo: true,
        patientId: true,
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            age: true,
            gender: true,
            mobile: true,
          },
        },
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

    const charges = await prisma.ipdCharge.findMany({
      where: {
        admissionId,
      },
      orderBy: {
        chargeDate: "desc",
      },
    });

    const payments = await prisma.ipdPayment.findMany({
      where: {
        admissionId,
      },
      orderBy: {
        paidAt: "desc",
      },
    });

    const totalCharges = charges.reduce(
      (sum, charge) => {
        return sum + Number(charge.total || 0);
      },
      0
    );

    const totalPayments = payments.reduce(
      (sum, payment) => {
        return sum + Number(payment.amount || 0);
      },
      0
    );

    const balance = totalCharges - totalPayments;

    return NextResponse.json({
      success: true,
      admission,
      charges,
      payments,
      summary: {
        totalCharges,
        totalPayments,
        balance,
      },
    });
  } catch (error) {
    console.error("IPD BILLING GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load billing details.",
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

    if (!Number.isInteger(admissionId) || admissionId <= 0) {
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

    const category = String(
      body.category ?? ""
    ).trim();

    const description = String(
      body.description ?? ""
    ).trim();

    const quantity = Number(
      body.quantity ?? 1
    );

    const unitPrice = Number(
      body.unitPrice ?? 0
    );

    const createdBy = String(
      body.createdBy ?? ""
    ).trim();

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Charge category is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          success: false,
          message: "Charge description is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be greater than zero.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unit price must be zero or greater.",
        },
        {
          status: 400,
        }
      );
    }

    const admission = await prisma.ipdAdmission.findUnique({
      where: {
        id: admissionId,
      },
      select: {
        id: true,
        patientId: true,
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

    const total = quantity * unitPrice;

    const charge = await prisma.ipdCharge.create({
      data: {
        admissionId,
        patientId: admission.patientId,
        category,
        description,
        quantity,
        unitPrice,
        total,
        createdBy: createdBy || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "IPD charge added successfully.",
        charge,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("IPD BILLING POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to add IPD charge.",
      },
      {
        status: 500,
      }
    );
  }
}