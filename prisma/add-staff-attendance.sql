CREATE TABLE IF NOT EXISTS "Staff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "staffCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "mobile" TEXT,
    "address" TEXT,
    "joiningDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "Staff_staffCode_key"
ON "Staff"("staffCode");


CREATE TABLE IF NOT EXISTS "Attendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "staffId" INTEGER NOT NULL,
    "attendanceDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Present',
    "checkIn" DATETIME,
    "checkOut" DATETIME,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    CONSTRAINT "Attendance_staffId_fkey"
    FOREIGN KEY ("staffId")
    REFERENCES "Staff"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Attendance_staffId_attendanceDate_key"
ON "Attendance"("staffId", "attendanceDate");

CREATE INDEX IF NOT EXISTS "Attendance_attendanceDate_idx"
ON "Attendance"("attendanceDate");

CREATE INDEX IF NOT EXISTS "Attendance_staffId_idx"
ON "Attendance"("staffId");