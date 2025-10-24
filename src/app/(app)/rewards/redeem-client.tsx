"use client";
import { useState } from "react";
import { Reward } from "@/types/reward";
import Image from "next/image";

type RewardCategory = {
  id: string;
  name: string;
  rewards: Reward[];
};

export default function RedeemClient({
  balance,
  defaultEmail,
  categories,
}: {
  balance: number;
  defaultEmail: string;
  categories: RewardCategory[];
}) {
  // Default tab → use first category (likely "Gift Card")
  const [activeTab, setActiveTab] = useState<string>(categories[0]?.id ?? "");
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [amount, setAmount] = useState(10);
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  // Find current category
  const currentCategory = categories.find((c) => c.id === activeTab);

  // Cost logic
  const pointsCost =
    currentCategory?.name === "Gift Card" && selectedReward
      ? amount * 10 // flexible math for gift cards
      : selectedReward?.pointsCost ?? 0;

  const canRedeem =
    currentCategory?.name === "Gift Card"
      ? selectedReward &&
        amount >= 10 &&
        amount % 5 === 0 &&
        pointsCost <= balance
      : selectedReward && pointsCost > 0 && pointsCost <= balance;

  async function redeem() {
    if (!canRedeem) return;
    setLoading(true);

    const idemKey = `redeem_${selectedReward?.id}_${Date.now()}`;

    const payload = {
      catalogId: selectedReward?.id,
      pointsCost,
      deliverEmail: email,
      idemKey,
    };

    const res = await fetch("/api/rewards/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setMessage(j.error || "Failed to redeem")
      return;
    }
    setMessage("✅ Redemption submitted! Admin will process it.")
    location.reload();
  }

  return (
    <section className="space-y-6 p-6">
        {/* Message */}
  {message && (
    <div className="rounded-lg border border-yellow-300 bg-yellow-100 text-yellow-800 p-3 text-sm">
      {message}
    </div>
  )}
      {/* Tabs */}
      <div className="flex border-b mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveTab(cat.id);
              setSelectedReward(null);
            }}
            className={`px-4 py-2 font-medium ${
              activeTab === cat.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Rewards for active category */}
      {currentCategory && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentCategory.rewards
              .filter((r) => r.isActive)
              .map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReward(r)}
                  className={`rounded-lg p-4 border-2 flex flex-col items-center justify-center max-w-sm ${
                    selectedReward?.id === r.id
                      ? "ring-2 ring-blue-500 bg-blue-100"
                      : "bg-white"
                  }`}
                >
                  <span className="font-semibold pb-2">{r.label}</span>
                  {r.imageUrl && (
                    <Image
                      src={r.imageUrl}
                      alt={r.label}
                      width={150}
                      height={150}
                    />
                  )}
                  <span className="text-sm text-gray-600 py-2">
                    {currentCategory.name === "Gift Card"
                      ? "Flexible amount"
                      : `${r.pointsCost} pts`}
                  </span>
                  <p className="bg-red-500 text-white px-4 py-2 rounded min-w-[80%]">Select Reward</p>
                </button>
              ))}
          </div>

          {/* Amount input only for Gift Cards */}
          {currentCategory.name === "Gift Card" && selectedReward && (
            <div>
              <label className="block text-md font-medium mb-1 text-black">
                Amount
              </label>
              <div className="relative w-40">
                <span className="absolute inset-y-0 left-2 flex items-center text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min={10}
                  step={5}
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 10)}
                  className="border rounded-lg pl-6 pr-3 py-2 w-full bg-white"
                />
              </div>
              <p className="text-xs text-black mt-1">
                Cost:{" "}
                <b className={canRedeem ? "text-green-600" : "text-red-600"}>
                  {pointsCost}
                </b>{" "}
                pts
              </p>
            </div>
          )}
        </>
      )}

      {/* Email + Redeem */}
      <div className="flex items-center gap-3">
        <input
          type="email"
          className="border rounded-lg px-3 py-2 w-80 bg-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={redeem}
          disabled={!canRedeem || loading}
          className="bg-red text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : canRedeem
            ? `Redeem (${pointsCost} pts)`
            : "Select reward"}
        </button>
      </div>
    </section>
  );
}
