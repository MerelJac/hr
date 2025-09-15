// src/scripts/grantBirthdayPoints.ts
// Run with: npx tsx src/scripts/grantBirthdayPoints.ts

import { prisma } from "@/lib/prisma";

async function grantBirthdayPoints() {
  const today = new Date();
  const month = today.getMonth() + 1; // JS months are 0–11
  const day = today.getDate();

  // Find employees whose birthday matches today (month + day)
  const birthdayUsers = await prisma.user.findMany({
    where: {
      role: "EMPLOYEE",
      birthday: {
        not: null,
      },
    },
  });

  const matchingUsers = birthdayUsers.filter((u) => {
    if (!u.birthday) return false;
    const bday = new Date(u.birthday);
    return bday.getMonth() + 1 === month && bday.getDate() === day;
  });

  if (matchingUsers.length === 0) {
    console.log("🎂 No birthdays today.");
    return;
  }

  // Update all birthday users
  const updates = await Promise.all(
    matchingUsers.map((u) =>
      prisma.user.update({
        where: { id: u.id },
        data: { pointsBalance: { increment: 500 } },
      })
    )
  );

  console.log(`🎉 Granted 500 birthday points to ${updates.length} employees!`);
}

grantBirthdayPoints().finally(() => prisma.$disconnect());
