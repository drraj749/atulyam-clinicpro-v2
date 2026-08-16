import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), "dev.db");

    const file = await fs.readFile(dbPath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="AtulyamHospital_Backup_${
          new Date().toISOString().split("T")[0]
        }.db`,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Backup failed.",
      },
      {
        status: 500,
      }
    );
  }
}