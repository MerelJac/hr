import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { emailNotifications } = await req.json();

  await prisma.user.update({
    where: { email: session.user.email },
    data: { emailNotifications },
  });

  return NextResponse.json({ success: true });
}
