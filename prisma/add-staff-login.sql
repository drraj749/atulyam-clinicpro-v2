ALTER TABLE "Staff"
ADD COLUMN "username" TEXT;

ALTER TABLE "Staff"
ADD COLUMN "passwordHash" TEXT;

ALTER TABLE "Staff"
ADD COLUMN "loginEnabled" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Staff"
ADD COLUMN "lastLoginAt" DATETIME;

CREATE UNIQUE INDEX "Staff_username_key"
ON "Staff"("username");