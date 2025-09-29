"use client";

import { Rocket } from "lucide-react";
import { useState } from "react";

type SimpleUser = { id: string; label: string };
type Already = { eom: boolean; linkedin: boolean };

export default function NominationModal({
  users,
  already = { eom: false, linkedin: false },
}: {
  users: SimpleUser[];
  already?: Already;
}) {
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"EOM">("EOM");

  // EOM form state
  const [nomineeId, setNomineeId] = useState(users[0]?.id || "");
  const [reason, setReason] = useState("");

  function canSubmitEom() {
    return !already.eom && nomineeId && reason.trim().length > 0;
  }

  async function safeReadError(res: Response) {
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const j = await res.json();
        return j?.error || JSON.stringify(j);
      } else {
        const t = await res.text();
        return t || `HTTP ${res.status}`;
      }
    } catch {
      return `HTTP ${res.status}`;
    }
  }

  async function submitEOM(e: React.FormEvent) {
    e.preventDefault();
    if (already.eom) {
      setMessage("You’ve already submitted Employee of the Month this month.");
      return;
    }
    const res = await fetch("/api/nominations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "EOM", nomineeId, reason }),
    });
    if (res.ok) {
      setOpen(false);
      location.reload();
    } else {
      setMessage((await safeReadError(res)) || "Failed");
    }
  }

  const bothBlocked = already.eom && already.linkedin;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border-2 border-white bg-red-600 text-white px-3 py-2 disabled:opacity-50 flex align-center gap-2 justify-center items-center"
        disabled={bothBlocked}
        title={
          bothBlocked
            ? "You’ve already submitted both nominations this month."
            : undefined
        }
      >
        <Rocket size={18} />
        Challenges
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Nominate Employee of the Month
              </h2>

              {message && (
                <div className="text-red-600 text-sm mr-4">{message}</div>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-500">
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => !already.eom && setType("EOM")}
                disabled={already.eom}
                className={`px-3 py-1 rounded ${
                  type === "EOM" ? "bg-black text-white" : "bg-gray-100"
                } ${already.eom ? "opacity-50 cursor-not-allowed" : ""}`}
                title={
                  already.eom
                    ? "You’ve already submitted EOM this month."
                    : undefined
                }
              >
                Employee of the Month {already.eom && "✓"}
              </button>
            </div>

            {/* Forms */}

            <form className="space-y-3" onSubmit={submitEOM}>
              <div>
                <label className="block text-sm mb-1">Nominee</label>
                <select
                  className="w-full border-2 border-blue rounded-lg px-2 py-1"
                  value={nomineeId}
                  onChange={(e) => setNomineeId(e.target.value)}
                  disabled={already.eom}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Reason</label>
                <textarea
                  className="w-full border-2 border-blue rounded-lg px-3 py-2"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why are you nominating this person?"
                  disabled={already.eom}
                />
              </div>
              <button
                className="bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50"
                disabled={!canSubmitEom()}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
