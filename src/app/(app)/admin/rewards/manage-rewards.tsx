"use client";

import { useState } from "react";
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
  rows,
  rewards,
  categories,
}: {
  rows: Redemption[];
  rewards: RewardWithCategory[];
  categories: RewardCategory[];
}) {
  const [activeTab, setActiveTab] = useState<"redemption" | "manage">("manage");

  return (
    <section className="space-y-6 p-6">
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
            className={`px-4 py-2 font-medium ${
              activeTab === "redemption"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Redemptions
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "redemption" && (
          <ul className="space-y-2">
            {rows.map((r) => (
              <RedemptionRow key={r.id} r={r} />
            ))}
          </ul>
        )}

        {activeTab === "manage" && (
          <RewardsAdmin
            rewards={rewards.map((r) => ({
              ...r,
              valueCents: r.valueCents ?? 0, // ✅ ensure number
            }))}
            categories={categories}
          />
        )}
      </div>
    </section>
  );
}
