"use client";

import { useState } from "react";
import GifPicker from "./GifPicker";
import Image from "next/image";
import { X, PlusCircle, Trophy } from "lucide-react";

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
  const [rows, setRows] = useState<{ userId: string }[]>([{ userId: users[0]?.id ?? "" }]);
  const [message, setMessage] = useState("");
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const updateRow = (i: number, userId: string) => {
    const next = [...rows];
    next[i].userId = userId;
    setRows(next);
  };

  const addRow = () => setRows([...rows, { userId: users[0]?.id ?? "" }]);
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const validWinners = rows.map((r) => r.userId).filter(Boolean);

    if (!message.trim()) return alert("Message is required.");
    if (validWinners.length === 0) return alert("At least one winner must be selected.");

    setLoading(true);
    const res = await fetch(`/api/challenges/${challengeId}/announce`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, gifUrl, winners: validWinners, points }),
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
    <form
      onSubmit={submit}
      className="space-y-6 p-6 bg-white shadow-lg rounded-2xl max-w-lg mx-auto border border-gray-200"
    >
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="text-yellow-500" size={24} />
        <h2 className="text-2xl font-semibold">Announce Winners 🎉</h2>
      </div>

      {/* 📝 Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Celebration Message
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-blue-50"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a message to celebrate the winners!"
        />
      </div>

      {/* 🖼️ GIF Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Optional GIF
        </label>
        <GifPicker onSelect={setGifUrl} />
        {gifUrl && (
          <div className="mt-3 relative inline-block">
            <Image
              src={gifUrl}
              alt="Celebration GIF"
              width={150}
              height={150}
              unoptimized
              className="rounded-lg shadow"
            />
            <button
              type="button"
              onClick={() => setGifUrl(null)}
              className="absolute -top-2 -right-2 bg-white border border-gray-300 text-red-600 rounded-full p-1 shadow-sm hover:bg-red-50"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* 🏆 Winner Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Winner(s)
        </label>

        <div className="space-y-3">
          {rows.map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200"
            >
              <select
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

              <span className="text-sm text-green-600 font-medium whitespace-nowrap">
                +{points} pts
              </span>

              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                  title="Remove winner"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-3 flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700"
        >
          <PlusCircle size={16} />
          Add Another Winner
        </button>
      </div>

      {/* 📤 Submit */}
      <button
        type="submit"
        disabled={!message.trim() || loading}
        className={`w-full py-3 rounded-lg font-semibold text-white transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Announcing..." : "🎉 Announce Winners"}
      </button>
    </form>
  );
}
