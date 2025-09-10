/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Nomination` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Nomination" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submitterId" TEXT NOT NULL,
    "nomineeId" TEXT,
    "postUrl" TEXT,
    "caption" TEXT,
    "reason" TEXT,
    "monthKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Nomination_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Nomination_nomineeId_fkey" FOREIGN KEY ("nomineeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Nomination" ("caption", "createdAt", "id", "monthKey", "nomineeId", "reason", "status", "submitterId", "type", "updatedAt") SELECT "caption", "createdAt", "id", "monthKey", "nomineeId", "reason", "status", "submitterId", "type", "updatedAt" FROM "Nomination";
DROP TABLE "Nomination";
ALTER TABLE "new_Nomination" RENAME TO "Nomination";
CREATE UNIQUE INDEX "uniq_submitter_type_month" ON "Nomination"("submitterId", "type", "monthKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
