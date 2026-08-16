import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.hospitalSettings.findUnique({
      where: {
        id: 1,
      },
    });

    if (!settings) {
      settings = await prisma.hospitalSettings.create({
        data: {
          id: 1,
          hospitalName: "ATULYAM HOSPITAL",
          tagline: "Born To Serve",

          address: "Garwar",
          city: "Ballia",
          state: "Uttar Pradesh",
          pincode: "277121",

          phone: "+91-9123441452",
          email: "",
          website: "",

          doctorName: "Dr. Rahul Kumar",
          qualification: "MBBS, MD Physician",
          registrationNo: "",

          logo: "/images/logo.png",
          signature: "",

          prescriptionFooter:
            "Thank you for visiting Atulyam Hospital. Please take medicines as advised and follow up as scheduled.",
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const settings = await prisma.hospitalSettings.upsert({
      where: {
        id: 1,
      },
      update: {
        hospitalName: body.hospitalName,
        tagline: body.tagline,

        address: body.address,
        city: body.city,
        state: body.state,
        pincode: body.pincode,

        phone: body.phone,
        email: body.email,
        website: body.website,

        doctorName: body.doctorName,
        qualification: body.qualification,
        registrationNo: body.registrationNo,

        logo: body.logo,
        signature: body.signature,

        prescriptionFooter: body.prescriptionFooter,
      },
      create: {
        id: 1,

        hospitalName: body.hospitalName,
        tagline: body.tagline,

        address: body.address,
        city: body.city,
        state: body.state,
        pincode: body.pincode,

        phone: body.phone,
        email: body.email,
        website: body.website,

        doctorName: body.doctorName,
        qualification: body.qualification,
        registrationNo: body.registrationNo,

        logo: body.logo,
        signature: body.signature,

        prescriptionFooter: body.prescriptionFooter,
      },
    });

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}