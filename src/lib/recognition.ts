import { prisma } from "@/lib/prisma";

// export async function getAvailablePoints(senderId: string) {
//   const user = await prisma.user.findUnique({
//     where: { id: senderId },
//     select: { monthlyBudget: true },
//   });
//   if (!user) return 0;

//   const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

//   // Sum points sent by this user in the last 30 days
//   const sent = await prisma.recognitionRecipient.aggregate({
//     _sum: { points: true },
//     where: {
//       recognition: { senderId, createdAt: { gte: since } },
//     },
//   });

//   const spent = sent._sum.points ?? 0;
//   return Math.max(0, user.monthlyBudget - spent);
// }
export async function getAvailablePoints(senderId: string) {
  const user = await prisma.user.findUnique({
    where: { id: senderId },
    select: { monthlyBudget: true },
  });
  if (!user) return 0;

  return user.monthlyBudget;
}
