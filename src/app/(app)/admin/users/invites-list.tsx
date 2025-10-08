"use client";

import { Invite } from "@/types/invite";

export default function InvitesList({ invites }: { invites: Invite[] }) {
  async function remove(email: string) {
    const res = await fetch(`/api/invites?email=${encodeURIComponent(email)}`, {
      method: "DELETE",
    });
    if (res.ok) location.reload();
    else alert((await res.json()).error || "Failed to remove invite");
  }
  return (
    <section className="space-y-4 p-4">
      <h2 className="font-semibold mb-2">Pending Invites</h2>
      <ul className="space-y-1">
        {invites.map((i) => (
          <li key={i.id} className="flex items-center gap-2">
            <span className="w-64">{i.email}</span>
            <span className="w-32">{i.role}</span>
            <button onClick={() => remove(i.email)} className="text-red-600">
              Remove
            </button>

            <button
              onClick={() =>
                fetch(`/api/invites/resend-invite/${i.id}`, { method: "GET" })
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.ok) alert(`Invite resent to ${i.email}`);
                    else alert(data.error || "Failed to resend invite");
                  })
                  .catch((err) => alert("Error resending invite: " + err))
              }
              className="ml-2 text-blue-600 hover:text-blue-800"
              title="Resend Invite"
            >
              Resend Invite
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
