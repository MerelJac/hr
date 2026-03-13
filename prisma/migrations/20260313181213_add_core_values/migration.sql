-- CreateEnum
CREATE TYPE "CoreValue" AS ENUM ('LIGHT', 'RIGHT', 'SERVICE', 'PROBLEM', 'EVOLUTION');

-- AlterTable
ALTER TABLE "Recognition" ADD COLUMN     "coreValue" "CoreValue";

-- CreateIndex
CREATE INDEX "Recognition_coreValue_idx" ON "Recognition"("coreValue");
