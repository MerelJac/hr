"use client";

import { useEffect, useState } from "react";
import RewardsAdmin from "./rewards-admin";
import RedemptionRow from "./redemption-row";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Redemption } from "@/types/redepmtion";
import RewardToolbox from "@/components/RewardToolbox";

type RewardWithCategory = Prisma.PromiseReturnType<
  typeof prisma.rewardCatalog.findMany<{ include: { category: true } }>
>[number];

type RewardCategory = Prisma.PromiseReturnType<
  typeof prisma.rewardCategory.findMany
>[number];

export default function ManageRewards({
  redemptions,
  rewards,
  categories,
}: {
  redemptions: Redemption[];
  rewards: RewardWithCategory[];
  categories: RewardCategory[];
}) {
  const [activeTab, setActiveTab] = useState<"redemption" | "manage">("manage");
  const [redemptionList, setRedemptionList] = useState<Redemption[]>(redemptions);
  const [redemptionAttention, setRedemptionAttention] = useState(false);

  useEffect(() => {
    setRedemptionAttention(redemptionList.some((r) => r.status === "PENDING"));
  }, [redemptionList]);

  function handleRedemptionUpdate(updated: Redemption) {
    setRedemptionList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  const tabs: { key: "manage" | "redemption"; label: string }[] = [
    { key: "manage", label: "Manage" },
    { key: "redemption", label: "Redemptions" },
  ];

  return (
    <section className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`relative px-4 py-2 text-sm font-medium rounded-t-lg transition-all
              ${activeTab === key
                ? "bg-indigo-50 text-indigo-600 border border-b-0 border-indigo-100"
                : "text-gray-400 hover:text-gray-600"
              }`}
          >
            {label}
            {key === "redemption" && redemptionAttention && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                !
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Redemptions tab */}
      {activeTab === "redemption" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <RewardToolbox />
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {redemptionList.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <p className="text-sm text-gray-400">No redemptions yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-[75vh] overflow-y-auto">
                {redemptionList.map((r) => (
                  <RedemptionRow key={r.id} r={r} onUpdate={handleRedemptionUpdate} />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Manage tab */}
      {activeTab === "manage" && (
        <RewardsAdmin
          rewards={rewards.map((r) => ({ ...r, valueCents: r.valueCents ?? 0 }))}
          categories={categories}
        />
      )}
    </section>
  );
}