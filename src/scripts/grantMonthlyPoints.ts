// src/scripts/grantMonthlyPoints.ts
// Run with: npx tsx src/scripts/grantMonthlyPoints.ts
import { sendMonthlyPointsNotification } from "@/lib/emailTemplates";
import { prisma } from "@/lib/prisma";

export async function grantMonthlyPoints() {
  // Fetch all active employees with email preferences
  const employees = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, email: true, isActive: true, emailNotifications: true, monthlyBudget: true },
  });

  // Filter users whose budget is below 50
  const belowThreshold = employees.filter((u) => (u.monthlyBudget ?? 0) < 50);

  if (belowThreshold.length === 0) {
    console.log("✅ All employees already have at least 50 monthly points");
    return;
  }

  // Update only those users
  const result = await prisma.user.updateMany({
    where: { monthlyBudget: { lt: 50 } },
    data: { monthlyBudget: 50 },
  });

  // Send emails to those who opted in
  await Promise.all(
    belowThreshold
      .filter((u) => u.emailNotifications && u.email)
      .map((u) => sendMonthlyPointsNotification(u.email))
  );

  console.log(`✅ Updated ${result.count} employees' monthly points to at least 50`);
}

// grantMonthlyPoints().finally(() => prisma.$disconnect());
