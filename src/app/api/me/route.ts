// src/app/api/me/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      birthday: true,
      preferredName: true,
      workAnniversary: true,
      department: true,
      role: true,
      emailNotifications: true,
      profileImage: true,
      nominationsAsNominee: false, // don’t need this here
      submittedNominations: {
        include: {
          challenge: { select: { id: true, title: true, points: true, hideStatusFromSubmitter: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return NextResponse.json(user);
}
