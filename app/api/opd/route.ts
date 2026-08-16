import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const followUpFromId =
      body.followUpFromId != null &&
      body.followUpFromId !== ""
        ? Number(body.followUpFromId)
        : null;

    // --------------------------------
    // Validate Patient
    // --------------------------------

    if (!body.patientId) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient ID is required.",
        },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: {
        patientId: body.patientId,
      },
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------
    // Create OPD Visit
    // --------------------------------

    const opdNo = `OPD${Date.now()}`;

    const visit = await prisma.opdVisit.create({
      data: {
        opdNo,

        patientId: patient.id,

        doctor:
          body.doctor ||
          "Dr. Rahul Kumar",

        department:
          body.department ||
          "General Medicine",

        // --------------------------------
        // History
        // --------------------------------

        complaint:
          body.complaint || null,

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

        // --------------------------------
        // Examination
        // --------------------------------

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

        // --------------------------------
        // Diagnosis
        // --------------------------------

        diagnosis:
          body.diagnosis || null,

        advice:
          body.advice || null,

        // --------------------------------
        // Vitals
        // --------------------------------

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

        // --------------------------------
        // Billing
        // --------------------------------

        fee:
          body.fee !== "" &&
          body.fee != null
            ? Number(body.fee)
            : null,

        paymentMode:
          body.paymentMode ||
          "Cash",

        // --------------------------------
        // Follow-up
        // --------------------------------

        followUpDate:
          body.followUpDate
            ? new Date(body.followUpDate)
            : null,

        followUpFromId,
      },
    });

    // --------------------------------
    // IMPORTANT:
    // Prescription is NOT saved here.
    //
    // It is saved separately by:
    // POST /api/prescriptions
    //
    // This prevents duplicate prescription
    // creation/update.
    // --------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          "OPD Visit saved successfully.",

        visitId: visit.id,

        opdNo: visit.opdNo,

        visit,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "OPD CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}