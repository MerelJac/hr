import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { monthKeyFromDate } from "@/lib/nomination-constants";
import NominationModal from "@/components/NominationModal";
import RecognizeFormWrapper from "@/components/RecognizeFormWrapper";
import { LightUser, User } from "@/types/user";
import { Challenge, ChallengeRequirements } from "@/types/challenge";

export default async function RecognizePage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as User;
  if (!me?.id) {
    return <div className="p-6">Please sign in.</div>;
  }

  const monthKey = monthKeyFromDate();

  // find which challenges this user already submitted for this month
  const existing = await prisma.nomination.findMany({
    where: { submitterId: me.id, monthKey },
    select: { challengeId: true },
  });
  const submittedChallengeIds = new Set(existing.map((n) => n.challengeId));

  const [users] = await Promise.all([
    prisma.user.findMany({
      where: { NOT: [{ id: me.id }, { id: process.env.SYSTEM_ADMIN_ID }] },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        preferredName: true,
      },
      orderBy: { email: "asc" },
    }) as Promise<LightUser[]>,
  ]);

  const prismaChallenges = await prisma.nominationChallenge.findMany({
    where: {
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
    orderBy: { startDate: "asc" },
  });

  // filter out challenges already submitted for
  const availableChallenges: Challenge[] = prismaChallenges
    .filter((c) => !submittedChallengeIds.has(c.id))
    .map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description ?? undefined,
      qualification: c.qualification ?? undefined,
      isActive: c.isActive,
      startDate: c.startDate,
      endDate: c.endDate,
      points: c.points,
      gifUrl: c.gifUrl,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      requirements: (c.requirements as ChallengeRequirements) ?? undefined,
    }));

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-row justify-end">
        <NominationModal users={users} challenges={availableChallenges} />
      </div>
      <RecognizeFormWrapper />
    </main>
  );
}
