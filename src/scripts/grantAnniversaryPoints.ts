// src/scripts/grantAnniversaryPoints.ts
// Run with: npx tsx src/scripts/grantAnniversaryPoints.ts

import { sendWorkAnniversaryEmail } from "@/lib/emailTemplates";
import { prisma } from "@/lib/prisma";

export async function grantAnniversaryPoints() {
  const today = new Date();
  const month = today.getMonth() + 1; // JS months are 0–11
  const day = today.getDate();

  // Find employees with anniversaries
  const anniversaryUsers = await prisma.user.findMany({
    where: { workAnniversary: { not: null } },
  });

  const matchingUsers = anniversaryUsers.filter((u) => {
    if (!u.workAnniversary) return false;
    const ann = new Date(u.workAnniversary);
    return ann.getMonth() + 1 === month && ann.getDate() === day;
  });

  if (matchingUsers.length === 0) {
    console.log("🎂 No anniversaries today.");
    return;
  }

  for (const u of matchingUsers) {
    const years =
      today.getFullYear() - new Date(u.workAnniversary!).getFullYear();

    const senderId = process.env.SYSTEM_ADMIN_ID;

    if (!senderId) {
      console.log("No System Admin Id to post with.");
      return;
    }
    // Create recognition for each employee
    await prisma.recognition.create({
      data: {
        senderId: senderId, // must be a valid User.id
        message: `Happy Work Anniversary! 🎉 `,
        recipients: {
          create: {
            recipientId: u.id,
            points: 500,
          },
        },
      },
    });

    // Increment their balance
    await prisma.user.update({
      where: { id: u.id },
      data: { pointsBalance: { increment: 500 } },
    });

    console.log(
      `🎉 Granted 500 anniversary points to ${u.email} (${years} yrs)`
    );
  }

  // Send one email to all anniversary users (parallel)
  await Promise.all(
    matchingUsers
      .filter((u) => u.emailNotifications)
      .map((u) => sendWorkAnniversaryEmail(u.email))
  );

  console.log(`✅ Finished processing ${matchingUsers.length} anniversaries`);
}

// grantAnniversaryPoints().finally(() => prisma.$disconnect());
