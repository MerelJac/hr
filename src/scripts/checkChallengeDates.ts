// src/scripts/checkChallengeDates.ts
// Run with: npx tsx src/scripts/checkChallengeDates.ts

import { prisma } from "@/lib/prisma";
import { sendNewChallengeAlert } from "@/lib/emailTemplates";

export async function checkChallengeDates() {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // Fetch all employees
  const employees = await prisma.user.findMany({
    select: { id: true, email: true, isActive: true },
  });

  // 1️⃣ Deactivate challenges whose end date was yesterday
  const oldChallenges = await prisma.nominationChallenge.findMany({
    where: { endDate: { lt: today } },
  });

  let deactivatedCount = 0;
  for (const challenge of oldChallenges) {
    await prisma.nominationChallenge.update({
      where: { id: challenge.id },
      data: { isActive: false },
    });
    deactivatedCount++;
  }

  // 2️⃣ Activate challenges starting today
  const newChallenges = await prisma.nominationChallenge.findMany({
    where: { startDate: { lte: today } },
  });

  let activatedCount = 0;
  for (const challenge of newChallenges) {
    if (!challenge.isActive) {
      await prisma.nominationChallenge.update({
        where: { id: challenge.id },
        data: { isActive: true },
      });
      activatedCount++;
    }
  }

  // 3️⃣ Notify all employees if new challenges exist
  if (newChallenges.length > 0) {
    await Promise.all(
      newChallenges.map(async (challenge) => {
        return Promise.all(
          employees.map((u) => sendNewChallengeAlert(u.email, challenge.title))
        );
      })
    );
  }

  console.log(`✅ Deactivated ${deactivatedCount} old challenges`);
  console.log(`✅ Activated ${activatedCount} new challenges`);
}
