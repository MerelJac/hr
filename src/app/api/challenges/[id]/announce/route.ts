import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: challengeId } = await params;
  const session = await getServerSession(authOptions);

  if ((session?.user as User)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const senderId = process.env.SYSTEM_ADMIN_ID || (session?.user as User)?.id;
  if (!senderId) {
    return NextResponse.json(
      { error: "SYSTEM_ADMIN_ID not set" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { message, gifUrl, winners, points = 0 } = body;

  if (!Array.isArray(winners) || winners.length === 0) {
    return NextResponse.json({ error: "No winners provided" }, { status: 400 });
  }

  // ✅ Update nominations first (mark as WON)
  await prisma.nomination.updateMany({
    where: {
      challengeId,
      nomineeId: { in: winners },
    },
    data: { status: "WON" },
  });

  // ✅ Create one recognition post per winner
  for (const winnerId of winners) {
    const user = await prisma.user.findUnique({ where: { id: winnerId } });
    if (!user) {
      console.warn(`⚠️ Skipping invalid winner ID: ${winnerId}`);
      continue;
    }

    await prisma.recognition.create({
      data: {
        senderId,
        message,
        gifUrl,
        recipients: {
          create: {
            recipientId: winnerId,
            points,
          },
        },
      },
    });
    
    // Give the winner their points!
    await prisma.user.update({
      where: { id: winnerId },
      data: { pointsBalance: { increment: points } },
    });
  }

  return NextResponse.json({ ok: true });
}
