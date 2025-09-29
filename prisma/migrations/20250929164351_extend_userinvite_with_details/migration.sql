-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumedAt" DATETIME,
    "firstName" TEXT,
    "lastName" TEXT,
    "preferredName" TEXT,
    "birthday" DATETIME,
    "workAnniversary" DATETIME,
    "department" TEXT,
    "sendEmail" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_UserInvite" ("consumedAt", "createdAt", "createdById", "email", "id", "role") SELECT "consumedAt", "createdAt", "createdById", "email", "id", "role" FROM "UserInvite";
DROP TABLE "UserInvite";
ALTER TABLE "new_UserInvite" RENAME TO "UserInvite";
CREATE UNIQUE INDEX "UserInvite_email_key" ON "UserInvite"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
