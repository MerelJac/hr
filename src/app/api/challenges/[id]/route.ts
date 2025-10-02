import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Awaited<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if ((session?.user as User)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const challenge = await prisma.nominationChallenge.update({
    where: { id: params.id },
    data: {
      title: body.title,
      description: body.description,
      qualification: body.qualification,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      isActive: body.isActive ?? true,
      gifUrl: body.gifUrl ?? null,
      points: body.points ?? 0,
      requirements: body.requirements ?? {},
    },
  });

  return NextResponse.json(challenge);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Awaited<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if ((session?.user as User)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.nominationChallenge.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
