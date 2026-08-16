import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function getScheduleFromFrequency(frequency: unknown) {
  const value = String(frequency ?? "").trim();

  const match = value.match(
    /([01])\s*-\s*([01])\s*-\s*([01])/
  );

  if (!match) {
    return null;
  }

  return {
    morning: match[1] === "1",
    afternoon: match[2] === "1",
    night: match[3] === "1",
  };
}

function getBoolean(
  value: unknown,
  fallback = false
) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true" || value === "1") {
    return true;
  }

  if (value === "false" || value === "0") {
    return false;
  }

  return fallback;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const opdVisitId = Number(body.opdVisitId);

    if (!opdVisitId || isNaN(opdVisitId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OPD Visit.",
        },
        { status: 400 }
      );
    }

    const visit = await prisma.opdVisit.findUnique({
      where: {
        id: opdVisitId,
      },
    });

    if (!visit) {
      return NextResponse.json(
        {
          success: false,
          message: "OPD Visit not found.",
        },
        { status: 404 }
      );
    }

    const items = Array.isArray(body.items)
      ? body.items
          .map((m: any) => {
            const frequency = String(
              m.frequency ?? ""
            ).trim();

            /*
             * If frequency contains a schedule such as:
             *
             * 1-0-0
             * 0-1-0
             * 0-0-1
             * 1-0-1
             * 1-1-0
             * 0-1-1
             * 1-1-1
             *
             * THIS becomes the source of truth.
             */

            const schedule =
              getScheduleFromFrequency(
                frequency
              );

            let morning: boolean;
            let afternoon: boolean;
            let night: boolean;

            if (schedule) {
              /*
               * IMPORTANT:
               *
               * Frequency is authoritative.
               *
               * This prevents stale false values from
               * the checkbox state from overwriting the
               * selected frequency.
               */

              morning = schedule.morning;
              afternoon = schedule.afternoon;
              night = schedule.night;
            } else {
              /*
               * If frequency does not contain a
               * 1-0-0 style schedule, fall back to
               * the actual boolean values.
               */

              morning = getBoolean(
                m.morning,
                false
              );

              afternoon = getBoolean(
                m.afternoon,
                false
              );

              night = getBoolean(
                m.night,
                false
              );
            }

            return {
              medicineName: String(
                m.medicineName ??
                  m.brandName ??
                  m.genericName ??
                  ""
              ).trim(),

              strength: String(
                m.strength ?? ""
              ).trim(),

              dosage: String(
                m.dosage ?? ""
              ).trim(),

              frequency,

              duration: String(
                m.duration ?? ""
              ).trim(),

              instruction: String(
                m.instruction ?? ""
              ).trim(),

              morning,
              afternoon,
              night,

              beforeFood: getBoolean(
                m.beforeFood,
                false
              ),

              afterFood: getBoolean(
                m.afterFood,
                false
              ),

              sos: getBoolean(
                m.sos,
                false
              ),

              quantity:
                m.quantity === "" ||
                m.quantity === null ||
                m.quantity === undefined
                  ? null
                  : Number(m.quantity),

              route: String(
                m.route ?? ""
              ).trim(),
            };
          })
          .filter(
            (m: any) =>
              m.medicineName.length > 0
          )
      : [];

    if (items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select at least one medicine before saving.",
        },
        { status: 400 }
      );
    }

    const existingPrescription =
      await prisma.prescription.findUnique({
        where: {
          opdVisitId,
        },
      });

    let prescription;

    if (existingPrescription) {
      /*
       * Remove old medicine items.
       */

      await prisma.prescriptionItem.deleteMany({
        where: {
          prescriptionId:
            existingPrescription.id,
        },
      });

      /*
       * Save the updated prescription.
       */

      prescription =
        await prisma.prescription.update({
          where: {
            id: existingPrescription.id,
          },

          data: {
            notes: String(
              body.notes ?? ""
            ).trim(),

            investigations: String(
              body.investigations ?? ""
            ).trim(),

            items: {
              create: items,
            },
          },

          include: {
            opdVisit: {
              include: {
                patient: true,
              },
            },

            items: {
              orderBy: {
                id: "asc",
              },
            },
          },
        });
    } else {
      /*
       * Create new prescription.
       */

      prescription =
        await prisma.prescription.create({
          data: {
            opdVisitId,

            notes: String(
              body.notes ?? ""
            ).trim(),

            investigations: String(
              body.investigations ?? ""
            ).trim(),

            items: {
              create: items,
            },
          },

          include: {
            opdVisit: {
              include: {
                patient: true,
              },
            },

            items: {
              orderBy: {
                id: "asc",
              },
            },
          },
        });
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Prescription saved successfully.",
        prescription,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "PRESCRIPTION SAVE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to save prescription.",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const opdVisitId = Number(
      searchParams.get("opdVisitId")
    );

    if (!opdVisitId || isNaN(opdVisitId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OPD Visit.",
        },
        { status: 400 }
      );
    }

    const prescription =
      await prisma.prescription.findUnique({
        where: {
          opdVisitId,
        },

        include: {
          opdVisit: {
            include: {
              patient: true,
            },
          },

          items: {
            orderBy: {
              id: "asc",
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error(
      "PRESCRIPTION LOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load prescription.",
      },
      { status: 500 }
    );
  }
}