-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Redemption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "catalogId" TEXT,
    "type" TEXT NOT NULL,
    "pointsSpent" INTEGER NOT NULL,
    "valueCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "externalId" TEXT,
    "code" TEXT,
    "claimUrl" TEXT,
    "deliverEmail" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "idemKey" TEXT,
    CONSTRAINT "Redemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Redemption_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "RewardCatalog" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Redemption" ("catalogId", "claimUrl", "code", "createdAt", "deliverEmail", "externalId", "id", "idemKey", "note", "pointsSpent", "provider", "status", "type", "updatedAt", "userId", "valueCents") SELECT "catalogId", "claimUrl", "code", "createdAt", "deliverEmail", "externalId", "id", "idemKey", "note", "pointsSpent", "provider", "status", "type", "updatedAt", "userId", "valueCents" FROM "Redemption";
DROP TABLE "Redemption";
ALTER TABLE "new_Redemption" RENAME TO "Redemption";
CREATE UNIQUE INDEX "Redemption_idemKey_key" ON "Redemption"("idemKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
