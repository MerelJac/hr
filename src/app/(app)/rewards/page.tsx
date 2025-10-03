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

  const safeCategories = categories.map(c => ({
  ...c,
  rewards: c.rewards.map(r => ({
    ...r,
    valueCents: r.valueCents ?? 0, // normalize null → 0
  })),
}));

  return (
    <main className="space-y-6 bg-white rounded-xl">
      <div className="flex items-center justify-between p-6 shadow-md">
        <h1 className="text-2xl font-semibold">Redeem Points</h1>
        <p className="text-2xl font-semibold text-blue bg-white p-4 rounded-xl">
          {user?.pointsBalance ?? 0} stars to redeem
        </p>
      </div>

      <RedeemClient
        balance={user?.pointsBalance ?? 0}
        defaultEmail={me.email ?? user?.email ?? ""}
        categories={safeCategories}
      />

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Recent Redemptions</h2>
        <ul className="space-y-2">
          {history.map((r) => (
            <li key={r.id} className="border-2 rounded-xl bg-white p-3">
              <div className="text-sm">
                <b>{r.catalog?.label || r.catalogId}</b> —{" "}
                {r.valueCents
                  ? `$${r.valueCents / 100}`
                  : `${r.pointsSpent} pts`}
                {" · "}status: {r.status}
              </div>
              {r.code && (
                <div className="text-xs mt-1">
                  Code: <code>{r.code}</code>
                </div>
              )}
              {r.claimUrl && (
                <div className="text-xs">
                  Claim:{" "}
                  <a className="underline" href={r.claimUrl} target="_blank">
                    link
                  </a>
                </div>
              )}
              <div className="text-xs text-gray-500">
                {new Date(r.createdAt).toLocaleString("en-US", {
                  timeZone: "UTC",
                })}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
