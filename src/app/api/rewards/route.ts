import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/handleApiError";

// GET all rewards
export async function GET() {
  const rewards = await prisma.rewardCatalog.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(rewards);
}

// CREATE reward
export async function POST(req: NextRequest) {
  try {
    const { label, categoryId, valueCents, pointsCost, isActive } =
      await req.json();

    const reward = await prisma.rewardCatalog.create({
      data: {
        label,
        categoryId,
        valueCents,
        pointsCost,
        isActive
      },
    });
    return NextResponse.json(reward);
  } catch (e: unknown) {
      return handleApiError(e);
    }
}
