import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";
import { Nomination } from "@/types/nomination";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if ((session?.user as User)?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status }: { status: Nomination["status"] } = await req.json();

  // validate input
  if (!["APPROVED", "REJECTED", "WON"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const nomination = await prisma.nomination.findUnique({
    where: { id },
    include: { challenge: true, submitter: true, nominee: true },
  });

  if (!nomination) {
    return NextResponse.json(
      { error: "Nomination not found" },
      { status: 404 }
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedNomination = await tx.nomination.update({
      where: { id },
      data: { status },
    });

    if (status === "APPROVED" && nomination.challenge) {
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
