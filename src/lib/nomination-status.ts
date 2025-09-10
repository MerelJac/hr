import { prisma } from "@/lib/prisma";
import { monthKeyFromDate } from "@/lib/nomination-constants";

export async function getMyMonthlyNominationFlags(userId: string) {
  const monthKey = monthKeyFromDate();
  const rows = await prisma.nomination.findMany({
    where: { submitterId: userId, monthKey },
    select: { type: true },
  });
  const set = new Set(rows.map(r => r.type));
  return { hasEom: set.has("EOM"), hasLinkedIn: set.has("LINKEDIN"), monthKey };
}
