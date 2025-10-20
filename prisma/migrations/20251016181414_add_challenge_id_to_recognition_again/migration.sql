-- AddForeignKey
ALTER TABLE "Recognition" ADD CONSTRAINT "Recognition_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "NominationChallenge"("id") ON DELETE SET NULL ON UPDATE CASCADE;
