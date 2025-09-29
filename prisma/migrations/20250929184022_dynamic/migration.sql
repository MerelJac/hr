/*
  Warnings:

  - You are about to drop the column `caption` on the `Nomination` table. All the data in the column will be lost.
  - You are about to drop the column `postUrl` on the `Nomination` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Nomination` table. All the data in the column will be lost.
  - Made the column `challengeId` on table `Nomination` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Nomination" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submitterId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "nomineeId" TEXT,
    "reason" TEXT,
    "screenshot" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "monthKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Nomination_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Nomination_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "NominationChallenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Nomination_nomineeId_fkey" FOREIGN KEY ("nomineeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Nomination" ("challengeId", "createdAt", "id", "monthKey", "nomineeId", "reason", "status", "submitterId", "updatedAt") SELECT "challengeId", "createdAt", "id", "monthKey", "nomineeId", "reason", "status", "submitterId", "updatedAt" FROM "Nomination";
DROP TABLE "Nomination";
ALTER TABLE "new_Nomination" RENAME TO "Nomination";
CREATE UNIQUE INDEX "uniq_submitter_challenge_month" ON "Nomination"("submitterId", "challengeId", "monthKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
