"use client";

import { useState } from "react";

type SimpleUser = { id: string; label: string };

export default function NominationModal({
  users
}: {
  users: SimpleUser[];
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"EOM" | "LINKEDIN">("EOM");

  // EOM form state
  const [nomineeId, setNomineeId] = useState(users[0]?.id || "");
  const [reason, setReason] = useState("");

  // LinkedIn form state
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<File | null>(null);


  async function submitEOM(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/nominations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "EOM", nomineeId, reason }),
    });
    if (res.ok) { setOpen(false); location.reload(); }
    else alert((await res.json()).error || "Failed");
  }

  async function submitLinkedIn(e: React.FormEvent) {
    e.preventDefault();
    if (!image) return alert("Please pick an image.");
    const fd = new FormData();
    fd.set("type", "LINKEDIN");
    fd.set("caption", caption);
    fd.set("image", image);
    const res = await fetch("/api/nominations", { method: "POST", body: fd });
    if (res.ok) { setOpen(false); location.reload(); }
    else alert((await res.json()).error || "Failed");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded bg-purple-600 text-white px-3 py-2"
      >
        Monthly Nominations
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create Nomination</h2>
              <button onClick={() => setOpen(false)} className="text-gray-500">✕</button>
            </div>

            <div className="flex gap-2 text-sm">
              <button
                onClick={() => setType("EOM")}
                className={`px-3 py-1 rounded ${type==="EOM"?"bg-black text-white":"bg-gray-100"}`}
              >
                Employee of the Month
              </button>
              <button
                onClick={() => setType("LINKEDIN")}
                className={`px-3 py-1 rounded ${type==="LINKEDIN"?"bg-black text-white":"bg-gray-100"}`}
              >
                LinkedIn Post
              </button>
            </div>

            {type === "EOM" ? (
              <form className="space-y-3" onSubmit={submitEOM}>
                <div>
                  <label className="block text-sm mb-1">Nominee</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={nomineeId}
                    onChange={(e) => setNomineeId(e.target.value)}
                  >
                    {users.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Reason</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why are you nominating this person?"
                  />
                </div>
                <button className="bg-black text-white px-4 py-2 rounded">Submit EOM</button>
              </form>
            ) : (
              <form className="space-y-3" onSubmit={submitLinkedIn}>
                <div>
                  <label className="block text-sm mb-1">Caption</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="What is this post about?"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Super Admin must approve. +10 points on approval.</p>
                </div>
                <button className="bg-black text-white px-4 py-2 rounded">Submit LinkedIn</button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
