import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendAdminRedemptionEmail } from "@/lib/email";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, amount, deliverEmail, idemKey } = await req.json();
  if (!type || !amount || amount < 10 || amount % 5 !== 0) {
    return NextResponse.json({ error: "Invalid redemption request" }, { status: 400 });
  }

  const pointsCost = amount * 10;
  const valueCents = amount * 100;

  try {
    const redemption = await prisma.$transaction(async (tx) => {
      const dbUser = await tx.user.findUnique({ where: { id: user.id } });
      if (!dbUser) throw new Error("User not found");
      if (dbUser.pointsBalance < pointsCost) throw new Error("Insufficient points");

      if (idemKey) {
        const existing = await tx.redemption.findUnique({ where: { idemKey } });
        if (existing) return existing;
      }

      const r = await tx.redemption.create({
        data: {
          userId: user.id,
          type,
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

    // Notify admin = TODO enable
    // await sendAdminRedemptionEmail(user.email, type, deliverEmail);

    return NextResponse.json({ ok: true, redemption });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to redeem" }, { status: 400 });
  }
}
