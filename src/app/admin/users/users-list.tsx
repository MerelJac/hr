"use client";

export default function UsersList({ users }: { users: any[] }) {
  async function setRole(id: string, role: string) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) location.reload();
    else alert((await res.json()).error || "Failed to update role");
  }

  return (
    <section>
      <h2 className="font-semibold mb-2">Users</h2>
      <ul className="space-y-1">
        {users.map((u) => (
          <li key={u.id} className="flex items-center gap-2">
            <span className="w-64">{u.email}</span>
            <select className="border px-2 py-1" value={u.role} onChange={(e)=>setRole(u.id, e.target.value)}>
              <option>EMPLOYEE</option>
              <option>MANAGER</option>
              <option>ADMIN</option>
              <option>SUPER_ADMIN</option>
            </select>
          </li>
        ))}
      </ul>
    </section>
  );
}
