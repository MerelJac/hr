"use client";

import { useState } from "react";

type SimpleUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
};

export default function RecognizeForm({
  users,
  available,
}: {
  users: SimpleUser[];
  available: number;
}) {
  const [rows, setRows] = useState<{ userId: string; points: number }[]>([
    { userId: users[0]?.id ?? "", points: 5 },
  ]);
  const [message, setMessage] = useState("");

  const total = rows.reduce((s, r) => s + (Number(r.points) || 0), 0);

  function updateRow(
    i: number,
    patch: Partial<{ userId: string; points: number }>
  ) {
    const next = [...rows];
    next[i] = { ...next[i], ...patch };
    setRows(next);
  }

  function addRow() {
    setRows([...rows, { userId: users[0]?.id ?? "", points: 5 }]);
  }

  function removeRow(i: number) {
    const next = rows.slice();
    next.splice(i, 1);
    setRows(next.length ? next : [{ userId: users[0]?.id ?? "", points: 5 }]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return alert("Message is required.");
    if (!rows.length) return alert("At least one recipient.");
    if (total > available)
      return alert(`Total points ${total} exceeds available ${available}.`);

    const res = await fetch("/api/recognitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        recipients: rows.map((r) => ({
          userId: r.userId,
          points: Number(r.points),
        })),
      }),
    });

    if (res.ok) {
      window.location.href = "/feed";
    } else {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Failed to send recognition.");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Message</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What did they do great?"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Recipients</label>
          <button
            type="button"
            onClick={addRow}
            className="text-blue-600 text-sm"
          >
            + Add recipient
          </button>
        </div>

        {rows.map((row, i) => (
          <div key={i} className="flex gap-2 items-center">
            <select
              className="border rounded px-2 py-1"
              value={row.userId}
              onChange={(e) => updateRow(i, { userId: e.target.value })}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName || u.lastName
                    ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
                    : u.email}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={5}
              step={5}
              className="w-24 border rounded px-2 py-1"
              value={row.points}
              onChange={(e) => updateRow(i, { points: Number(e.target.value) })}
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="text-red-600 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-700">
        Total: <b>{total}</b> / Available: <b>{available}</b>
      </div>

      <button
        disabled={!message.trim() || total < 1 || total > available}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Send Stars
      </button>
    </form>
  );
}
