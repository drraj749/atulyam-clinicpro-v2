import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search")?.trim();

    const medicines = await prisma.medicine.findMany({
      where: {
        isActive: true,
        ...(search
          ? {
              OR: [
                { genericName: { contains: search, mode: "insensitive" } },
                { brandName: { contains: search, mode: "insensitive" } },
                { medicineCode: { contains: search, mode: "insensitive" } },
                { strength: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { genericName: "asc" },
      take: 2000,
    });

    return NextResponse.json({ success: true, medicines });
  } catch (error) {
    console.error("MEDICINE GET ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch medicines." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    const medicine = await prisma.medicine.create({
      data: {
        medicineCode:
          String(body.medicineCode ?? "").trim() || `MED${Date.now()}`,
        genericName,
        brandName: brandName || null,
        strength: String(body.strength ?? "").trim() || null,
        dosageForm: String(body.dosageForm ?? "").trim() || null,
        route: String(body.route ?? "").trim() || null,
        manufacturer: String(body.manufacturer ?? "").trim() || null,
        isActive: body.isActive === undefined ? true : Boolean(body.isActive),
      },
    });

    return NextResponse.json({ success: true, medicine }, { status: 201 });
  } catch (error) {
    console.error("MEDICINE POST ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to save medicine." },
      { status: 500 }
    );
  }
}
