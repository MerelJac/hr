"use client";

import { useState } from "react";
import RewardsAdmin from "./rewards-admin";
import RedemptionRow from "./redemption-row";

export default function ManageRewards({
  rows,
  rewards,
  categories,
}: {
  rows: any[];
  rewards: any[];
  categories: any[];
}) {
  const [activeTab, setActiveTab] = useState<"redemption" | "manage">("redemption");

  return (
    <section className="space-y-6">
      <div className="w-full">
        {/* Tabs */}
        <div className="flex border-b mb-4">
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
          <RewardsAdmin rewards={rewards} categories={categories} />
        )}
      </div>
    </section>
  );
}
