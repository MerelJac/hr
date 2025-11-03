-- CreateIndex
CREATE INDEX "Nomination_submitterId_idx" ON "Nomination"("submitterId");

-- CreateIndex
CREATE INDEX "Nomination_challengeId_idx" ON "Nomination"("challengeId");

-- CreateIndex
CREATE INDEX "Nomination_nomineeId_idx" ON "Nomination"("nomineeId");

-- CreateIndex
CREATE INDEX "NominationChallenge_isActive_idx" ON "NominationChallenge"("isActive");

-- CreateIndex
CREATE INDEX "Recognition_senderId_idx" ON "Recognition"("senderId");

-- CreateIndex
CREATE INDEX "RecognitionComment_recognitionId_idx" ON "RecognitionComment"("recognitionId");

-- CreateIndex
CREATE INDEX "RecognitionComment_senderId_idx" ON "RecognitionComment"("senderId");

-- CreateIndex
CREATE INDEX "RecognitionRecipient_recognitionId_idx" ON "RecognitionRecipient"("recognitionId");

-- CreateIndex
CREATE INDEX "RecognitionRecipient_recipientId_idx" ON "RecognitionRecipient"("recipientId");

-- CreateIndex
CREATE INDEX "Redemption_userId_idx" ON "Redemption"("userId");

-- CreateIndex
CREATE INDEX "Redemption_catalogId_idx" ON "Redemption"("catalogId");

-- CreateIndex
CREATE INDEX "User_departmentId_idx" ON "User"("departmentId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "UserInvite_email_idx" ON "UserInvite"("email");
