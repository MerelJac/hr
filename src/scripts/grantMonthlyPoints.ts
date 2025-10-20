// src/scripts/grantMonthlyPoints.ts
// Run with: npx tsx src/scripts/grantMonthlyPoints.ts
import { sendMonthlyPointsNotification } from "@/lib/emailTemplates";
import { prisma } from "@/lib/prisma";

export async function grantMonthlyPoints() {
  // Fetch all employees first
  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: { id: true, email: true, isActive: true },
  });

  // Reset monthly budget for all employees
  const result = await prisma.user.updateMany({
    where: { role: "EMPLOYEE" },
    data: { monthlyBudget: 50 },
  });

  // Send emails in parallel
  await Promise.all(
    employees.map((u) => sendMonthlyPointsNotification(u.email))
  );

  console.log(`✅ Reset ${result.count} employees' monthly points to 50`);
}

// grantMonthlyPoints().finally(() => prisma.$disconnect());
