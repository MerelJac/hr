import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";

// delete route
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const senderId = req.nextUrl.searchParams.get("senderId");
  const id = params.id;

  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user as User;

  // SUPER_ADMIN OR original sender
  if (loggedInUser.role !== "SUPER_ADMIN" && loggedInUser.id !== senderId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.recognition.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
