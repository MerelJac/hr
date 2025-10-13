import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { name } = await req.json();
  const { id } = await params;
  const updated = await prisma.department.update({
    where: { id: id },
    data: { name },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.department.delete({ where: { id: id } });
  return NextResponse.json({ ok: true });
}
