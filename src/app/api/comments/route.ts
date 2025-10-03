import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";
import { handleApiError } from "@/lib/handleApiError";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { recognitionId, recipientId, message, pointsBoosted } =
      await req.json();
    const senderId = (session.user as User).id;

    console.log("senderId", senderId, "recip id", recipientId);
    return await prisma.$transaction(async (tx) => {
      let boost = 0;
      if (pointsBoosted && pointsBoosted > 0) {
        // decrement sender balance
        const updated = await tx.user.update({
          where: { id: senderId },
          data: { pointsBalance: { decrement: pointsBoosted } },
        });
        if (updated.pointsBalance < 0) {
        return NextResponse.json({ error: "Not enough points" }, { status: 400 });
        }

        // increment recipient balance
        if (recipientId) {
          await tx.user.update({
            where: { id: recipientId },
            data: { pointsBalance: { increment: pointsBoosted } },
          });
        }

        boost = pointsBoosted;
      }

      if (!senderId) throw { status: 400, message: "senderId is required" };

      const comment = await tx.recognitionComment.create({
        data: {
          recognitionId,
          senderId,
          recipientId,
          message,
          pointsBoosted: boost,
        },
        include: {
          sender: { select: { firstName: true, lastName: true, email: true } },
          recipient: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      });

      return NextResponse.json(comment);
    });
  } catch (e: unknown) {
    return handleApiError(e);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const recognitionId = searchParams.get("recognitionId");
  if (!recognitionId) {
    return NextResponse.json(
      { error: "recognitionId required" },
      { status: 400 }
    );
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
