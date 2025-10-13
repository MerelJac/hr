import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { name } = await req.json();
  const updated = await prisma.department.update({
    where: { id: params.id },
    data: { name },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.department.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
