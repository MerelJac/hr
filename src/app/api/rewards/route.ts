import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all rewards
export async function GET() {
  const rewards = await prisma.rewardCatalog.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(rewards);
}

// CREATE reward
export async function POST(req: Request) {
  try {
    const { label, categoryId, valueCents, pointsCost, isActive } =
      await req.json();

    const reward = await prisma.rewardCatalog.create({
      data: {
        label,
        categoryId,
        valueCents,
        pointsCost,
        isActive,
        type: "AMAZON", // 👈 TODO: adjust if you want this selectable
      },
    });
    return NextResponse.json(reward);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
