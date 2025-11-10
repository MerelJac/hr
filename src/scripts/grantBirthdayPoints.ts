// src/scripts/grantBirthdayPoints.ts
// Run with: npx tsx src/scripts/grantBirthdayPoints.ts

import { sendBirthdayAnnouncementEmail, sendBirthdayEmail } from "@/lib/emailTemplates";
import { prisma } from "@/lib/prisma";

export async function grantBirthdayPoints() {
  const today = new Date();
  const month = today.getMonth() + 1; // JS months are 0–11
  const day = today.getDate();

  // Find faculty whose birthday matches today (month + day)
  const birthdayUsers = await prisma.user.findMany({
    where: {
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
  const senderId = process.env.SYSTEM_ADMIN_ID;

  if (!senderId) {
    console.log("No System Admin Id to post with.");
    return;
  }

  const birthdays: Record<string, string> = {};

  for (const u of matchingUsers) {
    // Create recognition for each employee
    const recognition = await prisma.recognition.create({
      data: {
        senderId,
        message: `Happy Birthday! 🎉`,
        recipients: {
          create: {
            recipientId: u.id,
            points: 500,
          },
        },
      },
    });

    // Store recognition ID by user ID or name
    birthdays[u.id] = recognition.id;
  }

  // Send one email to all birthday users (parallel)
  await Promise.all(
    matchingUsers
      .filter((u) => u.emailNotifications)
      .map((u) => sendBirthdayEmail(u.email, birthdays[u.id]))
  );

  // Now notify everyone else in the system about the birthdays
  const allUsers = await prisma.user.findMany({
    where: { emailNotifications: true },
  });

  const nonBirthdayUsers = allUsers.filter(
    (u) => !matchingUsers.some((b) => b.id === u.id)
  );

  await Promise.all(
    nonBirthdayUsers.map((u) =>
      sendBirthdayAnnouncementEmail(
        u.email,
        matchingUsers.map((b) => ({
          name: b.firstName ?? "Team Member",
          recognitionId: birthdays[b.id],
        }))
      )
    )
  );

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

// grantBirthdayPoints().finally(() => prisma.$disconnect());
