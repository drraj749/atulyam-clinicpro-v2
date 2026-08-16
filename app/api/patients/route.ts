import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";

function generateUHID() {
  const d = new Date();

  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  const random = Math.floor(1000 + Math.random() * 9000);

  return `ATH${y}${m}${day}${random}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status") ?? "active";

    const where: Prisma.PatientWhereInput = {};

    if (status === "active") {
      where.isActive = true;
    } else if (status === "archived") {
      where.isActive = false;
    }

    const patients = await prisma.patient.findMany({
      where,
      include: {
        visits: {
          select: {
            id: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      patients,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load patients",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const patient = await prisma.patient.create({
      data: {
        patientId: generateUHID(),
        firstName: body.firstName,
        lastName: body.lastName,
        age: Number(body.age),
        gender: body.gender,
        mobile: body.mobile,
        address: body.address || "",
        bloodGroup: body.bloodGroup || "",
        aadhaar: body.aadhaar || "",
        occupation: body.occupation || "",
        isActive: true,
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
        message: "Unable to save patient",
      },
      {
        status: 500,
      }
    );
  }
}