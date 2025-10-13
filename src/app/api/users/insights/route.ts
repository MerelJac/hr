import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });

  const points = user?.pointsBalance ?? 0;

  const recentChallenges = await prisma.nominationChallenge.findMany({
    where: {
      nominations: { some: { nomineeId: userId } },
      endDate: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    },
    take: 3,
    orderBy: { endDate: "desc" },
  });

  const recentReceived = await prisma.recognition.findFirst({
    where: { recipients: { some: { recipientId: userId } } },
    include: { sender: true },
    orderBy: { createdAt: "desc" },
  });

  const recentGiven = await prisma.recognition.findFirst({
    where: { senderId: userId },
    include: { recipients: { include: { recipient: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    user,
    points,
    recentChallenges,
    recentReceived: recentReceived
      ? {
          message: recentReceived.message,
          createdAt: recentReceived.createdAt,
          senderName: `${recentReceived.sender.firstName} ${recentReceived.sender.lastName}`,
        }
      : null,
    recentGiven: recentGiven
      ? {
          message: recentGiven.message,
          createdAt: recentGiven.createdAt,
          recipientName: recentGiven.recipients[0]?.recipient?.firstName,
        }
      : null,
  });
}
