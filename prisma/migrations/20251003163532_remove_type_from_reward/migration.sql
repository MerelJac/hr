/*
  Warnings:

  - You are about to drop the column `type` on the `Redemption` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `RewardCatalog` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."RewardCatalog_type_isActive_idx";

-- AlterTable
ALTER TABLE "public"."Redemption" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "public"."RewardCatalog" DROP COLUMN "type";

-- DropEnum
DROP TYPE "public"."RewardType";
