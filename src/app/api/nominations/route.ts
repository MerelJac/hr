// src/app/api/nominations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { monthKeyFromDate } from "@/lib/nomination-constants";
import { User } from "@/types/user";
import { ChallengeRequirements } from "@/types/challenge";
import { sendNewSubmissionEmail } from "@/lib/emailTemplates";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const submitterId = (session?.user as User)?.id;
  if (!submitterId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challengeId, nomineeId, reason, screenshot } = await req.json();
  const challenge = await prisma.nominationChallenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge)
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  const now = new Date();
  if (
    !challenge.isActive ||
    challenge.startDate > now ||
    challenge.endDate < now
  ) {
    return NextResponse.json(
      { error: "Challenge not currently active" },
      { status: 400 }
    );
  }

  const monthKey = monthKeyFromDate();
  const existing = await prisma.nomination.findFirst({
    where: { submitterId, challengeId, monthKey },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Already submitted this challenge this month" },
      { status: 409 }
    );
  }
  
  // enforce challenge requirements
  const reqs = (challenge.requirements ?? {}) as ChallengeRequirements;
  if (reqs.requiresNominee && !nomineeId)
    return NextResponse.json({ error: "Nominee required" }, { status: 400 });
  if (reqs.requiresReason && !reason)
    return NextResponse.json({ error: "Reason required" }, { status: 400 });
  if (reqs.requiresScreenshot && !screenshot)
    return NextResponse.json({ error: "Screenshot required" }, { status: 400 });

  const nomination = await prisma.nomination.create({
    data: {
      submitterId,
      challengeId,
      nomineeId: nomineeId || null,
      reason,
      monthKey,
      screenshot,
      status: "PENDING", // always pending, admin reviews
    },
  });

  try {
    // Send email to HR
    const hrEmail = process.env.HR_EMAIL ?? null;
    if (hrEmail) {
      await sendNewSubmissionEmail(hrEmail, challengeId);
      console.error("Sending submission email", hrEmail);
    }
  } catch (err) {
    console.error("❌ Error sending submission email:", err);
  }

  return NextResponse.json(nomination);
}
