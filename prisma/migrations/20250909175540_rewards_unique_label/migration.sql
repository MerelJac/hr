/*
  Warnings:

  - A unique constraint covering the columns `[label]` on the table `RewardCatalog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RewardCatalog_label_key" ON "RewardCatalog"("label");
