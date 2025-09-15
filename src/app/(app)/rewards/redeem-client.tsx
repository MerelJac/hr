"use client";
import { useState } from "react";
import Image from "next/image";
import amazon from "@/assets/amazon.png";
import visa from "@/assets/visa.png";

export default function RedeemClient({
  balance,
  defaultEmail,
}: {
  balance: number;
  defaultEmail: string;
}) {
  const [type, setType] = useState<"AMAZON" | "VISA" | null>(null);
  const [amount, setAmount] = useState(10);
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);

  const pointsCost = amount * 10;
  const canRedeem =
    type && amount >= 10 && amount % 5 === 0 && pointsCost <= balance;

  async function redeem() {
    if (!canRedeem) return;
    setLoading(true);
    const idemKey = `redeem_${type}_${amount}_${Date.now()}`;
    const res = await fetch("/api/rewards/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, amount, deliverEmail: email, idemKey }),
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
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setType("AMAZON")}
          className={`rounded-lg p-4 border flex flex-col items-center justify-center ${
            type === "AMAZON" ? "ring-2 ring-blue-500 bg-blue-100" : "bg-white"
          }`}
        >
          <Image src={amazon} alt="Amazon" width={80} height={40} />
        </button>
        <button
          onClick={() => setType("VISA")}
          className={`rounded-lg p-4 border flex flex-col items-center justify-center  ${
            type === "VISA" ? "ring-2 ring-blue-500 bg-blue-100" : "bg-white"
          }`}
        >
          <Image src={visa} alt="Visa" width={80} height={40} />
        </button>
      </div>

      <div>
        <label className="block text-md font-medium mb-1 text-white">
          Amount (USD)
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
        <p className="text-xs text-white mt-1">
          Cost: <b>{pointsCost}</b> pts
        </p>
      </div>

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
          {loading ? "Processing..." : `Redeem (${pointsCost} pts)`}
        </button>
      </div>
    </section>
  );
}
