import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const uploadedFile = formData.get("database") as File | null;

    if (!uploadedFile) {
      return NextResponse.json(
        {
          success: false,
          message: "No database file selected.",
        },
        { status: 400 }
      );
    }

    if (!uploadedFile.name.endsWith(".db")) {
      return NextResponse.json(
        {
          success: false,
          message: "Please upload a valid SQLite (.db) file.",
        },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await uploadedFile.arrayBuffer());

    // SQLite files start with this signature
    const sqliteHeader = bytes.subarray(0, 16).toString();

    if (!sqliteHeader.startsWith("SQLite format 3")) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid SQLite database.",
        },
        { status: 400 }
      );
    }

    const dbPath = path.join(process.cwd(), "dev.db");

    const backupFolder = path.join(process.cwd(), "backup");

    await fs.mkdir(backupFolder, {
      recursive: true,
    });

    const now = new Date();

    const backupName =
      "AutoBackup_" +
      now
        .toISOString()
        .replace(/:/g, "-")
        .replace(/\./g, "-") +
      ".db";

    const backupPath = path.join(
      backupFolder,
      backupName
    );

    // Backup current database
    await fs.copyFile(dbPath, backupPath);

    // Disconnect Prisma
    await prisma.$disconnect();

    try {
      // Replace database
      await fs.writeFile(dbPath, bytes);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Database is currently in use. Stop the application, replace the database, then restart.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Database restored successfully. Please restart the application before continuing.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Restore failed.",
      },
      { status: 500 }
    );
  }
}