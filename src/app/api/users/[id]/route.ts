// src/app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireSuper() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === "SUPER_ADMIN" ? session : null;
}

// Update role OR active flag
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // 👈 params is async
) {
  const { id } = await params; // 👈 await here
  const userId = id;

  const session = await requireSuper();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { role, isActive } = await req.json().catch(() => ({}));
  if (role === undefined && isActive === undefined) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  const data: any = {};
  if (role) data.role = role;
  if (typeof isActive === "boolean") data.isActive = isActive;

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data,
      select: { id: true, isActive: true },
    });

    if (!updated.isActive) {
      await tx.session.deleteMany({ where: { userId } });
    }

    return updated;
  });

  return NextResponse.json({ ok: true, user: result });
}


export async function DELETE(
  _req: Request,
{ params }: { params: Promise<{ id: string }> } 
) {
  const { id } = await params;
  const userId = id;

  const session = await requireSuper();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.$transaction(async (tx) => {
    // ✅ delete related sessions first
    await tx.session.deleteMany({ where: { userId } });

    // ✅ then delete the user profile entirely
    await tx.user.delete({
      where: { id: userId },
    });
  });

  return NextResponse.json({ ok: true });
}
