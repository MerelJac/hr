import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/handleApiError";

// GET all categories
export async function GET() {
  const categories = await prisma.rewardCategory.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

// CREATE new category
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    const cat = await prisma.rewardCategory.create({
      data: { name },
    });
    return NextResponse.json(cat);
  } catch (e: unknown) {
      return handleApiError(e);
    }
}
