"use client";

import { useState } from "react";
import GifPicker from "./GifPicker";
import Image from "next/image";

type SimpleUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
};

export default function AnnounceWinnersForm({
  users,
  challengeId,
  points,
}: {
  users: SimpleUser[];
  challengeId: string;
  points: number;
}) {
  const [rows, setRows] = useState<{ userId: string }[]>([]);

  const [message, setMessage] = useState("");
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  function updateRow(i: number, userId: string) {
    const next = [...rows];
    next[i].userId = userId;
    setRows(next);
  }

  function addRow() {
    setRows([...rows, { userId: users[0]?.id ?? "" }]);
  }

  function removeRow(i: number) {
    const next = rows.slice();
    next.splice(i, 1);
    setRows(next.length ? next : [{ userId: users[0]?.id ?? "" }]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const validWinners = rows.map((r) => r.userId).filter(Boolean); // ✅ remove empty strings
    console.log('Valud winnder', validWinners)

    if (!message.trim()) return alert("Message is required.");
    if (!rows.length) return alert("At least one winner.");

    setLoading(true);
    const res = await fetch(`/api/challenges/${challengeId}/announce`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        gifUrl,
        winners: validWinners,
        points,
      }),
    });

    setLoading(false);
    if (res.ok) {
      alert("🎉 Winners announced successfully!");
      window.location.reload();
    } else {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Failed to announce winners.");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 p-4 rounded-xl bg-white">
      <h2 className="text-xl font-semibold">🏆 Announce Winners</h2>
      <textarea
        className="w-full border rounded-lg px-3 py-2 bg-blue-50"
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write a message to celebrate the winners!"
      />

      <GifPicker onSelect={(url) => setGifUrl(url)} />
      {gifUrl && (
        <div className="mt-2 relative max-w-fit">
          <Image
            src={gifUrl}
            alt="Selected GIF"
            width={150}
            height={150}
            unoptimized
            className="max-h-40 rounded"
          />
          <button
            type="button"
            onClick={() => setGifUrl(null)}
            className="absolute top-1 right-1 bg-white/80 text-red-600 text-xs px-2 py-1 rounded"
          >
            Remove
          </button>
        </div>
      )}
      <div className="space-y-2">
        <p>Points: {points}</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Select winner(s)</label>
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2 items-center">
            <select
              className="border rounded px-2 py-1 min-h-[36px]"
              value={row.userId}
              onChange={(e) => updateRow(i, e.target.value)}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName || u.lastName
                    ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
                    : u.email}
                </option>
              ))}
            </select>
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-red-600 text-sm"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="text-blue-600 text-sm underline"
        >
          + Add Winner
        </button>
      </div>

      <button
        disabled={!message.trim() || loading}
        className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Announcing..." : "🎉 Announce Winners"}
      </button>
    </form>
  );
}
