import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RedemptionRow from "./redemption-row";

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
        {rows.map((r) => (
          <RedemptionRow key={r.id} r={r} />
        ))}
      </ul>
    </main>
  );
}
