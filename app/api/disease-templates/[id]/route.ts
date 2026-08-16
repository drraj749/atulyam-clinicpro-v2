import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type Params = Promise<{
  id: string;
}>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    const template = await prisma.diseaseTemplate.findUnique({
      where: {
        id: Number(id),
      },

      include: {
        medicines: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          message: "Template not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load template.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    await prisma.diseaseTemplateMedicine.deleteMany({
      where: {
        templateId: Number(id),
      },
    });

    const template = await prisma.diseaseTemplate.update({
      where: {
        id: Number(id),
      },

      data: {
        name: body.name,
        category: body.category,
        investigations: body.investigations,
        advice: body.advice,
        notes: body.notes,

        medicines: {
          create: Array.isArray(body.medicines)
            ? body.medicines.map((m: any) => ({
                medicineName: m.medicineName,
                strength: m.strength,
                dosage: m.dosage,
                frequency: m.frequency,
                duration: m.duration,
                instruction: m.instruction,
                morning: m.morning,
                afternoon: m.afternoon,
                night: m.night,
                beforeFood: m.beforeFood,
                afterFood: m.afterFood,
                sos: m.sos,
                quantity: m.quantity,
                route: m.route,
              }))
            : [],
        },
      },

      include: {
        medicines: true,
      },
    });

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update template.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    await prisma.diseaseTemplate.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete template.",
      },
      {
        status: 500,
      }
    );
  }
}