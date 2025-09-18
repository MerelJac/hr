import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
     const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recognitionId, recipientId, message, pointsBoosted } = await req.json();
  const senderId = (session.user as any).id;

  console.log('senderId', senderId, 'recip id', recipientId)
  return await prisma.$transaction(async (tx) => {
    let boost = 0;
    if (pointsBoosted && pointsBoosted > 0) {
      // decrement sender balance
      const updated = await tx.user.update({
        where: { id: senderId },
        data: { pointsBalance: { decrement: pointsBoosted } },
      });
      if (updated.pointsBalance < 0) throw new Error("Not enough points");

      // increment recipient balance
      if (recipientId) {
        await tx.user.update({
          where: { id: recipientId },
          data: { pointsBalance: { increment: pointsBoosted } },
        });
      }

      boost = pointsBoosted;
    }

    const comment = await tx.recognitionComment.create({
      data: { recognitionId, senderId, recipientId, message, pointsBoosted: boost },
      include: {
        sender: { select: { firstName: true, lastName: true, email: true } },
        recipient: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    return NextResponse.json(comment);
  });
  } catch (e: any) {
    console.error("POST /api/comments failed:", e);

    // Prisma errors often have code + meta
    if (e.code === "P2025") {
      return NextResponse.json({ error: "Record not found", detail: e.meta }, { status: 404 });
    }

    if (e.message === "Not enough points") {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal Server Error", detail: e.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const recognitionId = searchParams.get("recognitionId");
  if (!recognitionId) {
    return NextResponse.json({ error: "recognitionId required" }, { status: 400 });
  }

  const comments = await prisma.recognitionComment.findMany({
    where: { recognitionId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { firstName: true, lastName: true, email: true } },
      recipient: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  return NextResponse.json(comments);
}
