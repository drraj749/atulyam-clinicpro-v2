import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/app/lib/prisma";

type CollectionBody = {
  id?: unknown;
  date?: unknown;
  patientName?: unknown;
  testName?: unknown;
  cost?: unknown;
  labName?: unknown;

  sstBarcode?: unknown;
  edtaBarcode?: unknown;
  fluorideBarcode?: unknown;
  urineBarcode?: unknown;
  sputumBarcode?: unknown;
};

function validateBarcode(
  value: unknown,
  label: string
) {
  const barcode = String(
    value ?? ""
  )
    .trim()
    .toUpperCase();

  // Empty barcode is allowed
  if (!barcode) {
    return {
      value: null,
    };
  }

  // Exactly 2 capital letters + 6 digits
  const barcodePattern =
    /^[A-Z]{2}[0-9]{6}$/;

  if (!barcodePattern.test(barcode)) {
    return {
      error:
        `${label} barcode must contain ` +
        `2 capital letters followed by 6 numbers. ` +
        `Example: AB123456`,
    };
  }

  return {
    value: barcode,
  };
}

function validateCollection(
  body: CollectionBody
) {
  const date = String(
    body.date ?? ""
  ).trim();

  const patientName = String(
    body.patientName ?? ""
  ).trim();

  const testName = String(
    body.testName ?? ""
  ).trim();

  const labName = String(
    body.labName ?? ""
  ).trim();

  const cost = Number(
    body.cost
  );

  if (!date) {
    return {
      error:
        "Date is required.",
    };
  }

  if (!patientName) {
    return {
      error:
        "Patient name is required.",
    };
  }

  if (!testName) {
    return {
      error:
        "Test name is required.",
    };
  }

  if (
    body.cost === undefined ||
    body.cost === null ||
    body.cost === "" ||
    !Number.isFinite(cost) ||
    cost < 0
  ) {
    return {
      error:
        "Please enter a valid cost.",
    };
  }

  if (!labName) {
    return {
      error:
        "Lab name is required.",
    };
  }

  const parsedDate =
    new Date(
      `${date}T00:00:00`
    );

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return {
      error:
        "Invalid date.",
    };
  }

  /*
   * Barcode fields are only used
   * when Thyrocare is selected.
   */

  let sstBarcode: string | null =
    null;

  let edtaBarcode: string | null =
    null;

  let fluorideBarcode:
    | string
    | null = null;

  let urineBarcode:
    | string
    | null = null;

  let sputumBarcode:
    | string
    | null = null;

  if (
    labName.toLowerCase() ===
    "thyrocare"
  ) {
    const sst =
      validateBarcode(
        body.sstBarcode,
        "SST"
      );

    if ("error" in sst) {
      return {
        error: sst.error,
      };
    }

    const edta =
      validateBarcode(
        body.edtaBarcode,
        "EDTA"
      );

    if ("error" in edta) {
      return {
        error: edta.error,
      };
    }

    const fluoride =
      validateBarcode(
        body.fluorideBarcode,
        "Fluoride"
      );

    if ("error" in fluoride) {
      return {
        error:
          fluoride.error,
      };
    }

    const urine =
      validateBarcode(
        body.urineBarcode,
        "Urine"
      );

    if ("error" in urine) {
      return {
        error:
          urine.error,
      };
    }

    const sputum =
      validateBarcode(
        body.sputumBarcode,
        "Sputum"
      );

    if ("error" in sputum) {
      return {
        error:
          sputum.error,
      };
    }

    sstBarcode =
      sst.value;

    edtaBarcode =
      edta.value;

    fluorideBarcode =
      fluoride.value;

    urineBarcode =
      urine.value;

    sputumBarcode =
      sputum.value;
  }

  return {
    data: {
      date: parsedDate,
      patientName,
      testName,
      cost,
      labName,

      sstBarcode,

      edtaBarcode,

      fluorideBarcode,

      urineBarcode,

      sputumBarcode,
    },
  };
}

export async function GET() {
  try {
    const collections =
      await prisma.labSampleCollection.findMany(
        {
          orderBy: {
            date: "desc",
          },
        }
      );

    return NextResponse.json({
      success: true,
      collections,
    });
  } catch (error) {
    console.error(
      "LAB COLLECTION GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load lab sample records.",
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
    const body =
      (await request.json()) as CollectionBody;

    const validation =
      validateCollection(body);

    if ("error" in validation) {
      return NextResponse.json(
        {
          success: false,
          message:
            validation.error,
        },
        {
          status: 400,
        }
      );
    }

    const collection =
      await prisma.labSampleCollection.create(
        {
          data: validation.data,
        }
      );

    return NextResponse.json(
      {
        success: true,
        collection,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "LAB COLLECTION POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to save lab sample record.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: NextRequest
) {
  try {
    const body =
      (await request.json()) as CollectionBody;

    const id =
      Number(body.id);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid record ID.",
        },
        {
          status: 400,
        }
      );
    }

    const validation =
      validateCollection(body);

    if ("error" in validation) {
      return NextResponse.json(
        {
          success: false,
          message:
            validation.error,
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.labSampleCollection.findUnique(
        {
          where: {
            id,
          },
        }
      );

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Record not found.",
        },
        {
          status: 404,
        }
      );
    }

    const collection =
      await prisma.labSampleCollection.update(
        {
          where: {
            id,
          },

          data:
            validation.data,
        }
      );

    return NextResponse.json({
      success: true,
      collection,
    });
  } catch (error) {
    console.error(
      "LAB COLLECTION PUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update lab sample record.",
      },
      {
        status: 500,
      }
    );
  }
}