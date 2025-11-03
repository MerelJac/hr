import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChallengeList from "./challenge-list";
import { User } from "@/types/user";
import { Challenge, ChallengeRequirements } from "@/types/challenge";

export default async function ChallengesAdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as User)?.role;

  if (role !== "SUPER_ADMIN") {
    return <div className="p-6">Forbidden</div>;
  }

  const rawChallenges = await prisma.nominationChallenge.findMany({
    orderBy: [
      { isActive: "desc" }, // ✅ true (active) first, false (inactive) later
      { createdAt: "desc" }, // ✅ then newest first
    ],
    select: {
      id: true,
      title: true,
      description: true,
      qualification: true,
      isActive: true,
      startDate: true,
      endDate: true,
      gifUrl: true,
      points: true,
      requirements: true,
      nominations: {
        select: { id: true, status: true },
      },
      hideStatusFromSubmitter: true,
      allowMultipleWinners: true,
    },
  });

  // Transform into Challenge[] with safe requirements
  const challenges: Challenge[] = rawChallenges.map((c) => ({
    ...c,
    requirements: (c.requirements as ChallengeRequirements | null) ?? {}, // normalize
  }));

  return (
    <main className="space-y-4 bg-white rounded-xl h-full">
      <header className="p-6 shadow-md">
        <h1 className="text-2xl font-semibold">Challenges</h1>
      </header>
      <ChallengeList challenges={challenges} />
    </main>
  );
}
