import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import type { MedicineRow } from "@/types/opd";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const visitId = Number(id);

    if (isNaN(visitId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Visit ID.",
        },
        {
          status: 400,
        }
      );
    }

    const visit = await prisma.opdVisit.findUnique({
      where: {
        id: visitId,
      },

      include: {
        patient: true,

        prescription: {
          include: {
            items: {
              orderBy: {
                id: "asc",
              },
            },
          },
        },
      },
    });

    if (!visit) {
      return NextResponse.json(
        {
          success: false,
          message: "OPD Visit not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      visit,
    });

  } catch (error) {

    console.error("LOAD OPD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );

  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const visitId = Number(id);

    if (isNaN(visitId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Visit ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();
    if (!body.complaint?.trim()) {
  return NextResponse.json(
    {
      success: false,
      message: "Chief Complaint is required.",
    },
    { status: 400 }
  );
}

if (!body.diagnosis?.trim()) {
  return NextResponse.json(
    {
      success: false,
      message: "Diagnosis is required.",
    },
    { status: 400 }
  );
}

    const existingVisit = await prisma.opdVisit.findUnique({
      where: {
        id: visitId,
      },
      include: {
        prescription: true,
      },
    });

    if (!existingVisit) {
      return NextResponse.json(
        {
          success: false,
          message: "OPD Visit not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.$transaction(async (tx) => {

      await tx.opdVisit.update({
        where: {
          id: visitId,
        },

        data: {

          doctor: body.doctor || "Consultant",

          department:
            body.department || "General Medicine",

          complaint: body.complaint?.trim() || null,

          historyOfPresentIllness:
            body.historyOfPresentIllness || null,

          pastHistory:
            body.pastHistory || null,

          drugHistory:
            body.drugHistory || null,

          familyHistory:
            body.familyHistory || null,

          personalHistory:
            body.personalHistory || null,

          allergy:
            body.allergy || null,

          examination:
            body.examination || null,

          generalExamination:
            body.generalExamination || null,

          cvs:
            body.cvs || null,

          rs:
            body.rs || null,

          cns:
            body.cns || null,

          pa:
            body.pa || null,

          localExamination:
            body.localExamination || null,

          diagnosis:
  body.diagnosis?.trim() || null,

          advice:
  body.advice?.trim() || null,

          bp:
            body.bp || null,

          pulse:
            body.pulse !== "" &&
            body.pulse != null
              ? Number(body.pulse)
              : null,

          respiratoryRate:
            body.respiratoryRate !== "" &&
            body.respiratoryRate != null
              ? Number(body.respiratoryRate)
              : null,

          temperature:
            body.temperature !== "" &&
            body.temperature != null
              ? Number(body.temperature)
              : null,

          spo2:
            body.spo2 !== "" &&
            body.spo2 != null
              ? Number(body.spo2)
              : null,

          height:
            body.height !== "" &&
            body.height != null
              ? Number(body.height)
              : null,

          weight:
            body.weight !== "" &&
            body.weight != null
              ? Number(body.weight)
              : null,

          bmi:
            body.bmi !== "" &&
            body.bmi != null
              ? Number(body.bmi)
              : null,

          randomBloodSugar:
            body.randomBloodSugar !== "" &&
            body.randomBloodSugar != null
              ? Number(body.randomBloodSugar)
              : null,

          painScore:
            body.painScore !== "" &&
            body.painScore != null
              ? Number(body.painScore)
              : null,

          fee:
            body.fee !== "" &&
            body.fee != null
              ? Number(body.fee)
              : null,

          paymentMode:
            body.paymentMode || "Cash",

          followUpDate:
            body.followUpDate
              ? new Date(body.followUpDate)
              : null,
        },
      });
            if (existingVisit.prescription) {
              const hasPrescription = Boolean(
  body.investigations?.trim() ||
    body.prescriptionNotes?.trim() ||
    (body.medicines || []).some(
      (m: MedicineRow) => m.medicineName.trim()
    )
);

if (!hasPrescription) {
  await tx.prescription.delete({
    where: {
      id: existingVisit.prescription.id,
    },
  });

  return;
}

        await tx.prescriptionItem.deleteMany({
          where: {
            prescriptionId: existingVisit.prescription.id,
          },
        });

        await tx.prescription.update({
          where: {
            id: existingVisit.prescription.id,
          },

          data: {

            investigations:
  body.investigations?.trim() || null,

notes:
  body.prescriptionNotes?.trim() || null,

            items: {
              create: (body.medicines || [])
  .filter(
    (medicine: MedicineRow) =>
      medicine.medicineName.trim()
  )
  .map((medicine: MedicineRow) => ({
                  medicineName:
                    medicine.medicineName || "",

                  strength:
                    medicine.strength || null,

                  dosage:
                    medicine.dosage || null,

                  frequency:
                    medicine.frequency || null,

                  duration:
                    medicine.duration || null,

                  instruction:
                    medicine.instruction || null,

                  morning:
                    medicine.morning ?? false,

                  afternoon:
                    medicine.afternoon ?? false,

                  night:
                    medicine.night ?? false,

                  beforeFood:
                    medicine.beforeFood ?? false,

                  afterFood:
                    medicine.afterFood ?? false,

                  sos:
                    medicine.sos ?? false,

                  quantity:
                    medicine.quantity !== "" &&
                    medicine.quantity != null
                      ? Number(medicine.quantity)
                      : null,

                  route:
                    medicine.route || null,
                })
              ),
            },
          },
        });

      } else if (
        body.investigations ||
        body.prescriptionNotes ||
        (body.medicines &&
          body.medicines.length > 0)
      ) {

        await tx.prescription.create({
          data: {

            opdVisitId: visitId,

            investigations:
  body.investigations?.trim() || null,

notes:
  body.prescriptionNotes?.trim() || null,

            items: {
              create: (body.medicines || [])
  .filter(
    (medicine: MedicineRow) =>
      medicine.medicineName.trim()
  )
  .map((medicine: MedicineRow) => ({
                  medicineName:
                    medicine.medicineName || "",

                  strength:
                    medicine.strength || null,

                  dosage:
                    medicine.dosage || null,

                  frequency:
                    medicine.frequency || null,

                  duration:
                    medicine.duration || null,

                  instruction:
                    medicine.instruction || null,

                  morning:
                    medicine.morning ?? false,

                  afternoon:
                    medicine.afternoon ?? false,

                  night:
                    medicine.night ?? false,

                  beforeFood:
                    medicine.beforeFood ?? false,

                  afterFood:
                    medicine.afterFood ?? false,

                  sos:
                    medicine.sos ?? false,

                  quantity:
                    medicine.quantity !== "" &&
                    medicine.quantity != null
                      ? Number(medicine.quantity)
                      : null,

                  route:
                    medicine.route || null,
                })
              ),
            },
          },
        });

      }

    });

    return NextResponse.json({
      success: true,
      message: "OPD Visit updated successfully.",
    });

  } catch (error) {

    console.error("UPDATE OPD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );

  }
}