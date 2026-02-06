import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNewChallengeAlert } from "@/lib/emailTemplates";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: challengeId } = await params;

  const challenge = await prisma.nominationChallenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  const employees = await prisma.user.findMany({
    select: { id: true, email: true, isActive: true, emailNotifications: true },
  });

  await Promise.all(
    employees.map((u) => sendNewChallengeAlert(u.email!, challenge.title)),
  );

  return NextResponse.json({ success: true });
}
