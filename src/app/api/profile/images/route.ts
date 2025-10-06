import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as User)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageUrl } = await req.json();
  if (!imageUrl) {
    return NextResponse.json({ error: "Image URL required" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { profileImage: imageUrl },
  });

  return NextResponse.json({
    ok: true,
    profileImage: imageUrl,
    message: "Profile image URL saved.",
  });
}
