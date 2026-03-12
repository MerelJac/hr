// src/app/(app)/admin/leaderboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LeaderboardClient from "./leaderboard-client";
import { User } from "@/types/user";
import { Star } from "lucide-react";

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as User)?.role !== "SUPER_ADMIN") {
    return <div className="p-6">Forbidden</div>;
  }

  return (
    <main className="bg-white rounded-xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
          <Star size={16} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Admin</p>
          <h1 className="text-lg font-semibold text-gray-800 leading-tight">Leaderboard</h1>
        </div>
      </div>
      <LeaderboardClient />
    </main>
  );
}
