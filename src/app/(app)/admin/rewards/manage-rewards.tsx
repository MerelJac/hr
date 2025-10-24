"use client";

import { useEffect, useState } from "react";
import RewardsAdmin from "./rewards-admin";
import RedemptionRow from "./redemption-row";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Redemption } from "@/types/redepmtion";

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

  // ✅ Reactively update badge based on current redemption list
  useEffect(() => {
    const hasPending = redemptionList.some((r) => r.status === "PENDING");
    setRedemptionAttention(hasPending);
  }, [redemptionList]);

  // 👇 This callback will be passed to each RedemptionRow
  function handleRedemptionUpdate(updated: Redemption) {
    setRedemptionList((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  }

  return (
    <section className="space-y-6 p-6 h-screen">
      <div className="w-full">
        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-4 py-2 font-medium ${
              activeTab === "manage"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Manage
          </button>

          <button
            onClick={() => setActiveTab("redemption")}
            className={`relative px-4 py-2 font-medium transition ${
              activeTab === "redemption"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Redemptions
            {redemptionAttention && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
                !
              </span>
            )}
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "redemption" && (
          <ul className="space-y-2 max-h-[75vh] overflow-y-auto">
            {redemptionList.map((r) => (
              <RedemptionRow key={r.id} r={r} onUpdate={handleRedemptionUpdate} />
            ))}
          </ul>
        )}

        {activeTab === "manage" && (
          <RewardsAdmin
            rewards={rewards.map((r) => ({
              ...r,
              valueCents: r.valueCents ?? 0,
            }))}
            categories={categories}
          />
        )}
      </div>
    </section>
  );
}
