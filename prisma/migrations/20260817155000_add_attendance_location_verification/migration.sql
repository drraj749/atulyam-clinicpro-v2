-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_staffId_fkey";

-- DropIndex
DROP INDEX "Attendance_attendanceDate_idx";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "checkInAccuracy" DOUBLE PRECISION,
ADD COLUMN     "checkInDistanceMeters" DOUBLE PRECISION,
ADD COLUMN     "checkInLatitude" DOUBLE PRECISION,
ADD COLUMN     "checkInLongitude" DOUBLE PRECISION,
ADD COLUMN     "checkOutAccuracy" DOUBLE PRECISION,
ADD COLUMN     "checkOutDistanceMeters" DOUBLE PRECISION,
ADD COLUMN     "checkOutLatitude" DOUBLE PRECISION,
ADD COLUMN     "checkOutLongitude" DOUBLE PRECISION,
ADD COLUMN     "locationVerified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "status" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

