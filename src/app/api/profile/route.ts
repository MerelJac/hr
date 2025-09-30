import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";
import { handleApiError } from "@/lib/handleApiError";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as User)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { birthday, preferredName } = body;

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        birthday: birthday ? new Date(birthday) : null,
        preferredName: preferredName ?? null,
      },
      select: {
        id: true,
        birthday: true,
        preferredName: true,
      },
    });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    return handleApiError(e);
  }
}
