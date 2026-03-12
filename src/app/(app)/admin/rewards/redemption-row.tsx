"use client";

import { Redemption } from "@/types/redepmtion";
import { Check, ExternalLink, Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

function inputClass() {
  return "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 placeholder:text-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition";
}

function statusStyle(status: string) {
  if (status === "FULFILLED") return "bg-green-50 border-green-100 text-green-600";
  if (status === "CANCELLED" || status === "FAILED") return "bg-red-50 border-red-100 text-red-500";
  if (status === "APPROVED") return "bg-indigo-50 border-indigo-100 text-indigo-500";
  return "bg-yellow-50 border-yellow-100 text-yellow-600";
}

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function RedemptionRow({
  r,
  onUpdate,
}: {
  r: Redemption;
  onUpdate?: (updated: Redemption) => void;
}) {
  const [redemption, setRedemption] = useState(r);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [claimUrl, setClaimUrl] = useState("");
  const [accessUrl, setAccessUrl] = useState("");

  async function act(action: string) {
    setLoading(true);
    const res = await fetch(`/api/redeem/${redemption.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, code, claimUrl }),
    });
    setLoading(false);
    if (!res.ok) {
      alert((await res.json()).error || "Failed");
    } else {
      const updated = await res.json();
      onUpdate?.(updated);
      setRedemption(updated);
    }
  }

  useEffect(() => {
    if (redemption.catalogId === "AMAZON") {
      setAccessUrl(
        `https://www.amazon.com/dp/B07MP6B4Y5?ref=altParentAsins_treatment_text_from_Amazon_to_Appreciation&th=1&gpo=${redemption.pointsSpent / 10}`
      );
    } else if (redemption.catalogId === "VISA") {
      setAccessUrl("");
    }
  }, [redemption.pointsSpent, redemption.catalogId]);

  return (
    <li className="px-5 py-4 hover:bg-gray-50 transition-colors space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Image
            src={redemption.user?.profileImage ?? "/default-profile-image.svg"}
            alt="Profile"
            width={36}
            height={36}
            className="rounded-full border border-indigo-200 object-cover w-9 h-9 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {redemption.catalog?.label}
            </p>
            <p className="text-xs text-gray-400 truncate">{redemption.user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            {redemption.valueCents > 0 && (
              <span className="font-medium text-gray-700">${(redemption.valueCents / 100).toFixed(2)}</span>
            )}
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-0.5">⭐ {redemption.pointsSpent}</span>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-lg border ${statusStyle(redemption.status)}`}>
            {statusLabel(redemption.status)}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
        <span>{new Date(redemption.createdAt).toLocaleString("en-US", { timeZone: "UTC" })}</span>

        {redemption.code && (
          <>
            <span className="text-gray-200">·</span>
            <code className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{redemption.code}</code>
          </>
        )}

        {accessUrl && (
          <>
            <span className="text-gray-200">·</span>
            <a
              href={accessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              Access {redemption.catalogId} <ExternalLink size={10} />
            </a>
          </>
        )}

        {redemption.claimUrl && (
          <>
            <span className="text-gray-200">·</span>
            <a
              href={redemption.claimUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              Claim link <ExternalLink size={10} />
            </a>
          </>
        )}
      </div>

      {/* Pending actions */}
      {redemption.status === "PENDING" && (
        <div className="flex gap-2">
          <button
            disabled={loading}
            onClick={() => act("approve")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all disabled:opacity-50"
          >
            Approve
          </button>
          <button
            disabled={loading}
            onClick={() => act("cancel")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-xl transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Approved — fulfill form */}
      {redemption.status === "APPROVED" && (
        <div className="space-y-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Fulfill Redemption</p>
          <input
            type="text"
            placeholder="Redeem code (optional)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={inputClass()}
          />
          <input
            type="url"
            placeholder="Claim URL (optional)"
            value={claimUrl}
            onChange={(e) => setClaimUrl(e.target.value)}
            className={inputClass()}
          />
          <div className="flex gap-2 pt-1">
            <button
              disabled={loading}
              onClick={() => act("fulfill")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white rounded-xl transition-all disabled:opacity-50"
            >
              <Check size={12} /> Fulfill
            </button>
            <button
              disabled={loading}
              onClick={() => act("cancel")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
            >
              <Trash size={12} /> Cancel
            </button>
          </div>
        </div>
      )}
    </li>
  );
}