import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        success: true,
        status: "ok",
        database: "ok",
        service: "Atulyam ClinicPro",
        timestamp: new Date().toISOString(),
        responseTimeMs: Date.now() - startedAt,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("HEALTH CHECK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        status: "degraded",
        database: "unavailable",
        service: "Atulyam ClinicPro",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
