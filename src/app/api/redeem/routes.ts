import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";
import { handleApiError } from "@/lib/handleApiError";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as User;
  if (!user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, amount, deliverEmail, idemKey } = await req.json();
  if (!type || !amount)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // $1 = 10 points
  const pointsCost = amount * 10;
  if (amount < 10 || amount % 5 !== 0) {
    return NextResponse.json(
      { error: "Minimum $10, increments of $5" },
      { status: 400 }
    );
  }

  try {
    const redemption = await prisma.$transaction(async (tx) => {
      const me = await tx.user.findUnique({ where: { id: user.id } });
      if (!me || me.pointsBalance < pointsCost)
        throw new Error("Not enough points");

      // Deduct points
      await tx.user.update({
        where: { id: user.id },
        data: { pointsBalance: { decrement: pointsCost } },
      });

      // Find the “custom catalog” template for this type
      const catalog = await tx.rewardCatalog.findFirst({
        where: { type, label: { endsWith: "Custom" } },
      });
      if (!catalog) throw new Error("No catalog template found");

      if (!user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Create redemption
      return tx.redemption.create({
        data: {
          userId: user.id,
          catalogId: catalog.id,
          type,
          valueCents: amount * 100,
          pointsSpent: pointsCost,
          deliverEmail: deliverEmail ?? me.email,
          idemKey,
          status: "PENDING",
        },
      });
    });

    return NextResponse.json({ ok: true, redemption });
  } catch (e: unknown) {
    return handleApiError(e);
  }
}
