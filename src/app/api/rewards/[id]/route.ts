import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";
import { handleApiError } from "@/lib/handleApiError";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as User)?.role;
  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { label, categoryId, valueCents, pointsCost, isActive } = await req.json();

    const reward = await prisma.rewardCatalog.update({
      where: { id: params.id },
      data: { label, categoryId, valueCents, pointsCost, isActive },
    });

    return NextResponse.json(reward);
  } catch (e: unknown) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as User)?.role;
  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.rewardCatalog.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return handleApiError(e);
  }
}
