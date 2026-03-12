import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ManageRewards from "./manage-rewards";
import { User } from "@/types/user";
import { Gift } from "lucide-react";

export default async function AdminRewards() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as User)?.role;
  if (role !== "SUPER_ADMIN") return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-gray-400">You don&apos;t have access to this page.</p>
    </div>
  );

  const redemptions = await prisma.redemption.findMany({
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
    <main className="max-w-5xl mx-auto p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
          <Gift size={16} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Admin</p>
          <h1 className="text-lg font-semibold text-gray-800 leading-tight">Rewards</h1>
        </div>
      </div>
      <ManageRewards redemptions={redemptions} rewards={rewards} categories={categories} />
    </main>
  );
}