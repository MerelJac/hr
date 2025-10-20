/*
  Warnings:

  - You are about to drop the column `challengeId` on the `RecognitionComment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Recognition" ADD COLUMN     "challengeId" TEXT;

-- AlterTable
ALTER TABLE "RecognitionComment" DROP COLUMN "challengeId";
