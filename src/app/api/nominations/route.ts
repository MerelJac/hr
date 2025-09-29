// src/app/api/nominations/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { monthKeyFromDate } from "@/lib/nomination-constants";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const submitterId = (session?.user as any)?.id;
  if (!submitterId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challengeId, nomineeId, reason } = await req.json();
  const challenge = await prisma.nominationChallenge.findUnique({ where: { id: challengeId } });

  if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  const now = new Date();
  if (!challenge.isActive || challenge.startDate > now || challenge.endDate < now) {
    return NextResponse.json({ error: "Challenge not currently active" }, { status: 400 });
  }

  const monthKey = monthKeyFromDate();
  const existing = await prisma.nomination.findFirst({
    where: { submitterId, challengeId, monthKey },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ error: "Already submitted this challenge this month" }, { status: 409 });
  }

  // enforce challenge requirements
  const reqs = (challenge.requirements ?? {}) as any;
  if (reqs.requiresNominee && !nomineeId) return NextResponse.json({ error: "Nominee required" }, { status: 400 });
  if (reqs.requiresReason && !reason) return NextResponse.json({ error: "Reason required" }, { status: 400 });

  const nomination = await prisma.nomination.create({
    data: {
      submitterId,
      challengeId,
      nomineeId,
      reason,
      monthKey,
      status: "PENDING", // always pending, admin reviews
    },
  });

  return NextResponse.json(nomination);
}
