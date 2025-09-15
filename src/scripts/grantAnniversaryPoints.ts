// src/scripts/grantAnniversaryPoints.ts
// Run with: npx tsx src/scripts/grantAnniversaryPoints.ts

import { prisma } from "@/lib/prisma";

async function grantAnniversaryPoints() {
  const today = new Date();
  const month = today.getMonth() + 1; // JS months are 0–11
  const day = today.getDate();

  // Find employees whose anniversary matches today (month + day)
  const anniversaryUsers = await prisma.user.findMany({
    where: {
      role: "EMPLOYEE",
      workAnniversary: {
        not: null,
      },
    },
  });

  const matchingUsers = anniversaryUsers.filter((u) => {
    if (!u.workAnniversary) return false;
    const bday = new Date(u.workAnniversary);
    return bday.getMonth() + 1 === month && bday.getDate() === day;
  });

  if (matchingUsers.length === 0) {
    console.log("🎂 No anniversarys today.");
    return;
  }

  // Update all anniversary users
  const updates = await Promise.all(
    matchingUsers.map((u) =>
      prisma.user.update({
        where: { id: u.id },
        data: { pointsBalance: { increment: 500 } },
      })
    )
  );

  console.log(
    `🎉 Granted 500 anniversary points to ${updates.length} employees!`
  );
}

grantAnniversaryPoints().finally(() => prisma.$disconnect());
