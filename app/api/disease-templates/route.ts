import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const templates = await prisma.diseaseTemplate.findMany({
      include: {
        medicines: {
          orderBy: {
            id: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load templates.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Template name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const medicines = Array.isArray(body.medicines)
      ? body.medicines
          .filter((m: any) => String(m.medicineName ?? "").trim() !== "")
          .map((m: any) => ({
            medicineName: String(m.medicineName ?? "").trim(),

            strength: String(m.strength ?? "").trim(),

            dosage: String(m.dosage ?? "").trim(),

            frequency: String(m.frequency ?? "").trim(),

            duration: String(m.duration ?? "").trim(),

            instruction: String(m.instruction ?? "").trim(),

            morning: Boolean(m.morning),
            afternoon: Boolean(m.afternoon),
            night: Boolean(m.night),

            beforeFood: Boolean(m.beforeFood),
            afterFood: Boolean(m.afterFood),

            sos: Boolean(m.sos),

            quantity:
              m.quantity === null ||
              m.quantity === undefined ||
              m.quantity === ""
                ? null
                : Number(m.quantity),

            route: String(m.route ?? "").trim(),
          }))
      : [];

    const template = await prisma.diseaseTemplate.create({
      data: {
        name,

        category: String(body.category ?? "").trim(),

        investigations: String(body.investigations ?? "").trim(),

        advice: String(body.advice ?? "").trim(),

        notes: String(body.notes ?? "").trim(),

        medicines: {
          create: medicines,
        },
      },

      include: {
        medicines: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error: any) {
    console.error(error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "Template name already exists.",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save template.",
      },
      {
        status: 500,
      }
    );
  }
}