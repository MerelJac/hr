// src/app/api/leaderboard/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as User)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "people";
  const start = searchParams.get("start")
    ? new Date(searchParams.get("start")!)
    : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const end = searchParams.get("end")
    ? new Date(searchParams.get("end")!)
    : new Date();

  // 🏢 Department leaderboard
  if (type === "departments") {
    const deptPoints = await prisma.recognitionRecipient.groupBy({
      by: ["recipientId"],
      _sum: { points: true },
      where: {
        createdAt: { gte: start, lte: end },
        recognition: {
          senderId: { not: process.env.SYSTEM_ADMIN_ID }, // ✅ exclude system admin's shoutouts
        },
      },
    });

    // Look up recipients with departments
    const recipients = await prisma.user.findMany({
      where: {
        id: { in: deptPoints.map((r) => r.recipientId) },
        departmentId: { not: null },
      },
      select: {
        id: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
      },
    });

    // Aggregate points by department
    const totals: Record<
      string,
      { id: string; name: string; totalPoints: number }
    > = {};
    for (const r of deptPoints) {
      const u = recipients.find((x) => x.id === r.recipientId);
      if (u?.department) {
        const key = u.department.id;
        totals[key] ??= {
          id: u.department.id,
          name: u.department.name,
          totalPoints: 0,
        };
        totals[key].totalPoints += r._sum.points || 0;
      }
    }

    const departments = Object.values(totals)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);

    return NextResponse.json({ departments });
  }

  // 1. Most points received
  const receivedRaw = await prisma.recognitionRecipient.groupBy({
    by: ["recipientId"],
    _sum: { points: true },
    where: {
      createdAt: { gte: start, lte: end },
      recognition: {
        senderId: { not: process.env.SYSTEM_ADMIN_ID }, // ✅ exclude system admin's shoutouts
      },
    },
    orderBy: { _sum: { points: "desc" } },
    take: 10,
  });

  const receivedUsers = await prisma.user.findMany({
    where: { id: { in: receivedRaw.map((r) => r.recipientId) } },
    select: {
      id: true,
      firstName: true,
      preferredName: true,
      profileImage: true,
    },
  });

  const received = receivedRaw.map((r) => ({
    user: receivedUsers.find((u) => u.id === r.recipientId) || null,
    points: r._sum.points || 0,
  }));

  // 2. Most points given
  const topSenders = await prisma.recognition.groupBy({
    by: ["senderId"],
    _count: {
      senderId: true,
    },
    where: {
      createdAt: { gte: start, lte: end },
      senderId: { not: process.env.SYSTEM_ADMIN_ID },
    },
    orderBy: {
      _count: {
        senderId: "desc",
      },
    },
    take: 10,
  });

  const pointsBySender = await prisma.recognitionRecipient.groupBy({
    by: ["recognitionId"],
    _sum: {
      points: true,
    },
    where: {
      recognition: {
        senderId: { in: topSenders.map((s) => s.senderId) },
        createdAt: { gte: start, lte: end },
      },
    },
  });

  const senderPoints: Record<string, number> = {};

  for (const row of pointsBySender) {
    const recognition = await prisma.recognition.findUnique({
      where: { id: row.recognitionId },
      select: { senderId: true },
    });

    if (!recognition) continue;

    senderPoints[recognition.senderId] =
      (senderPoints[recognition.senderId] ?? 0) + (row._sum.points ?? 0);
  }

  const givenUsers = await prisma.user.findMany({
    where: { id: { in: Object.keys(senderPoints) } },
    select: {
      id: true,
      firstName: true,
      preferredName: true,
      profileImage: true,
    },
  });

  const given = topSenders.map((s) => ({
    user: givenUsers.find((u) => u.id === s.senderId) || null,
    points: senderPoints[s.senderId] ?? 0,
  }));

  // 3. Most shoutouts given
  const shoutoutsGivenRaw = await prisma.recognition.groupBy({
    by: ["senderId"],
    _count: { senderId: true },
    where: {
      createdAt: { gte: start, lte: end },
      senderId: { not: process.env.SYSTEM_ADMIN_ID },
    },
    orderBy: { _count: { senderId: "desc" } },
    take: 10,
  });

  const shoutoutsGivenUsers = await prisma.user.findMany({
    where: { id: { in: shoutoutsGivenRaw.map((r) => r.senderId) } },
    select: {
      id: true,
      firstName: true,
      preferredName: true,
      profileImage: true,
    },
  });

  const shoutoutsGiven = shoutoutsGivenRaw.map((r) => ({
    user: shoutoutsGivenUsers.find((u) => u.id === r.senderId) || null,
    count: r._count.senderId,
  }));

  // 4. Most shoutouts received
  const shoutoutsReceivedRaw = await prisma.recognitionRecipient.groupBy({
    by: ["recipientId"],
    _count: { recipientId: true },
    where: {
      createdAt: { gte: start, lte: end },
      recognition: {
        senderId: { not: process.env.SYSTEM_ADMIN_ID }, // ✅ exclude system admin's shoutouts
      },
    },
    orderBy: { _count: { recipientId: "desc" } },
    take: 10,
  });

  const shoutoutsReceivedUsers = await prisma.user.findMany({
    where: { id: { in: shoutoutsReceivedRaw.map((r) => r.recipientId) } },
    select: {
      id: true,
      firstName: true,
      preferredName: true,
      profileImage: true,
    },
  });

  const shoutoutsReceived = shoutoutsReceivedRaw.map((r) => ({
    user: shoutoutsReceivedUsers.find((u) => u.id === r.recipientId) || null,
    count: r._count.recipientId,
  }));

  return NextResponse.json({
    received,
    given,
    shoutoutsGiven,
    shoutoutsReceived,
  });
}
