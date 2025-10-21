import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RedeemClient from "./redeem-client";
import { User } from "@/types/user";

export default async function RewardsPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as User;
  if (!me?.id) return <div className="p-6">Please sign in.</div>;

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
      valueCents: r.valueCents ?? 0, // normalize null → 0
    })),
  }));

  return (
    <main className="space-y-6 bg-white rounded-xl">
      <div className="flex items-center justify-between p-6 shadow-md">
        <h1 className="text-2xl font-semibold">Redeem Points</h1>

        <div className="bg-blue-50 text-blue-700 px-6 py-3 rounded-xl text-lg font-semibold mt-4 sm:mt-0">
          ⭐ {user?.pointsBalance ?? 0} points available
        </div>
      </div>

      <RedeemClient
        balance={user?.pointsBalance ?? 0}
        defaultEmail={me.email ?? user?.email ?? ""}
        categories={safeCategories}
      />

      {/* Redemption History */}
      <section className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Recent Redemptions
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No redemptions yet.</p>
        ) : (
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {history.map((r) => (
              <li
                key={r.id}
                className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">
                      {r.catalog?.label || r.catalogId}
                    </div>
                    <div className="text-sm text-gray-600">
                      {r.valueCents
                        ? `$${(r.valueCents / 100).toFixed(2)}`
                        : `${r.pointsSpent} pts`}
                      {" · "}
                      <span
                        className={`${
                          r.status === "FULFILLED"
                            ? "text-green-600"
                            : r.status === "FAILED" || r.status === "CANCELLED"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>

                {r.code && (
                  <div className="text-xs mt-1">
                    Code: <code>{r.code}</code>
                  </div>
                )}
                {r.claimUrl && (
                  <div className="text-xs">
                    Claim:{" "}
                    <a
                      className="underline text-blue-600"
                      href={r.claimUrl}
                      target="_blank"
                    >
                      link
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
