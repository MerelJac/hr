import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listCatalog } from "@/lib/rewards";
import RedeemClient from "./redeem-client";

export default async function RewardsPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) return <div className="p-6">Please sign in.</div>;

  const [user, catalog, history] = await Promise.all([
    prisma.user.findUnique({ where: { id: me.id }, select: { pointsBalance: true, email: true } }),
    listCatalog(),
    prisma.redemption.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
      include: { catalog: true },
      take: 20,
    }),
  ]);

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">You have <b className="font-bold text-4xl">{user?.pointsBalance ?? 0}</b> stars to cash in!</h1>
      </div>

      <RedeemClient
        balance={user?.pointsBalance ?? 0}
        defaultEmail={me.email ?? user?.email ?? ""}
      />

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Recent Redemptions</h2>
        <ul className="space-y-2">
          {history.map(r => (
            <li key={r.id} className="border-2 rounded-xl bg-white p-3">
              <div className="text-sm">
                <b>{r.type}</b> — ${r.pointsSpent / 10}
                {" · "}status: {r.status}
              </div>
              {r.code && <div className="text-xs mt-1">Code: <code>{r.code}</code></div>}
              {r.claimUrl && <div className="text-xs">Claim: <a className="underline" href={r.claimUrl} target="_blank">link</a></div>}
              <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString("en-US", { timeZone: "UTC" })}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
