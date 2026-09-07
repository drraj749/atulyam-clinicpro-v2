import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;
    const medicineId = Number(id);

    if (!Number.isInteger(medicineId) || medicineId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid medicine ID." },
        { status: 400 }
      );
    }

    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
    });

    if (!medicine) {
      return NextResponse.json(
        { success: false, message: "Medicine not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, medicine });
  } catch (error) {
    console.error("MEDICINE GET BY ID ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;
    const medicineId = Number(id);
    const body = await request.json();

    if (!Number.isInteger(medicineId) || medicineId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid medicine ID." },
        { status: 400 }
      );
    }

    const genericName = String(body.genericName ?? "").trim();
    const brandName = String(body.brandName ?? "").trim();

    if (!genericName) {
      return NextResponse.json(
        { success: false, message: "Generic Name is required." },
        { status: 400 }
      );
    }

    if (brandName) {
      const existingBrand = await prisma.medicine.findFirst({
        where: {
          isActive: true,
          brandName: { equals: brandName, mode: "insensitive" },
          NOT: { id: medicineId },
        },
        select: {
          id: true,
          brandName: true,
          genericName: true,
          strength: true,
        },
      });

      if (existingBrand) {
        return NextResponse.json(
          {
            success: false,
            message: `Brand name “${existingBrand.brandName}” already exists in Medicine Master. Please search for the existing medicine instead of creating a duplicate.`,
            existingMedicine: existingBrand,
          },
          { status: 409 }
        );
      }
    }

    const medicine = await prisma.medicine.update({
      where: { id: medicineId },
      data: {
        medicineCode: String(body.medicineCode ?? "").trim(),
        genericName,
        brandName: brandName || null,
        strength: String(body.strength ?? "").trim() || null,
        dosageForm: String(body.dosageForm ?? "").trim() || null,
        route: String(body.route ?? "").trim() || null,
        manufacturer: String(body.manufacturer ?? "").trim() || null,
        isActive: body.isActive === undefined ? true : Boolean(body.isActive),
      },
    });

    return NextResponse.json({ success: true, medicine });
  } catch (error) {
    console.error("MEDICINE PUT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update medicine." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;
    const medicineId = Number(id);

    if (!Number.isInteger(medicineId) || medicineId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid medicine ID." },
        { status: 400 }
      );
    }

    await prisma.medicine.delete({
      where: { id: medicineId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("MEDICINE DELETE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to delete medicine." },
      { status: 500 }
    );
  }
}
