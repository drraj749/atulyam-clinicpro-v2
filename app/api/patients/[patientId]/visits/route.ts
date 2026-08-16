import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type Params = Promise<{
  patientId: string;
}>;

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

    const visits = await prisma.opdVisit.findMany({
      where: {
        patientId: patient.id,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        prescription: {
          include: {
            items: true,
          },
        },
      },
    });

    const formattedVisits = (visits as any[]).map((visit) => ({
      ...visit,
      isFollowUp: visit.followUpFromId !== null,
    }));

    return NextResponse.json({
      success: true,
      visits: formattedVisits,
    });
  } catch (error) {
    console.error("VISITS API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load visit history",
      },
      {
        status: 500,
      }
    );
  }
}