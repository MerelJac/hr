import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendRecognitionEmail } from "@/lib/emailTemplates";
import { User } from "@/types/user";
import { handleApiError } from "@/lib/handleApiError";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as User;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { catalogId, pointsCost, deliverEmail, idemKey } = body;

    if (!catalogId || !pointsCost) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔹 Fetch reward to check if it's a Gift Card or custom
    const reward = await prisma.rewardCatalog.findUnique({
      where: { id: catalogId },
      include: { category: true },
    });

    if (!reward)
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });

    // 🔹 Determine conversion
    let valueCents: number | null = null;

    if (reward.category?.name === "Gift Card") {
      // Gift cards use 10 pts = $1
      valueCents = (pointsCost / 10) * 100; // convert points → cents
    } else {
      // Custom rewards: pointsCost *is* the cost, but you can optionally assign a valueCents
      valueCents = reward.valueCents ?? 0;
    }

    // 🔹 Transaction
    const redemption = await prisma.$transaction(async (tx) => {
      const dbUser = await tx.user.findUnique({ where: { id: user.id } });
      if (!dbUser) throw new Error("User not found");
      if (dbUser.pointsBalance < pointsCost)
        throw new Error("Insufficient points");

      if (idemKey) {
        const existing = await tx.redemption.findUnique({ where: { idemKey } });
        if (existing) return existing;
      }

      const r = await tx.redemption.create({
        data: {
          userId: user.id,
          catalogId: reward.id,
          pointsSpent: pointsCost,
          valueCents,
          deliverEmail: deliverEmail ?? dbUser.email,
          provider: process.env.REWARD_PROVIDER || "manual",
          status: "PENDING",
          idemKey,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { pointsBalance: { decrement: pointsCost } },
      });

      return r;
    });

    // 🔹 Notify via email
    if (deliverEmail) {
      await sendRecognitionEmail(deliverEmail);
    }

    return NextResponse.json({ ok: true, redemption });
  } catch (e) {
    return handleApiError(e);
  }
}
