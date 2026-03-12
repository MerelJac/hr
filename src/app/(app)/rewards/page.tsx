import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RedeemClient from "./redeem-client";
import { User } from "@/types/user";
import { ExternalLink, Gift, Star } from "lucide-react";

export default async function RewardsPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as User;
  if (!me?.id) return <div className="p-6 text-sm text-gray-500">Please sign in.</div>;

  const [user, history, categories] = await Promise.all([
    prisma.user.findUnique({
      where: { id: me.id },
      select: { pointsBalance: true, email: true },
    }),
    prisma.redemption.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
      include: { catalog: true, user: true },
      take: 20,
    }),
    prisma.rewardCategory.findMany({
      include: { rewards: { where: { isActive: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const safeCategories = categories.map((c) => ({
    ...c,
    rewards: c.rewards.map((r) => ({
      ...r,
      valueCents: r.valueCents ?? 0,
    })),
  }));

  const balance = user?.pointsBalance ?? 0;

  function statusStyle(status: string) {
    if (status === "FULFILLED") return "bg-green-50 border-green-100 text-green-600";
    if (status === "FAILED" || status === "CANCELLED") return "bg-red-50 border-red-100 text-red-500";
    return "bg-yellow-50 border-yellow-100 text-yellow-600";
  }

  function statusLabel(status: string) {
    if (status === "FULFILLED") return "Fulfilled";
    if (status === "FAILED") return "Failed";
    if (status === "CANCELLED") return "Cancelled";
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  return (
    <main className="space-y-5 max-w-3xl mx-auto p-6">

      {/* Header */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Rewards</p>
          <h1 className="text-lg font-semibold text-gray-800">Redeem Points</h1>
        </div>
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-2.5 shrink-0">
          <Star size={15} className="fill-yellow-400 text-yellow-400" />
          <span className="text-yellow-700 font-bold text-sm">{balance}</span>
          <span className="text-yellow-500 text-xs font-medium">stars</span>
        </div>
      </div>

      {/* Redeem client */}
      <RedeemClient
        balance={balance}
        defaultEmail={me.email ?? user?.email ?? ""}
        categories={safeCategories}
      />

      {/* Redemption History */}
      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <Gift size={15} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-gray-700">Recent Redemptions</h2>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Gift size={18} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">No redemptions yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {history.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {r.catalog?.label || r.catalogId}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {r.valueCents
                        ? `$${(r.valueCents / 100).toFixed(2)}`
                        : `${r.pointsSpent} pts`}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg border ${statusStyle(r.status)}`}>
                      {statusLabel(r.status)}
                    </span>
                  </div>
                  {(r.code || r.claimUrl) && (
                    <div className="flex items-center gap-3 pt-0.5">
                      {r.code && (
                        <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                          {r.code}
                        </code>
                      )}
                      {r.claimUrl && (
                        <a
                          href={r.claimUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
                        >
                          Claim <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0 pt-0.5">
                  {new Date(r.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}