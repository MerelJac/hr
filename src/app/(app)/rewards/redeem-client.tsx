"use client";
import { useState } from "react";
import { Reward } from "@/types/reward";
import Image from "next/image";
import { CheckCircle2, Star } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<string>(categories[0]?.id ?? "");
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [amount, setAmount] = useState(25);
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const currentCategory = categories.find((c) => c.id === activeTab);

  const pointsCost =
    currentCategory?.name === "Gift Card" && selectedReward
      ? amount * 10
      : selectedReward?.pointsCost ?? 0;

  const canRedeem =
    currentCategory?.name === "Gift Card"
      ? selectedReward && amount >= 25 && amount % 5 === 0 && pointsCost <= balance
      : selectedReward && pointsCost > 0 && pointsCost <= balance;

  async function redeem() {
    if (!canRedeem) return;
    setLoading(true);
    const idemKey = `redeem_${selectedReward?.id}_${Date.now()}`;
    const payload = { catalogId: selectedReward?.id, pointsCost, deliverEmail: email, idemKey };
    const res = await fetch("/api/rewards/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setMessage(j.error || "Failed to redeem");
      return;
    }
    setMessage("Redemption submitted! Admin will process it.");
    location.reload();
  }

  const activeRewards = currentCategory?.rewards.filter((r) => r.isActive) ?? [];

  return (
    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-5 pt-4 gap-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setActiveTab(cat.id); setSelectedReward(null); }}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all
              ${activeTab === cat.id
                ? "bg-indigo-50 text-indigo-600 border border-b-0 border-indigo-100"
                : "text-gray-400 hover:text-gray-600"
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-5">
        {/* Success / error message */}
        {message && (
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border
            ${message.includes("submitted")
              ? "bg-green-50 border-green-100 text-green-700"
              : "bg-red-50 border-red-100 text-red-600"
            }`}>
            {message.includes("submitted") && <CheckCircle2 size={15} className="shrink-0" />}
            {message}
          </div>
        )}

        {/* Reward grid */}
        {currentCategory && (
          activeRewards.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Star size={18} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">More rewards coming soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {activeRewards.map((r) => {
                const isSelected = selectedReward?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReward(r)}
                    className={`relative rounded-xl border flex flex-col items-center gap-2 p-4 text-center transition-all
                      ${isSelected
                        ? "border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200"
                        : "border-gray-100 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50/40"
                      }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2">
                        <CheckCircle2 size={15} className="text-indigo-500" />
                      </span>
                    )}
                    {r.imageUrl && (
                      <Image
                        src={r.imageUrl}
                        alt={r.label}
                        width={80}
                        height={80}
                        className="rounded-lg object-contain"
                      />
                    )}
                    <span className="text-xs font-semibold text-gray-700 leading-tight">{r.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium
                      ${isSelected
                        ? "bg-indigo-100 border-indigo-200 text-indigo-600"
                        : "bg-white border-gray-200 text-gray-500"
                      }`}>
                      {currentCategory.name === "Gift Card" && r.pointsCost === 0
                        ? "Flexible"
                        : `${r.pointsCost} pts`}
                    </span>
                  </button>
                );
              })}
            </div>
          )
        )}

        {/* Gift card amount */}
        {currentCategory?.name === "Gift Card" && selectedReward && (
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</span>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">$</span>
              <input
                type="number"
                min={25}
                step={5}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 25)}
                className="border border-gray-200 rounded-lg pl-7 pr-3 py-1.5 w-28 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
              />
            </div>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500">
              Cost:{" "}
              <span className={`font-semibold ${canRedeem ? "text-green-600" : "text-red-500"}`}>
                {pointsCost} pts
              </span>
            </span>
          </div>
        )}

        {/* Email + Redeem */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Deliver to</label>
            <input
              type="email"
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <button
            onClick={redeem}
            disabled={!canRedeem || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all mt-5
              bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white
              disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Processing…"
            ) : canRedeem ? (
              <>
                <Star size={14} className="fill-white" />
                Redeem · {pointsCost} pts
              </>
            ) : (
              "Select a reward"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}