"use client";

import { MoveRight } from "lucide-react";
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

  // ✅ Dynamically generate increments up to 1000 or available (whichever is lower)
  const increments = useMemo(() => {
    const max = Math.min(toRedeemAvailable, 1000);
    const arr: number[] = [];
    for (let i = 10; i <= max; i += 10) {
      arr.push(i);
    }
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

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      onBoostComplete?.(); // ✅ triggers router.refresh()
      setSuccess(true);
    } catch (err) {
      console.error("Unexpected error redeeming points:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-b-lg p-6 flex flex-col items-center text-center space-y-4">
      <p className="text-gray-700">
        Convert your <strong>Points to Redeem</strong> into{" "}
        <strong>Points to Give</strong> so you can give more to others.
        <br />
        Point boosts are only usable in the month you redeem them — after which
        they expire.
      </p>

      <p className="font-semibold">
        You have{" "}
        <span className="text-red-600 ">{toRedeemAvailable} points </span>to
        redeem.
      </p>

      {increments.length > 0 ? (
        <>
          <p className="text-lg font-medium mt-2">
            Select an Amount to Convert:
          </p>

          {/* ✅ Selection buttons */}
          {/* ✅ Scrollable selection buttons */}
          <div className="flex flex-col gap-2 mt-2 max-h-64 w-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-red-400 scrollbar-track-gray-100 rounded-lg border border-gray-200">
            {increments.map((points) => (
              <button
                key={points}
                onClick={() => setSelected(points)}
                className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg shadow-sm border transition 
        ${
          selected === points
            ? "border-red-600 bg-red-50 text-red-600 font-semibold"
            : "border-gray-300 hover:border-red-400 text-gray-700"
        }`}
              >
                {points} Points to Redeem <MoveRight size={16} /> {points}{" "}
                Points to Give
              </button>
            ))}
          </div>

          {/* ✅ Redeem button */}
          <button
            onClick={redeemPoints}
            disabled={!selected || loading}
            className={`mt-6 px-6 py-2 rounded-lg text-white font-semibold transition ${
              !selected || loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading
              ? "Redeeming..."
              : selected
              ? `Redeem ${selected} Points`
              : "Select Points to Redeem"}
          </button>

          {/* ✅ Success message */}
          {success && (
            <p className="mt-4 text-green-600 font-medium">
              🎉 Successfully redeemed {selected} points!
            </p>
          )}
        </>
      ) : (
        <p className="text-gray-500 text-sm mt-4">
          You don&apos;t have enough points to redeem (minimum 10 required).
        </p>
      )}
    </div>
  );
}
