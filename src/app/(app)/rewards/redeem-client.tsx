"use client";
import { useState } from "react";
import Image from "next/image";
import amazon from "@/assets/amazon.png";
import visa from "@/assets/visa.png";

type Reward = {
  id: string;
  categoryId: string;
  label: string;
  valueCents: number;
  pointsCost: number;
  isActive: boolean;
};

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
  const [activeTab, setActiveTab] = useState<"Gift Card" | string>("Gift Card");
  const [type, setType] = useState<"AMAZON" | "VISA" | null>(null);
  const [amount, setAmount] = useState(10);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);

  // cost logic
  const pointsCost =
    activeTab === "Gift Card"
      ? amount * 10 // flexible math for gift cards
      : selectedReward?.pointsCost ?? 0;

  const canRedeem =
    (activeTab === "Gift Card" &&
      type &&
      amount >= 10 &&
      amount % 5 === 0 &&
      pointsCost <= balance) ||
    (activeTab !== "Gift Card" &&
      selectedReward &&
      pointsCost > 0 &&
      pointsCost <= balance);

  async function redeem() {
    if (!canRedeem) return;
    setLoading(true);

    const idemKey = `redeem_${type || selectedReward?.id}_${Date.now()}`;

    const payload =
      activeTab === "Gift Card"
        ? { type, amount, deliverEmail: email, idemKey }
        : { catalogId: selectedReward?.id, deliverEmail: email, idemKey };

    const res = await fetch("/api/rewards/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Failed to redeem");
      return;
    }
    alert("✅ Redemption submitted! Admin will process it.");
    location.reload();
  }

  return (
    <section className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveTab(cat.id);
              setType(null);
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

      {/* Gift Card */}
      {activeTab === "Gift Card" && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setType("AMAZON")}
              className={`rounded-lg p-4 border flex flex-col items-center justify-center ${
                type === "AMAZON"
                  ? "ring-2 ring-blue-500 bg-blue-100"
                  : "bg-white"
              }`}
            >
              <Image src={amazon} alt="Amazon" width={80} height={40} />
            </button>
            <button
              onClick={() => setType("VISA")}
              className={`rounded-lg p-4 border flex flex-col items-center justify-center ${
                type === "VISA"
                  ? "ring-2 ring-blue-500 bg-blue-100"
                  : "bg-white"
              }`}
            >
              <Image src={visa} alt="Visa" width={80} height={40} />
            </button>
          </div>

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
        </>
      )}

      {/* Other categories (swag, PTO, etc.) */}
      {activeTab !== "Gift Card" && (
        <div className="grid grid-cols-2 gap-4">
          {categories
            .find((c) => c.id === activeTab)
            ?.rewards.filter((r) => r.isActive)
            .map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedReward(r)}
                className={`rounded-lg p-4 border flex flex-col items-center justify-center ${
                  selectedReward?.id === r.id
                    ? "ring-2 ring-blue-500 bg-blue-100"
                    : "bg-white"
                }`}
              >
                <span className="font-semibold">{r.label}</span>
                <span className="text-sm text-gray-600">
                  ${(r.valueCents / 100).toFixed(2)} · {r.pointsCost} pts
                </span>
              </button>
            ))}
        </div>
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
