"use client";

import { Invite } from "@/types/invite";
import { Mail, RefreshCw, Trash } from "lucide-react";

export default function InvitesList({ invites }: { invites: Invite[] }) {
  async function remove(email: string) {
    const res = await fetch(`/api/invites?email=${encodeURIComponent(email)}`, { method: "DELETE" });
    if (res.ok) location.reload();
    else alert((await res.json()).error || "Failed to remove invite");
  }

  function resendAll() {
    fetch("/api/invites", { method: "GET" })
      .then((res) => res.json())
      .then((data) => { if (data.ok) alert("Invite resent to all invitations"); else alert(data.error || "Failed to resend invite"); })
      .catch((err) => alert("Error resending invite: " + err));
  }

  function resendOne(id: string, email: string) {
    fetch(`/api/invites/resend-invite/${id}`, { method: "GET" })
      .then((res) => res.json())
      .then((data) => { if (data.ok) alert(`Invite resent to ${email}`); else alert(data.error || "Failed to resend invite"); })
      .catch((err) => alert("Error resending invite: " + err));
  }

  return (
    <section className="space-y-4 p-6">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Mail size={15} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-gray-700">Pending Invites</h2>
            {invites.length > 0 && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{invites.length}</span>
            )}
          </div>
          <button
            onClick={resendAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl transition-all"
          >
            <RefreshCw size={12} />
            Resend All
          </button>
        </div>

        {/* List */}
        {invites.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Mail size={18} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">No pending invites.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {invites.map((i) => (
              <li key={i.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{i.email}</p>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 shrink-0">
                  {i.role}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => resendOne(i.id, i.email)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                    title="Resend invite"
                  >
                    <RefreshCw size={13} />
                  </button>
                  <button
                    onClick={() => remove(i.email)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Remove invite"
                  >
                    <Trash size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}