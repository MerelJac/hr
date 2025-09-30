// src/app/(app)/admin/leaderboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LeaderboardClient from "./leaderboard-client";

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    return <div className="p-6">Forbidden</div>;
  }

  return (
    <main className="bg-white rounded-xl space-y-6">
      <header className="p-6 shadow-md">
        <h1 className="text-2xl font-semibold">Leaderboard</h1>
      </header>
      <LeaderboardClient />
    </main>
  );
}
