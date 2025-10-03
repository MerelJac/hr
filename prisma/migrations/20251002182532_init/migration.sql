-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "public"."NominationType" AS ENUM ('EOM', 'LINKEDIN');

-- CreateEnum
CREATE TYPE "public"."NominationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WON', 'SKIPPED');

-- CreateEnum
CREATE TYPE "public"."RewardType" AS ENUM ('AMAZON', 'VISA');

-- CreateEnum
CREATE TYPE "public"."RedemptionStatus" AS ENUM ('PENDING', 'APPROVED', 'FULFILLED', 'FAILED', 'CANCELLED');

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
    "preferredName" TEXT,
    "department" TEXT,
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
    "firstName" TEXT,
    "lastName" TEXT,
    "preferredName" TEXT,
    "birthday" TIMESTAMP(3),
    "workAnniversary" TIMESTAMP(3),
    "department" TEXT,
    "sendEmail" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Recognition" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "gifUrl" TEXT,
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
CREATE TABLE "public"."NominationChallenge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "qualification" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "gifUrl" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "requirements" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NominationChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Nomination" (
    "id" TEXT NOT NULL,
    "submitterId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "nomineeId" TEXT,
    "reason" TEXT,
    "screenshot" TEXT,
    "status" "public"."NominationStatus" NOT NULL DEFAULT 'PENDING',
    "monthKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nomination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RewardCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RewardCatalog" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "type" "public"."RewardType",
    "label" TEXT NOT NULL,
    "valueCents" INTEGER,
    "pointsCost" INTEGER NOT NULL,
    "imageUrl" TEXT,
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
CREATE UNIQUE INDEX "NominationChallenge_title_key" ON "public"."NominationChallenge"("title");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_submitter_challenge_month" ON "public"."Nomination"("submitterId", "challengeId", "monthKey");

-- CreateIndex
CREATE UNIQUE INDEX "RewardCategory_name_key" ON "public"."RewardCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RewardCatalog_label_key" ON "public"."RewardCatalog"("label");

-- CreateIndex
CREATE INDEX "RewardCatalog_categoryId_isActive_idx" ON "public"."RewardCatalog"("categoryId", "isActive");

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
ALTER TABLE "public"."Nomination" ADD CONSTRAINT "Nomination_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "public"."NominationChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Nomination" ADD CONSTRAINT "Nomination_nomineeId_fkey" FOREIGN KEY ("nomineeId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RewardCatalog" ADD CONSTRAINT "RewardCatalog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."RewardCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
