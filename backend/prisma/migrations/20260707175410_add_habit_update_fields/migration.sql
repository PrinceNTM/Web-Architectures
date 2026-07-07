-- AlterTable
ALTER TABLE "habits" ADD COLUMN "reminder" BOOLEAN DEFAULT false;
ALTER TABLE "habits" ADD COLUMN "targetPerDay" INTEGER;
ALTER TABLE "habits" ADD COLUMN "timeOfDay" TEXT;
