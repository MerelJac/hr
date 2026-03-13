"use client";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { useState, useMemo } from "react";

export default function BoostPointsModal({
  toRedeemAvailable,
  onBoostComplete,
}: {
  toRedeemAvailable: number;
  onBoostComplete?: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const increments = useMemo(() => {
    const max = Math.min(toRedeemAvailable, 1000);
    const arr: number[] = [];
    for (let i = 10; i <= max; i += 10) arr.push(i);
    return arr;
  }, [toRedeemAvailable]);

  async function redeemPoints() {
    if (!selected) return;
    setLoading(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/boost-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: selected }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      onBoostComplete?.();
      setSuccess(true);
    } catch (err) {
      console.error("Unexpected error redeeming points:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Info block */}
      <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm text-indigo-700 leading-relaxed">
        Convert your <span className="font-semibold">Stars to Redeem</span> into{" "}
        <span className="font-semibold">Stars to Give</span> so you can recognize more people.
        Boosted stars expire at the end of the month.
      </div>

      {/* Balance pill */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Available to convert</span>
        <span className="flex items-center gap-1 bg-yellow-50 border border-yellow-100 text-yellow-600 text-sm font-bold px-2.5 py-1 rounded-lg">
          ⭐ {toRedeemAvailable}
        </span>
      </div>

      {increments.length > 0 ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center">
            Select an amount
          </p>

          {/* Scrollable list */}
          <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-2">
            {increments.map((points) => {
              const isSelected = selected === points;
              return (
                <button
                  key={points}
                  onClick={() => setSelected(points)}
                  className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isSelected
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white border border-gray-100 text-gray-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                >
                  <span>⭐ {points} to redeem</span>
                  <ArrowRight size={14} className={isSelected ? "text-indigo-200" : "text-gray-300"} />
                  <span>⚡ {points} to give</span>
                </button>
              );
            })}
          </div>

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-600 text-sm px-4 py-2.5 rounded-xl">
              <CheckCircle2 size={15} className="shrink-0" />
              Successfully converted {selected} stars!
            </div>
          )}

          {/* CTA */}
          <button
            onClick={redeemPoints}
            disabled={!selected || loading}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all
              bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white
              disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Converting…"
            ) : selected ? (
              <>
                <Zap size={14} className="fill-white" />
                Convert {selected} Stars
              </>
            ) : (
              "Select an amount"
            )}
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Zap size={18} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-400">
            You need at least <span className="font-semibold">10 stars</span> to convert.
          </p>
        </div>
      )}
    </div>
  );
}