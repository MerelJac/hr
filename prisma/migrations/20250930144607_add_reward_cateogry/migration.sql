/*
  Warnings:

  - Added the required column `categoryId` to the `RewardCatalog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "RewardCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RewardCatalog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "valueCents" INTEGER NOT NULL,
    "pointsCost" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RewardCatalog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RewardCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RewardCatalog" ("createdAt", "id", "isActive", "label", "pointsCost", "type", "updatedAt", "valueCents") SELECT "createdAt", "id", "isActive", "label", "pointsCost", "type", "updatedAt", "valueCents" FROM "RewardCatalog";
DROP TABLE "RewardCatalog";
ALTER TABLE "new_RewardCatalog" RENAME TO "RewardCatalog";
CREATE UNIQUE INDEX "RewardCatalog_label_key" ON "RewardCatalog"("label");
CREATE INDEX "RewardCatalog_categoryId_isActive_idx" ON "RewardCatalog"("categoryId", "isActive");
CREATE INDEX "RewardCatalog_type_isActive_idx" ON "RewardCatalog"("type", "isActive");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RewardCategory_name_key" ON "RewardCategory"("name");
