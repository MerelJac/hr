-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RewardCatalog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "valueCents" INTEGER,
    "pointsCost" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RewardCatalog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RewardCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RewardCatalog" ("categoryId", "createdAt", "id", "isActive", "label", "pointsCost", "type", "updatedAt", "valueCents") SELECT "categoryId", "createdAt", "id", "isActive", "label", "pointsCost", "type", "updatedAt", "valueCents" FROM "RewardCatalog";
DROP TABLE "RewardCatalog";
ALTER TABLE "new_RewardCatalog" RENAME TO "RewardCatalog";
CREATE UNIQUE INDEX "RewardCatalog_label_key" ON "RewardCatalog"("label");
CREATE INDEX "RewardCatalog_categoryId_isActive_idx" ON "RewardCatalog"("categoryId", "isActive");
CREATE INDEX "RewardCatalog_type_isActive_idx" ON "RewardCatalog"("type", "isActive");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
