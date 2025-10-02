import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/handleApiError";

// UPDATE category
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name } = await req.json();
    const cat = await prisma.rewardCategory.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(cat);
  } catch (e: unknown) {
    return handleApiError(e);
  }
}

// DELETE category
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.rewardCategory.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return handleApiError(e);
  }
}
