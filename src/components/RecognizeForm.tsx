"use client";
import { useState } from "react";
import GifPicker from "./GifPicker";
import Image from "next/image";
import { RefreshCcw, Trash, UserPlus } from "lucide-react";
import { DepartmentWithUsers } from "@/types/department";
import CoreValues from "./CoreValues";

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
    null,
  );
  const [teamPoints, setTeamPoints] = useState(5);
  const [coreValue, setCoreValue] = useState<string>("");
  const total = rows.reduce((s, r) => s + (Number(r.points) || 0), 0);
  const isOverBudget = total > available;
  const canSubmit = message.trim() && total >= 1 && !isOverBudget;

  function toggleMode() {
    setMode(mode === "user" ? "team" : "user");
    setSelectedTeam(null);
    setRows([{ userId: users[0]?.id ?? "", points: 5 }]);
  }

  function updateRow(
    i: number,
    patch: Partial<{ userId: string; points: number }>,
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

  function handleSelectDepartment(deptId: string) {
    const dept = departments.find((d) => d.id === deptId);
    if (!dept) return;
    setSelectedTeam(dept);
    const newRows = dept.users.map((u) => ({
      userId: u.id,
      points: teamPoints,
    }));
    setRows(newRows);
  }

  function handleTeamPointsChange(newPoints: number) {
    setTeamPoints(newPoints);
    if (!selectedTeam) return;
    setRows((prev) => prev.map((r) => ({ ...r, points: newPoints })));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return alert("Message is required.");
    if (!coreValue.trim()) return alert("Core value is required.");

    if (!rows.length) return alert("At least one recipient.");
    if (total > available)
      return alert(`Total points ${total} exceeds available ${available}.`);
    const res = await fetch("/api/recognitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        gifUrl,
        coreValue: coreValue,
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
    <form
      onSubmit={submit}
      className="space-y-5 p-5 rounded-2xl bg-white shadow-sm border border-gray-100"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-lg">⭐</span>
          <span className="text-sm font-medium text-gray-700">
            <span className="text-indigo-600 font-semibold">{available}</span>{" "}
            stars available
          </span>
        </div>
        <button
          type="button"
          onClick={toggleMode}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 bg-gray-50 hover:bg-indigo-50 rounded-full px-3 py-1.5 transition-all"
        >
          <RefreshCcw size={12} />
          {mode === "user" ? "Switch to Team" : "Switch to User"}
        </button>
      </div>

      {/* Recipients */}
      <div className="space-y-2">
        {mode === "user" ? (
          <>
            {rows.map((row, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-2.5 rounded-xl transition-shadow hover:shadow-sm"
              >
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  To
                </span>

                <select
                  className="flex-1 min-w-0 bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
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

                <span className="text-xs text-gray-400">·</span>

                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={5}
                    step={5}
                    className="w-16 border border-indigo-200 bg-white rounded-lg px-2 py-1.5 text-sm text-center font-medium text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                    value={row.points}
                    onChange={(e) =>
                      updateRow(i, { points: Number(e.target.value) })
                    }
                  />
                  <span className="text-base">⭐</span>
                </div>

                <div className="flex items-center gap-1 ml-auto">
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
                      title="Remove"
                    >
                      <Trash size={14} />
                    </button>
                  )}
                  {i === rows.length - 1 && (
                    <button
                      type="button"
                      onClick={addRow}
                      className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 transition-all"
                      title="Add recipient"
                    >
                      <UserPlus size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <select
              defaultValue=""
              onChange={(e) => handleSelectDepartment(e.target.value)}
              className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
            >
              <option value="" disabled>
                Select a team…
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {selectedTeam && (
              <>
                <div className="flex items-center gap-2.5 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5">
                  <span className="text-sm text-gray-500">
                    Each member receives
                  </span>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    className="w-16 border border-indigo-200 bg-white rounded-lg px-2 py-1.5 text-sm text-center font-medium text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                    value={teamPoints}
                    onChange={(e) =>
                      handleTeamPointsChange(Number(e.target.value))
                    }
                  />
                  <span>⭐</span>
                </div>

                <div className="border border-gray-100 rounded-xl bg-gray-50 divide-y divide-gray-100 max-h-44 overflow-y-auto">
                  {selectedTeam.users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 px-3 py-2"
                    >
                      <Image
                        src={u.profileImage ?? "/default-profile-image.svg"}
                        alt={`${u.firstName} ${u.lastName}`}
                        width={32}
                        height={32}
                        className="rounded-full w-8 h-8 border border-indigo-200 object-cover"
                      />
                      <span className="text-sm text-gray-700">
                        {u.firstName} {u.lastName}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Message + GIF composer */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <textarea
          className="w-full px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 resize-none focus:outline-none bg-transparent"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            mode === "user"
              ? "Give someone a shoutout! What did they do great?"
              : "Give this team a shoutout! What did they do great?"
          }
        />

        {gifUrl && (
          <div className="px-4 pb-3 relative max-w-fit">
            <Image
              src={gifUrl}
              alt="Selected GIF"
              width={150}
              height={150}
              unoptimized
              className="max-h-36 rounded-lg border border-gray-100"
            />
            <button
              type="button"
              onClick={() => setGifUrl(null)}
              className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-0.5 rounded-md transition"
            >
              Remove
            </button>
          </div>
        )}

        <div className="flex justify-between items-center px-3 py-2 border-t border-gray-100 bg-gray-50">
          <GifPicker onSelect={(url) => setGifUrl(url)} />
          {isOverBudget && (
            <span className="text-xs text-red-500 font-medium">
              Over budget by {total - available} ⭐
            </span>
          )}
        </div>
      </div>
      {/* Core Value (required) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Core Value{" "}
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "LIGHT", label: "🙌 Be the light" },
            { value: "RIGHT", label: "🏆 Do the right thing" },
            { value: "SERVICE", label: "🤝 Selfless Service" },
            {
              value: "PROBLEM",
              label: "💛 Proactive Positive Problem Solving",
            },
            { value: "EVOLUTION", label: " 🌱 Embrace Evolution" },
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCoreValue(coreValue === value ? "" : value)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                coreValue === value
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        disabled={!canSubmit}
        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all
          bg-indigo-500 text-white hover:bg-indigo-600 active:scale-[0.98]
          disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {canSubmit ? `✨ Send ${total} Stars` : "Send Stars"}
      </button>
    </form>
  );
}
