// src/scripts/grantAnniversaryPoints.ts
// Run with: npx tsx src/scripts/grantAnniversaryPoints.ts

import {
  sendAnniversaryAnnouncementEmail,
  sendWorkAnniversaryEmail,
} from "@/lib/emailTemplates";
import { prisma } from "@/lib/prisma";

export async function grantAnniversaryPoints() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // Find employees with anniversaries
  const anniversaryUsers = await prisma.user.findMany({
    where: { workAnniversary: { not: null } },
  });

  // Match anniversaries for today
  const matchingUsers = anniversaryUsers.filter((u) => {
    if (!u.workAnniversary) return false;
    const ann = new Date(u.workAnniversary);
    return ann.getMonth() + 1 === month && ann.getDate() === day;
  });

  if (matchingUsers.length === 0) {
    console.log("🎉 No anniversaries today.");
    return;
  }

  const senderId = process.env.SYSTEM_ADMIN_ID;
  if (!senderId) {
    console.log("❌ No System Admin ID to post with.");
    return;
  }

  const anniversaries: Record<string, string> = {};

  for (const u of matchingUsers) {
    const years =
      today.getFullYear() - new Date(u.workAnniversary!).getFullYear();

    // Create recognition post
    const recognition = await prisma.recognition.create({
      data: {
        senderId,
        message: `Happy ${years} Year Work Anniversary! 🎉`,
        recipients: {
          create: {
            recipientId: u.id,
            points: 500,
          },
        },
      },
    });

    // Save recognition ID for announcements
    anniversaries[u.id] = recognition.id;

    // Increment balance
    await prisma.user.update({
      where: { id: u.id },
      data: { pointsBalance: { increment: 500 } },
    });

    console.log(
      `🎉 Granted 500 anniversary points to ${u.email} (${years} yrs)`
    );
  }

  // Send personalized work anniversary emails
  await Promise.all(
    matchingUsers
      .filter((u) => u.emailNotifications)
      .map((u) => sendWorkAnniversaryEmail(u.email, anniversaries[u.id]))
  );

  // Notify everyone else
  const allUsers = await prisma.user.findMany({
    where: { emailNotifications: true },
  });

  const nonAnniversaryUsers = allUsers.filter(
    (u) => !matchingUsers.some((b) => b.id === u.id)
  );

  await Promise.all(
    nonAnniversaryUsers.map((u) =>
      sendAnniversaryAnnouncementEmail(
        u.email,
        matchingUsers.map((b) => ({
          name: b.firstName ?? "Team Member",
          recognitionId: anniversaries[b.id],
        }))
      )
    )
  );

  console.log(`✅ Finished processing ${matchingUsers.length} anniversaries.`);
}
