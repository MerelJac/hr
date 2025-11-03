-- CreateIndex
CREATE INDEX "Department_name_idx" ON "Department"("name");

-- CreateIndex
CREATE INDEX "Recognition_createdAt_idx" ON "Recognition"("createdAt");

-- CreateIndex
CREATE INDEX "Recognition_senderId_createdAt_idx" ON "Recognition"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX "RecognitionRecipient_createdAt_idx" ON "RecognitionRecipient"("createdAt");

-- CreateIndex
CREATE INDEX "RecognitionRecipient_recipientId_createdAt_idx" ON "RecognitionRecipient"("recipientId", "createdAt");
