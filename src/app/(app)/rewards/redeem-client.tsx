"use client";

import { useState } from "react";

export default function RedeemClient({
  catalog,
  balance,
  defaultEmail,
}: {
  catalog: Array<{ id: string; type: "AMAZON" | "VISA"; label: string; valueCents: number; pointsCost: number }>;
  balance: number;
  defaultEmail: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const item = catalog.find(c => c.id === selected) || null;

  async function redeem() {
    if (!item) return;
    if (item.pointsCost > balance) {
      alert("Not enough points.");
      return;
    }
    setLoading(true);
    const idemKey = `redeem_${item.id}_${Date.now()}`; // simple example
    const res = await fetch("/api/rewards/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ catalogId: item.id, deliverEmail: email, idemKey }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Failed to redeem");
      return;
    }
    location.reload();
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Catalog</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {catalog.map(c => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`border rounded p-4 text-left ${selected === c.id ? "ring-2 ring-black" : ""}`}
          >
            <div className="text-sm text-gray-500">{c.type}</div>
            <div className="font-medium">{c.label}</div>
            <div className="text-xs text-gray-600">Cost: {c.pointsCost} pts</div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="email"
          className="border rounded px-3 py-2 w-80"
          placeholder="Delivery email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={redeem}
          disabled={!item || loading || (item?.pointsCost ?? Infinity) > balance}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Processing..." : item ? `Redeem (${item.pointsCost} pts)` : "Select a reward"}
        </button>
      </div>
    </section>
  );
}
