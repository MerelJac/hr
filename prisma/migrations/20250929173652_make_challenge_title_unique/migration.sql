/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `NominationChallenge` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "NominationChallenge_title_key" ON "NominationChallenge"("title");
