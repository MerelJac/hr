-- AlterTable
ALTER TABLE "NominationChallenge" ADD COLUMN     "allowMultipleWinners" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hideStatusFromSubmitter" BOOLEAN NOT NULL DEFAULT false;
