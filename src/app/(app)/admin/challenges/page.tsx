
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChallengeList from "./challenge-list";

export default async function ChallengesAdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "SUPER_ADMIN") {
    return <div className="p-6">Forbidden</div>;
  }

  const challenges = await prisma.nominationChallenge.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="p-6 space-y-4 bg-white rounded-xl h-full">
      <h1 className="text-2xl font-semibold">Nomination Challenges</h1>
      <ChallengeList challenges={challenges} />
    </main>
  );
}
