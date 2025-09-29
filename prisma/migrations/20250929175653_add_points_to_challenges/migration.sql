-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NominationChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "qualification" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "requirements" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_NominationChallenge" ("createdAt", "description", "endDate", "id", "isActive", "qualification", "requirements", "startDate", "title", "updatedAt") SELECT "createdAt", "description", "endDate", "id", "isActive", "qualification", "requirements", "startDate", "title", "updatedAt" FROM "NominationChallenge";
DROP TABLE "NominationChallenge";
ALTER TABLE "new_NominationChallenge" RENAME TO "NominationChallenge";
CREATE UNIQUE INDEX "NominationChallenge_title_key" ON "NominationChallenge"("title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
