"use client";

import { User } from "@/types/user";
import { useState } from "react";

export default function UsersList({ users }: { users: User[] }) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  function openEditModal(user: User) {
    setSelectedUser(user);
    setOpen(true);
  }

  function closeModal() {
    setSelectedUser(null);
    setOpen(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;

    const res = await fetch(`/api/users/${selectedUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedUser),
    });

    if (res.ok) {
      closeModal();
      location.reload();
    } else {
      alert((await res.json()).error || "Failed to update user");
    }
  }

  return (
    <section className="space-y-4 p-4">
      <h2 className="font-semibold mb-2">Users</h2>
      <ul className="space-y-1">
        {users.map((u) => (
          <li key={u.id} className="flex items-center gap-2">
            <span
              className={`w-64 ${
                u.isActive ? "" : "line-through text-gray-500"
              }`}
            >
              {u.email}
            </span>

            <select
              className="border-2 rounded-xl px-2 py-1"
              value={u.role}
              onChange={(e) =>
                fetch(`/api/users/${u.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ role: e.target.value }),
                }).then((res) => res.ok && location.reload())
              }
              disabled={!u.isActive}
              title={!u.isActive ? "User is deactivated" : undefined}
            >
              <option>EMPLOYEE</option>
              <option>MANAGER</option>
              <option>ADMIN</option>
              <option>SUPER_ADMIN</option>
            </select>

            <button
              onClick={() => openEditModal(u)}
              className="ml-2 text-blue-600"
              disabled={!u.isActive}
            >
              Edit
            </button>

            {u.isActive ? (
              <button
                onClick={() =>
                  fetch(`/api/users/${u.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isActive: false }),
                  }).then((res) => res.ok && location.reload())
                }
                className="ml-2 text-red-600"
                title="Deactivate (remove access)"
              >
                Remove Access
              </button>
            ) : (
              <>
                <button
                  onClick={() =>
                    fetch(`/api/users/${u.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ isActive: true }),
                    }).then((res) => res.ok && location.reload())
                  }
                  className="ml-2 text-green-700"
                  title="Reactivate"
                >
                  Reactivate
                </button>
                <button
                  onClick={() =>
                    fetch(`/api/users/${u.id}`, { method: "DELETE" }).then(
                      (res) => res.ok && location.reload()
                    )
                  }
                  className="ml-2 text-red-700"
                  title="Delete Permanently"
                >
                  Delete Permanently
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Edit Modal */}
      {open && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>

            <form onSubmit={onSubmit} className="flex flex-col gap-3">
              <input
                className="border rounded-xl px-3 py-2"
                type="email"
                value={selectedUser.email}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, email: e.target.value })
                }
                disabled
              />

              <div className="flex gap-2">
                <input
                  className="border rounded-xl px-3 py-2 flex-1"
                  placeholder="First name"
                  value={selectedUser.firstName || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      firstName: e.target.value,
                    })
                  }
                />
                <input
                  className="border rounded-xl px-3 py-2 flex-1"
                  placeholder="Last name"
                  value={selectedUser.lastName || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      lastName: e.target.value,
                    })
                  }
                />
              </div>

              <input
                className="border rounded-xl px-3 py-2"
                placeholder="Preferred name"
                value={selectedUser.preferredName || ""}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    preferredName: e.target.value,
                  })
                }
              />

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Birthday</span>
                <input
                  type="date"
                  className="border rounded-xl px-3 py-2"
                  value={
                    selectedUser.birthday
                      ? new Date(selectedUser.birthday)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      birthday: e.target.value,
                    })
                  }
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Work Anniversary</span>
                <input
                  type="date"
                  className="border rounded-xl px-3 py-2"
                  value={
                    selectedUser.workAnniversary
                      ? new Date(selectedUser.workAnniversary)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      workAnniversary: e.target.value,
                    })
                  }
                />
              </label>

              <input
                className="border rounded-xl px-3 py-2"
                placeholder="Department"
                value={selectedUser.department || ""}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    department: e.target.value,
                  })
                }
              />

              <select
                className="border rounded-xl px-3 py-2"
                value={selectedUser.role}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value })
                }
              >
                <option>EMPLOYEE</option>
                <option>MANAGER</option>
                <option>ADMIN</option>
                <option>SUPER_ADMIN</option>
              </select>

              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded-xl"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
