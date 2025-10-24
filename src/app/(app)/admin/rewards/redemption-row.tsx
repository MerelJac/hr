"use client";

import { Redemption } from "@/types/redepmtion";
import { Check, Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function RedemptionRow({ r }: { r: Redemption }) {
  const [redemption, setRedemption] = useState(r);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [claimUrl, setClaimUrl] = useState("");
  const [accessUrl, setAccessUrl] = useState("");

  async function act(action: string) {
    setLoading(true);
    console.log("reward id", redemption.id);
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
      setRedemption(updated);
    }
  }

  useEffect(() => {
    if (redemption.catalogId === "AMAZON") {
      setAccessUrl(
        `https://www.amazon.com/dp/B07MP6B4Y5?ref=altParentAsins_treatment_text_from_Amazon_to_Appreciation&th=1&gpo=${
          redemption.pointsSpent / 10
        }`
      );
    } else if (redemption.catalogId === "VISA") {
      // set an external Visa provider link if you have one
      setAccessUrl("");
    }
  }, [redemption.pointsSpent, redemption.catalogId]);

  return (
    <li className="border-2 bg-white rounded-lg p-3 text-sm space-y-2">
      <div>
        <b>{redemption.catalog?.label}</b>{" "}
        {redemption.valueCents > 0 && (
          <>• ${(redemption.valueCents / 100).toFixed(2)} </>
        )}
        • {redemption.pointsSpent} pts •{" "}
        <span className="font-semibold">{redemption.status}</span>
      </div>

      <div className="flex flex-row gap-2 items-center">
        <Image
          src={redemption.user?.profileImage ?? "/default-profile-image.svg"}
          alt="Profile"
          width={28}
          height={28}
          className="rounded-full w-8 h-8 border-2 border-blue-500"
        />
        {redemption.user?.email}
      </div>

      {redemption.code && (
        <div>
          Code: <code>{redemption.code}</code>
        </div>
      )}

      {accessUrl && (
        <div>
          <a
            href={accessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Access {redemption.catalogId}
          </a>
        </div>
      )}

      {redemption.claimUrl && (
        <div>
          Claim:{" "}
          <a className="underline" href={redemption.claimUrl} target="_blank">
            link
          </a>
        </div>
      )}

      <div className="text-gray-500">
        {new Date(redemption.createdAt).toLocaleString("en-US", {
          timeZone: "UTC",
        })}
      </div>

      {redemption.status === "PENDING" && (
        <div className="flex gap-2 mt-2">
          <button
            disabled={loading}
            onClick={() => act("approve")}
            className="bg-blue-600 text-white px-2 py-1 rounded"
          >
            Mark as Approved
          </button>
          <button
            disabled={loading}
            onClick={() => act("cancel")}
            className="bg-gray-400 text-white px-2 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      )}

      {redemption.status === "APPROVED" && (
        <div className="space-y-2 mt-2">
          <input
            type="text"
            placeholder="Redeem code (optional)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
          <input
            type="url"
            placeholder="Claim URL (optional - https://link-to-claim.com)"
            value={claimUrl}
            onChange={(e) => setClaimUrl(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
          <div className="flex gap-2">
            <button
              disabled={loading}
              onClick={() => act("fulfill")}
              className="bg-green-600 text-white px-2 py-1 rounded"
            >
              <Check size={18} />
            </button>
            <button
              disabled={loading}
              onClick={() => act("cancel")}
              className="bg-red-600 text-white px-2 py-1 rounded"
            >
              <Trash size={18} />
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
