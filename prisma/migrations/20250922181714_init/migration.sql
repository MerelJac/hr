-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "public"."NominationType" AS ENUM ('EOM');

-- CreateEnum
CREATE TYPE "public"."NominationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WON');

-- CreateEnum
CREATE TYPE "public"."RewardType" AS ENUM ('AMAZON', 'VISA');

-- CreateEnum
CREATE TYPE "public"."RedemptionStatus" AS ENUM ('PENDING', 'APPROVED', 'FULFILLED', 'FAILED', 'CANCELED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "profileImage" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'EMPLOYEE',
    "pointsBalance" INTEGER NOT NULL DEFAULT 0,
    "monthlyBudget" INTEGER NOT NULL DEFAULT 50,
    "emailVerified" TIMESTAMP(3),
    "birthday" TIMESTAMP(3),
    "workAnniversary" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserInvite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'EMPLOYEE',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumedAt" TIMESTAMP(3),

    CONSTRAINT "UserInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Recognition" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recognition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecognitionRecipient" (
    "id" TEXT NOT NULL,
    "recognitionId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecognitionRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Nomination" (
    "id" TEXT NOT NULL,
    "type" "public"."NominationType" NOT NULL,
    "status" "public"."NominationStatus" NOT NULL DEFAULT 'PENDING',
    "submitterId" TEXT NOT NULL,
    "nomineeId" TEXT,
    "postUrl" TEXT,
    "caption" TEXT,
    "reason" TEXT,
    "monthKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nomination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RewardCatalog" (
    "id" TEXT NOT NULL,
    "type" "public"."RewardType" NOT NULL,
    "label" TEXT NOT NULL,
    "valueCents" INTEGER NOT NULL,
    "pointsCost" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Redemption" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "catalogId" TEXT,
    "type" "public"."RewardType" NOT NULL,
    "pointsSpent" INTEGER NOT NULL,
    "valueCents" INTEGER NOT NULL,
    "status" "public"."RedemptionStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "externalId" TEXT,
    "code" TEXT,
    "claimUrl" TEXT,
    "deliverEmail" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "idemKey" TEXT,

    CONSTRAINT "Redemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecognitionComment" (
    "id" TEXT NOT NULL,
    "recognitionId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT,
    "message" TEXT,
    "pointsBoosted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecognitionComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvite_email_key" ON "public"."UserInvite"("email");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_submitter_type_month" ON "public"."Nomination"("submitterId", "type", "monthKey");

-- CreateIndex
CREATE UNIQUE INDEX "RewardCatalog_label_key" ON "public"."RewardCatalog"("label");

-- CreateIndex
CREATE INDEX "RewardCatalog_type_isActive_idx" ON "public"."RewardCatalog"("type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Redemption_idemKey_key" ON "public"."Redemption"("idemKey");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "public"."PasswordResetToken"("token");

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Recognition" ADD CONSTRAINT "Recognition_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecognitionRecipient" ADD CONSTRAINT "RecognitionRecipient_recognitionId_fkey" FOREIGN KEY ("recognitionId") REFERENCES "public"."Recognition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecognitionRecipient" ADD CONSTRAINT "RecognitionRecipient_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Nomination" ADD CONSTRAINT "Nomination_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Nomination" ADD CONSTRAINT "Nomination_nomineeId_fkey" FOREIGN KEY ("nomineeId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Redemption" ADD CONSTRAINT "Redemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Redemption" ADD CONSTRAINT "Redemption_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "public"."RewardCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecognitionComment" ADD CONSTRAINT "RecognitionComment_recognitionId_fkey" FOREIGN KEY ("recognitionId") REFERENCES "public"."Recognition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecognitionComment" ADD CONSTRAINT "RecognitionComment_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecognitionComment" ADD CONSTRAINT "RecognitionComment_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
