import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function generateIpdNo() {
  const now = new Date();

  const year = now
    .getFullYear()
    .toString()
    .slice(-2);

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `IPD${year}${month}${day}${random}`;
}

function generatePatientId() {
  const now = new Date();

  const year = now
    .getFullYear()
    .toString()
    .slice(-2);

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `ATH${year}${month}${day}${random}`;
}

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const status =
      searchParams.get("status");

    const where:
      | {
          status?: string;
        }
      | undefined =
      status === "active"
        ? {
            status: "Admitted",
          }
        : status === "discharged"
          ? {
              status: "Discharged",
            }
          : undefined;

    const admissions =
      await prisma.ipdAdmission.findMany({
        where,

        include: {
          patient: true,

          bed: {
            include: {
              ward: true,
            },
          },
        },

        orderBy: {
          admissionDate: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      admissions,
    });
  } catch (error) {
    console.error(
      "IPD ADMISSION GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load IPD admissions.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const patientId =
      body.patientId
        ? Number(body.patientId)
        : null;

    const bedId =
      Number(body.bedId);

    const admittingDoctor = String(
      body.admittingDoctor ?? ""
    ).trim();

    const department = String(
      body.department ?? ""
    ).trim();

    const chiefComplaint = String(
      body.chiefComplaint ?? ""
    ).trim();

    const provisionalDiagnosis = String(
      body.provisionalDiagnosis ?? ""
    ).trim();

    const admissionNotes = String(
      body.admissionNotes ?? ""
    ).trim();

    if (
      !Number.isInteger(bedId) ||
      bedId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select a valid bed.",
        },
        {
          status: 400,
        }
      );
    }

    if (!admittingDoctor) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admitting doctor is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Department is required.",
        },
        {
          status: 400,
        }
      );
    }

    const admission =
      await prisma.$transaction(
        async (tx) => {
          const currentBed =
            await tx.bed.findUnique({
              where: {
                id: bedId,
              },

              include: {
                ward: true,
              },
            });

          if (!currentBed) {
            throw new Error(
              "BED_NOT_FOUND"
            );
          }

          if (
            !currentBed.isActive
          ) {
            throw new Error(
              "BED_INACTIVE"
            );
          }

          if (
            currentBed.status !==
            "Available"
          ) {
            throw new Error(
              "BED_NOT_AVAILABLE"
            );
          }

          let finalPatientId: number;

          if (patientId) {
            const patient =
              await tx.patient.findUnique({
                where: {
                  id: patientId,
                },
              });

            if (!patient) {
              throw new Error(
                "PATIENT_NOT_FOUND"
              );
            }

            const activeAdmission =
              await tx.ipdAdmission.findFirst({
                where: {
                  patientId:
                    patient.id,

                  status:
                    "Admitted",
                },
              });

            if (activeAdmission) {
              throw new Error(
                "PATIENT_ALREADY_ADMITTED"
              );
            }

            finalPatientId =
              patient.id;
          } else {
            const firstName = String(
              body.firstName ?? ""
            ).trim();

            const lastName = String(
              body.lastName ?? ""
            ).trim();

            const age =
              Number(body.age);

            const gender = String(
              body.gender ?? ""
            ).trim();

            const mobile = String(
              body.mobile ?? ""
            ).trim();

            const address = String(
              body.address ?? ""
            ).trim();

            const bloodGroup = String(
              body.bloodGroup ?? ""
            ).trim();

            const aadhaar = String(
              body.aadhaar ?? ""
            ).trim();

            const occupation = String(
              body.occupation ?? ""
            ).trim();

            if (!firstName) {
              throw new Error(
                "FIRST_NAME_REQUIRED"
              );
            }

            if (
              !Number.isInteger(age) ||
              age < 0 ||
              age > 150
            ) {
              throw new Error(
                "INVALID_AGE"
              );
            }

            if (!gender) {
              throw new Error(
                "GENDER_REQUIRED"
              );
            }

            if (!mobile) {
              throw new Error(
                "MOBILE_REQUIRED"
              );
            }

            let patientIdNumber =
              generatePatientId();

            let patientIdExists =
              await tx.patient.findUnique({
                where: {
                  patientId:
                    patientIdNumber,
                },
              });

            while (patientIdExists) {
              patientIdNumber =
                generatePatientId();

              patientIdExists =
                await tx.patient.findUnique({
                  where: {
                    patientId:
                      patientIdNumber,
                  },
                });
            }

            const newPatient =
              await tx.patient.create({
                data: {
                  patientId:
                    patientIdNumber,

                  firstName,

                  lastName:
                    lastName || null,

                  age,

                  gender,

                  mobile,

                  address:
                    address || null,

                  bloodGroup:
                    bloodGroup || null,

                  aadhaar:
                    aadhaar || null,

                  occupation:
                    occupation || null,

                  isActive: true,
                },
              });

            finalPatientId =
              newPatient.id;
          }

          let ipdNo =
            generateIpdNo();

          let existingIpd =
            await tx.ipdAdmission.findUnique({
              where: {
                ipdNo,
              },
            });

          while (existingIpd) {
            ipdNo =
              generateIpdNo();

            existingIpd =
              await tx.ipdAdmission.findUnique({
                where: {
                  ipdNo,
                },
              });
          }

          const newAdmission =
            await tx.ipdAdmission.create({
              data: {
                ipdNo,

                patientId:
                  finalPatientId,

                bedId,

                admittingDoctor,

                department,

                chiefComplaint:
                  chiefComplaint || null,

                provisionalDiagnosis:
                  provisionalDiagnosis ||
                  null,

                admissionNotes:
                  admissionNotes || null,

                status:
                  "Admitted",
              },

              include: {
                patient: true,

                bed: {
                  include: {
                    ward: true,
                  },
                },
              },
            });

          await tx.bed.update({
            where: {
              id: bedId,
            },

            data: {
              status:
                "Occupied",
            },
          });

          return newAdmission;
        }
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Patient admitted successfully.",

        admission,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "IPD ADMISSION POST ERROR:",
      error
    );

    if (
      error instanceof Error
    ) {
      const errorMessages:
        Record<string, string> = {
        BED_NOT_FOUND:
          "Selected bed was not found.",

        BED_INACTIVE:
          "Selected bed is inactive.",

        BED_NOT_AVAILABLE:
          "This bed is no longer available.",

        PATIENT_NOT_FOUND:
          "Selected patient was not found.",

        PATIENT_ALREADY_ADMITTED:
          "This patient is already admitted in IPD.",

        FIRST_NAME_REQUIRED:
          "Patient first name is required.",

        INVALID_AGE:
          "Please enter a valid patient age.",

        GENDER_REQUIRED:
          "Patient gender is required.",

        MOBILE_REQUIRED:
          "Patient mobile number is required.",
      };

      if (
        errorMessages[
          error.message
        ]
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              errorMessages[
                error.message
              ],
          },
          {
            status: 400,
          }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create IPD admission.",
      },
      {
        status: 500,
      }
    );
  }
}