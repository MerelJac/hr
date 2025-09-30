// src/app/api/leaderboard/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start")
    ? new Date(searchParams.get("start")!)
    : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const end = searchParams.get("end") ? new Date(searchParams.get("end")!) : new Date();

  // 1. Most points received
  const receivedRaw = await prisma.recognitionRecipient.groupBy({
    by: ["recipientId"],
    _sum: { points: true },
    where: { createdAt: { gte: start, lte: end } },
    orderBy: { _sum: { points: "desc" } },
    take: 10,
  });

  const receivedUsers = await prisma.user.findMany({
    where: { id: { in: receivedRaw.map(r => r.recipientId) } },
    select: { id: true, firstName: true, preferredName: true, profileImage: true },
  });

  const received = receivedRaw.map(r => ({
    user: receivedUsers.find(u => u.id === r.recipientId) || null,
    points: r._sum.points || 0,
  }));

  // 2. Most points given
  const givenRaw = await prisma.recognitionRecipient.groupBy({
    by: ["recipientId"], // ⚠️ may want recognition.senderId instead
    _sum: { points: true },
    where: { recognition: { createdAt: { gte: start, lte: end } } },
    orderBy: { _sum: { points: "desc" } },
    take: 10,
  });

  const givenUsers = await prisma.user.findMany({
    where: { id: { in: givenRaw.map(r => r.recipientId) } },
    select: { id: true, firstName: true, preferredName: true, profileImage: true },
  });

  const given = givenRaw.map(r => ({
    user: givenUsers.find(u => u.id === r.recipientId) || null,
    points: r._sum.points || 0,
  }));

  // 3. Most shoutouts given
  const shoutoutsGivenRaw = await prisma.recognition.groupBy({
    by: ["senderId"],
    _count: { senderId: true },
    where: { createdAt: { gte: start, lte: end } },
    orderBy: { _count: { senderId: "desc" } },
    take: 10,
  });

  const shoutoutsGivenUsers = await prisma.user.findMany({
    where: { id: { in: shoutoutsGivenRaw.map(r => r.senderId) } },
    select: { id: true, firstName: true, preferredName: true, profileImage: true },
  });

  const shoutoutsGiven = shoutoutsGivenRaw.map(r => ({
    user: shoutoutsGivenUsers.find(u => u.id === r.senderId) || null,
    count: r._count.senderId,
  }));

  // 4. Most shoutouts received
  const shoutoutsReceivedRaw = await prisma.recognitionRecipient.groupBy({
    by: ["recipientId"],
    _count: { recipientId: true },
    where: { createdAt: { gte: start, lte: end } },
    orderBy: { _count: { recipientId: "desc" } },
    take: 10,
  });

  const shoutoutsReceivedUsers = await prisma.user.findMany({
    where: { id: { in: shoutoutsReceivedRaw.map(r => r.recipientId) } },
    select: { id: true, firstName: true, preferredName: true, profileImage: true },
  });

  const shoutoutsReceived = shoutoutsReceivedRaw.map(r => ({
    user: shoutoutsReceivedUsers.find(u => u.id === r.recipientId) || null,
    count: r._count.recipientId,
  }));

  return NextResponse.json({ received, given, shoutoutsGiven, shoutoutsReceived });
}
