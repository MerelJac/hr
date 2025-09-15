"use client";

import { useState } from "react";

export default function InviteForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EMPLOYEE");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    if (res.ok) location.reload();
    else alert((await res.json()).error || "Failed to invite");
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2 bg-white rounded-xl p-4">
      <input className="border-2 rounded-xl px-2 py-1" placeholder="email@company.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
      <select className="border-2 rounded-xl px-2 py-1" value={role} onChange={(e)=>setRole(e.target.value)}>
        <option>EMPLOYEE</option>
        <option>MANAGER</option>
        <option>ADMIN</option>
        <option>SUPER_ADMIN</option>
      </select>
      <button className="bg-black text-white px-3 py-1 rounded-xl">Add Invite</button>
    </form>
  );
}
