import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";   // your singleton client
import { Prisma, Role } from "@prisma/client"; // Prisma types & enums


async function requireSuper() {
  const session = await getServerSession(authOptions);
  type UserWithRole = { role?: string };
  return (session?.user as UserWithRole)?.role === "SUPER_ADMIN" ? session : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  const session = await requireSuper();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // build update data object
  const data: Prisma.UserUpdateInput = {}; // ✅ use Prisma type

  if (body.role) {
    // cast incoming string to Role enum
    if (Object.values(Role).includes(body.role)) {
      data.role = body.role as Role;
    } else {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
  }
  
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;

  if (body.firstName !== undefined) data.firstName = body.firstName;
  if (body.lastName !== undefined) data.lastName = body.lastName;
  if (body.preferredName !== undefined) data.preferredName = body.preferredName;
  if (body.department !== undefined) data.department = body.department;
  if (body.birthday) data.birthday = new Date(body.birthday);
  if (body.workAnniversary) data.workAnniversary = new Date(body.workAnniversary);
    if (body.isActive !== undefined) data.isActive = body.isActive;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data,
    });

    // if user is deactivated, clear their sessions
    if (data.isActive === false) {
      await tx.session.deleteMany({ where: { userId } });
    }

    return updated;
  });

  return NextResponse.json({ ok: true, user: result });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const userId = params.id;

  const session = await requireSuper();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.session.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });

  return NextResponse.json({ ok: true });
}
