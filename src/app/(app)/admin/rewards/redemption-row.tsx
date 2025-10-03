"use client";

import { Redemption } from "@/types/redepmtion";
import { useEffect, useState } from "react";

export default function RedemptionRow({ r }: { r: Redemption }) {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [claimUrl, setClaimUrl] = useState("");
  const [accessUrl, setAccessUrl] = useState("");

  async function act(action: string) {
    setLoading(true);
    const res = await fetch(`/api/rewards/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, code, claimUrl }),
    });
    setLoading(false);
    if (!res.ok) {
      alert((await res.json()).error || "Failed");
    } else {
      location.reload();
    }
  }

  useEffect(() => {
    if (r.type === "AMAZON") {
      setAccessUrl(
        `https://www.amazon.com/dp/B07MP6B4Y5?ref=altParentAsins_treatment_text_from_Amazon_to_Appreciation&th=1&gpo=${
          r.pointsSpent / 10
        }`
      );
    } else if (r.type === "VISA") {
      // set an external Visa provider link if you have one
      setAccessUrl("");
    }
  }, [r.type, r.pointsSpent]);

  return (
    <li className="border-2 bg-white rounded-lg p-3 text-sm space-y-2">
      <div>
        <b>{r.type}</b> • ${r.valueCents / 100} • {r.pointsSpent} pts •{" "}
        <span className="font-semibold">{r.status}</span>
      </div>
      <div>User: {r.user.email }</div>

      {r.code && (
        <div>
          Code: <code>{r.code}</code>
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
            Access {r.type}
          </a>
        </div>
      )}

      {r.claimUrl && (
        <div>
          Claim:{" "}
          <a className="underline" href={r.claimUrl} target="_blank">
            link
          </a>
        </div>
      )}

      <div className="text-gray-500">
        {new Date(r.createdAt).toLocaleString("en-US", { timeZone: "UTC" })}
      </div>

      {r.status === "PENDING" && (
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

      {r.status === "APPROVED" && (
        <div className="space-y-2 mt-2">
          <input
            type="text"
            placeholder="Gift code (optional)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
          <input
            type="url"
            placeholder="Claim URL (optional)"
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
              Fulfill
            </button>
            <button
              disabled={loading}
              onClick={() => act("fail")}
              className="bg-red-600 text-white px-2 py-1 rounded"
            >
              Fail
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
