-- CreateTable
CREATE TABLE "RecognitionComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recognitionId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT,
    "message" TEXT,
    "pointsBoosted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecognitionComment_recognitionId_fkey" FOREIGN KEY ("recognitionId") REFERENCES "Recognition" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecognitionComment_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecognitionComment_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
