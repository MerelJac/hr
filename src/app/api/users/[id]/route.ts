import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await _req.json();
  const { role } = body || {};
  if (!role) return NextResponse.json({ error: "Role required" }, { status: 400 });

  const user = await prisma.user.update({ where: { id: params.id }, data: { role } });
  return NextResponse.json(user);
}
