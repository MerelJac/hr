/*
  Warnings:

  - You are about to drop the column `isActive` on the `UserInvite` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "pointsBalance" INTEGER NOT NULL DEFAULT 0,
    "monthlyBudget" INTEGER NOT NULL DEFAULT 50,
    "emailVerified" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "firstName", "id", "lastName", "monthlyBudget", "passwordHash", "pointsBalance", "role", "updatedAt") SELECT "createdAt", "email", "emailVerified", "firstName", "id", "lastName", "monthlyBudget", "passwordHash", "pointsBalance", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_UserInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumedAt" DATETIME
);
INSERT INTO "new_UserInvite" ("consumedAt", "createdAt", "createdById", "email", "id", "role") SELECT "consumedAt", "createdAt", "createdById", "email", "id", "role" FROM "UserInvite";
DROP TABLE "UserInvite";
ALTER TABLE "new_UserInvite" RENAME TO "UserInvite";
CREATE UNIQUE INDEX "UserInvite_email_key" ON "UserInvite"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
