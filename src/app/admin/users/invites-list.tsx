"use client";

export default function InvitesList({ invites }: { invites: any[] }) {
  async function remove(email: string) {
    const res = await fetch(`/api/invites?email=${encodeURIComponent(email)}`, { method: "DELETE" });
    if (res.ok) location.reload();
    else alert((await res.json()).error || "Failed to remove invite");
  }
  return (
    <section>
      <h2 className="font-semibold mb-2">Pending Invites</h2>
      <ul className="space-y-1">
        {invites.map((i) => (
          <li key={i.id} className="flex items-center gap-2">
            <span className="w-64">{i.email}</span>
            <span className="w-32">{i.role}</span>
            <button onClick={()=>remove(i.email)} className="text-red-600">Remove</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
