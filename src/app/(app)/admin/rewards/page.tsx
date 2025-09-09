import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminRewards() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "SUPER_ADMIN") return <div className="p-6">Forbidden</div>;

  const rows = await prisma.redemption.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, catalog: true },
    take: 100,
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Redemptions</h1>
      <ul className="space-y-2">
        {rows.map(r => (
          <li key={r.id} className="border rounded p-3 text-sm">
            <div><b>{r.catalog.label}</b> • {r.pointsSpent} pts • status: {r.status}</div>
            <div>User: {r.user.email}</div>
            {r.code && <div>Code: <code>{r.code}</code></div>}
            {r.claimUrl && <div>Claim: <a className="underline" href={r.claimUrl} target="_blank">link</a></div>}
            <div className="text-gray-500">{new Date(r.createdAt).toLocaleString("en-US", { timeZone: "UTC" })}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
