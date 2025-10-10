import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 🔐 Get the logged-in user
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 📥 Parse and validate request body
    const { points } = await req.json();
    if (
      typeof points !== "number" ||
      points <= 0 ||
      points % 10 !== 0 ||
      points > 1000
    ) {
      return NextResponse.json(
        { error: "Invalid points amount" },
        { status: 400 }
      );
    }

    // ✅ Fetch user's available redeemable points
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pointsBalance: true, monthlyBudget: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.pointsBalance < points) {
      return NextResponse.json(
        { error: "Not enough points to redeem" },
        { status: 400 }
      );
    }

    // 🪄 Update user: subtract from redeemable, add to give
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        pointsBalance: { decrement: points },
        monthlyBudget: { increment: points },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Redeemed ${points} points successfully.`,
      user: {
        pointsBalance: updated.pointsBalance,
        monthlyBudget: updated.monthlyBudget,
      },
    });
  } catch (err) {
    console.error("Error redeeming points:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
