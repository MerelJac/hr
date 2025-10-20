import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getAvailablePoints } from "@/lib/recognition";
import { User } from "@/types/user";

const schema = z.object({
  message: z.string().min(1).max(500),
  gifUrl: z.string().url().optional().nullable(), // 👈 allow GIF
  recipients: z
    .array(
      z.object({
        userId: z.string().min(1),
        points: z.number().int().positive().max(1000),
      })
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const senderId = (session?.user as User)?.id;
  if (!senderId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { message, gifUrl, recipients } = parsed.data;

  // No self-awards
  if (recipients.some((r) => r.userId === senderId)) {
    return NextResponse.json(
      { error: "Cannot send points to yourself." },
      { status: 400 }
    );
  }

  // Ensure all recipients exist
  const ids = recipients.map((r) => r.userId);
  const found = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  if (found.length !== ids.length) {
    return NextResponse.json(
      { error: "One or more recipients do not exist." },
      { status: 400 }
    );
  }

  // Budget check (rolling 30 days)
  const total = recipients.reduce((sum, r) => sum + r.points, 0);
  const available = await getAvailablePoints(senderId);
  if (total > available) {
    return NextResponse.json(
      { error: `Insufficient points. Available: ${available}`, available },
      { status: 400 }
    );
  }

  // Create recognition + increment piggy banks in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const rec = await tx.recognition.create({
      data: { senderId, message, gifUrl },
    });

    await tx.recognitionRecipient.createMany({
      data: recipients.map((r) => ({
        recognitionId: rec.id,
        recipientId: r.userId,
        points: r.points,
      })),
    });

    // Update recipients' piggy bank balances
    for (const r of recipients) {
      await tx.user.update({
        where: { id: r.userId },
        data: { pointsBalance: { increment: r.points } },
      });
    }

    // Update senders' piggy bank monthyl balances
    await tx.user.update({
      where: { id: senderId },
      data: { monthlyBudget: { decrement: total } },
    });

    return rec;
  });

  return NextResponse.json({ ok: true, id: result.id });
}
