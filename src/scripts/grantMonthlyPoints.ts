// src/scripts/grantMonthlyPoints.ts
// Run with: npx tsx src/scripts/grantMonthlyPoints.ts

import { prisma } from "@/lib/prisma";

async function grantMonthlyPoints() {
  const result = await prisma.user.updateMany({
    where: { role: "EMPLOYEE" }, // Only employees
    data: { monthlyBudget: 50 }, // Reset to 50, will not exceed 50
  });

  console.log(`✅ Reset ${result.count} employees' monthly points to 50`);
}

grantMonthlyPoints().finally(() => prisma.$disconnect());
