"use client";

import { useState } from "react";
import GifPicker from "./GifPicker";
import Image from "next/image";
import { RefreshCcw, Trash, User } from "lucide-react";
import { DepartmentWithUsers } from "@/types/department";

type SimpleUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
};

export default function RecognizeForm({
  users,
  departments,
  available,
}: {
  users: SimpleUser[];
  departments: DepartmentWithUsers[];
  available: number;
}) {
  const [rows, setRows] = useState<{ userId: string; points: number }[]>([
    { userId: users[0]?.id ?? "", points: 5 },
  ]);
  const [message, setMessage] = useState("");
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"user" | "team">("user");
  const [selectedTeam, setSelectedTeam] = useState<DepartmentWithUsers | null>(
    null
  );
  const [teamPoints, setTeamPoints] = useState(5);

  const total = rows.reduce((s, r) => s + (Number(r.points) || 0), 0);

  function toggleMode() {
    setMode(mode === "user" ? "team" : "user");
    setSelectedTeam(null);
    setRows([{ userId: users[0]?.id ?? "", points: 5 }]);
  }

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

  // 👇 When a department is selected, display its members
  function handleSelectDepartment(deptId: string) {
    const dept = departments.find((d) => d.id === deptId);
    if (!dept) return;
    setSelectedTeam(dept);

    // Create one row per user in that department
    const newRows = dept.users.map((u) => ({
      userId: u.id,
      points: teamPoints,
    }));
    setRows(newRows);
  }

  // 👇 Update all points for team equally
  function handleTeamPointsChange(newPoints: number) {
    setTeamPoints(newPoints);
    if (!selectedTeam) return;
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        points: newPoints,
      }))
    );
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
        gifUrl,
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
    <form onSubmit={submit} className="space-y-4 p-4 rounded-xl bg-white">
      <section className="flex flex-row justify-between items-center">
        <div className="text-sm text-gray-700">
          You have <b>{available}</b> stars to give!
        </div>
        <button type="button" className="flex flex-row gap-2 items-center text-sm" onClick={toggleMode}>
          <RefreshCcw size={16}/>
          {mode === "user" ? "User Mode" : "Team Mode"}
        </button>
      </section>

      <div>
        <div className="space-y-3 pb-4">
          {mode === "user" ? (
            // USER MODE
            <div className="flex flex-col gap-2">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-center gap-3 bg-blue-50 px-3 py-2 rounded-lg shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-grow items-center gap-3">
                    <span className="text-blue-600 font-medium">@</span>

                    <select
                      className="bg-white border border-blue-200 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300 transition"
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

                    <span className="text-gray-500 text-sm">for</span>

                    <input
                      type="number"
                      min={5}
                      step={5}
                      className="w-20 border border-blue-200 bg-white rounded-md px-2 py-1 text-sm text-center focus:ring-2 focus:ring-blue-300 transition"
                      value={row.points}
                      onChange={(e) =>
                        updateRow(i, { points: Number(e.target.value) })
                      }
                    />

                    <span className="text-yellow-500 font-semibold">⭐</span>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Remove"
                      >
                        <Trash size={18} />
                      </button>
                    )}
                    {i === rows.length - 1 && (
                      <button
                        type="button"
                        onClick={addRow}
                        className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                        title="Add another"
                      >
                        <span className="text-lg leading-none">+</span>
                        <User size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // TEAM MODE
            <div className="flex flex-col gap-3">
              <select
                defaultValue=""
                onChange={(e) => handleSelectDepartment(e.target.value)}
                className="bg-white border border-blue-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 transition"
              >
                <option value="" disabled>
                  Select a team to shout out...
                </option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              {selectedTeam && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">
                      Each member receives:
                    </span>
                    <input
                      type="number"
                      min={5}
                      step={5}
                      className="w-20 border border-blue-200 rounded-md px-2 py-1 text-sm text-center"
                      value={teamPoints}
                      onChange={(e) =>
                        handleTeamPointsChange(Number(e.target.value))
                      }
                    />
                    <span className="text-yellow-500 font-semibold">⭐</span>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-1 max-h-40 overflow-y-auto">
                    {selectedTeam.users.map((u) => (
                      <span
                        key={u.id}
                        className="flex flex-row items-center gap-2"
                      >
                        <Image
                          src={u.profileImage ?? "/default-profile-image.svg"}
                          alt="Selected GIF"
                          width={64}
                          height={64}
                          className="rounded-full w-12 h-12 border-2 border-blue-500"
                        />
                        <p key={u.id} className="text-sm text-gray-700">
                          {u.firstName} {u.lastName}
                        </p>
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Message + GIF */}
        <div
          id="textarea"
          className="w-full border-2 border-blue rounded-lg px-3 py-2 bg-blue-100"
        >
          <textarea
            className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-300"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              mode === "user"
                ? "Give someone a shoutout! What did they do great?"
                : "Give this team a shoutout! What did they do great?"
            }
          />
          <div className="flex justify-end gap-4 items-start">
            <GifPicker onSelect={(url) => setGifUrl(url)} />
          </div>
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
        </div>
      </div>

      <button
        disabled={!message.trim() || total < 1 || total > available}
        className={`px-4 py-2 rounded-lg text-white ${
          message.trim() ? "bg-blue hover:bg-blue" : "bg-gray-400"
        } disabled:bg-gray-400 disabled:cursor-not-allowed`}
      >
        {message.trim() ? `Send ${total} Stars` : "Send Stars"}
      </button>
    </form>
  );
}
