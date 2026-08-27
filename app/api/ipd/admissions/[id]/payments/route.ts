import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function generateReceiptNo() {
  const now = new Date();

  const year = String(now.getFullYear()).slice(-2);

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  const time = String(
    now.getTime()
  ).slice(-6);

  return `IPDR${year}${month}${day}${time}`;
}

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

    const payments = await prisma.ipdPayment.findMany({
      where: {
        admissionId,
      },
      orderBy: {
        paidAt: "desc",
      },
    });

    const totalPayments = payments.reduce(
      (sum, payment) =>
        sum + Number(payment.amount || 0),
      0
    );

    return NextResponse.json({
      success: true,
      payments,
      totalPayments,
    });
  } catch (error) {
    console.error("IPD PAYMENTS GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load payments.",
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

    const amount = Number(
      body.amount ?? 0
    );

    const paymentMode = String(
      body.paymentMode ?? ""
    ).trim();

    const remarks = String(
      body.remarks ?? ""
    ).trim();

    const receivedBy = String(
      body.receivedBy ?? ""
    ).trim();

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment amount must be greater than zero.",
        },
        {
          status: 400,
        }
      );
    }

    if (!paymentMode) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment mode is required.",
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

    let receiptNo = generateReceiptNo();

    const existingReceipt =
      await prisma.ipdPayment.findUnique({
        where: {
          receiptNo,
        },
        select: {
          id: true,
        },
      });

    if (existingReceipt) {
      receiptNo = `${receiptNo}${Math.floor(
        Math.random() * 1000
      )}`;
    }

    const payment =
      await prisma.ipdPayment.create({
        data: {
          admissionId,
          patientId: admission.patientId,
          receiptNo,
          amount,
          paymentMode,
          remarks: remarks || null,
          receivedBy: receivedBy || null,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: "Payment received successfully.",
        payment,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("IPD PAYMENTS POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to record payment.",
      },
      {
        status: 500,
      }
    );
  }
}