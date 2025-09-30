import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if ((session?.user as User)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status } = await req.json();

  // validate input
  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const nomination = await prisma.nomination.findUnique({
    where: { id: params.id },
    include: { challenge: true, submitter: true, nominee: true },
  });

  if (!nomination) {
    return NextResponse.json({ error: "Nomination not found" }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedNomination = await tx.nomination.update({
      where: { id: params.id },
      data: { status },
    });

    if (status === "APPROVED") {
      // Award points to the submitter or nominee
      const awardToUserId = nomination.nomineeId || nomination.submitterId;
      await tx.user.update({
        where: { id: awardToUserId },
        data: { pointsBalance: { increment: nomination.challenge.points } },
      });
    }

    return updatedNomination;
  });

  return NextResponse.json(updated);
}
