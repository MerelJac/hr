import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import ManageRewards from "./manage-rewards";

export default async function AdminRewards() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "SUPER_ADMIN") return <div className="p-6">Forbidden</div>;

  const rows = await prisma.redemption.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, catalog: { include: { category: true } } },
    take: 100,
  });

  const rewards = await prisma.rewardCatalog.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.rewardCategory.findMany({
    orderBy: { name: "asc" },
  });

  return (

    <main className="bg-white">
      <header className="p-6 shadow-md">
        <h1 className="text-2xl font-semibold">Rewards Admin</h1>
      </header>
      <ManageRewards rows={rows} rewards={rewards} categories={categories} />
    </main>
  );
}
