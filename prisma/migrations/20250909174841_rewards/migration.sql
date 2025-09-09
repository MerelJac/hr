/*
  Warnings:

  - A unique constraint covering the columns `[submitterId,type,monthKey]` on the table `Nomination` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "RewardCatalog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "valueCents" INTEGER NOT NULL,
    "pointsCost" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Redemption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "catalogId" TEXT NOT NULL,
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

-- CreateIndex
CREATE INDEX "RewardCatalog_type_isActive_idx" ON "RewardCatalog"("type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Redemption_idemKey_key" ON "Redemption"("idemKey");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_submitter_type_month" ON "Nomination"("submitterId", "type", "monthKey");
